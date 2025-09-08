import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import APIService from "../../../service/API";
import MainLayout from "../../../components/layout/MainLayout";
import { PaymentsInterface } from "../../../service/models/Payments.model";
import { CheckCircle } from "@mui/icons-material";
import NgIf from "../../../components/NgIf";
import CommonService from "../../../service/CommonService";
import { useNavigate } from "react-router-dom";
let pendingInstallmentId = 0;
const PaymentsListing: React.FC = () => {
  const [allPaymentList, setAllPaymentList] = useState<PaymentsInterface[]>([]);
  const [isListloading, setIsListLoading] = useState<boolean>(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [errorMsg, setError] = useState<string>("");
  const [successMsg, setSuccess] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const didRunRef = useRef(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
    const fetchPayments = async () => {
      try {
        setIsListLoading(true);
        const allPaymentList = await APIService.getAllPayments();
        setAllPaymentList(allPaymentList);
        setIsListLoading(false);
      } catch (err) {
        setIsListLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (moduleType:string,id: number) => {
    if(moduleType=='loan'&&CommonService.checkPermission(['View Loans']))
    navigate(`/loan-details/${btoa(id.toString())}`);
    else if(moduleType=='ddr'&&CommonService.checkPermission(['Manage Dealers']))
    navigate(`/dealer-details/${btoa(String(id.toString()))}`);
     else {
      setError("You don't have permission..!");
     }
  };

  const handleConfirmDialog = async () => {
    try {
      setIsFormLoading(true);
      await APIService.approvePendingPayments({
        pendingInstallmentId: pendingInstallmentId,
      });
      setIsConfirmModalOpen(false);
      setSuccess("Approved successfully..!");
      setIsFormLoading(false);
          setIsListLoading(true);
        const allPaymentList = await APIService.getAllPayments();
        setAllPaymentList(allPaymentList);
        setIsListLoading(false);
    } catch (error: any) {
      setIsFormLoading(false);
      setError(
        error?.response?.data?.message ??
          `Failed to approve payment. Please try again..!`
      );
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Payments Management
        </Typography>
        <Box display="none" justifyContent="flex-end">
          <TextField
            placeholder="Search by txt id"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        {isListloading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount Paid</TableCell>
                    <TableCell>Loan No</TableCell>
                    <TableCell>Dealer</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell
                      onClick={() => {
                        pendingInstallmentId = 89;
                        setIsConfirmModalOpen(true);
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allPaymentList
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((paymentItem) => (
                      <TableRow hover key={paymentItem?.id}>
                        <TableCell>
                          {CommonService.formatDate(paymentItem?.paidDate)}
                        </TableCell>
                        <TableCell>{paymentItem?.amountPaid}</TableCell>
                        <TableCell>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() =>
                              handleView("loan", paymentItem?.loan?.id ?? 0)
                            }
                            sx={{ color: "#1e3a8a" }}
                          >
                            {paymentItem?.loan?.loanNumber}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {paymentItem?.loan?.dealer?.id &&
                            paymentItem?.loan?.dealer?.id > 0 && (
                              <Button
                                variant="text"
                                size="small"
                                onClick={() =>
                                  handleView(
                                    "ddr",
                                    paymentItem?.loan?.dealer?.id ?? 0
                                  )
                                }
                                sx={{ color: "#1e3a8a" }}
                              >
                                {paymentItem?.loan?.dealer?.dealershipName}-(
                                {paymentItem?.loan?.dealer?.dealerCode})
                              </Button>
                            )}
                        </TableCell>
                        <TableCell>{paymentItem?.remarks}</TableCell>
                        <TableCell>{paymentItem?.status}</TableCell>

                        <TableCell>
                          <NgIf
                            condition={
                              paymentItem?.status == "Pending" &&
                              CommonService.checkPermission([
                                "Approve Loan Payment",
                              ])
                            }
                          >
                            <Button
                              variant="outlined"
                              color="success"
                              onClick={() => {
                                pendingInstallmentId = paymentItem?.id;
                                setIsConfirmModalOpen(true);
                              }}
                              startIcon={
                                <CheckCircle color="success" fontSize="small" />
                              }
                              size="small"
                            >
                              Approve
                            </Button>
                          </NgIf>
                        </TableCell>
                      </TableRow>
                    ))}
                  {allPaymentList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No Payments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 50, 100]}
              component="div"
              showFirstButton
              count={allPaymentList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              showLastButton
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      <Dialog
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      >
        <DialogTitle>
          <Typography sx={{ fontSize: "16px" }}>
            Do you want to approve this payment ?
          </Typography>
        </DialogTitle>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setIsConfirmModalOpen(false)}
            color="primary"
            variant="outlined"
          >
            No
          </Button>
          <Button
            onClick={() => handleConfirmDialog()}
            color="primary"
            variant="contained"
            disabled={isFormLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={3000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {errorMsg}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default PaymentsListing;
