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
  Grid,
  Tooltip,
  Stack,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import {
  DdrInterface,
  DdrListingProps,
  ddrStatusCountsList,
  ddrStatusList,
} from "../../../service/models/Ddr.model";
import APIService from "../../../service/API";
import { Visibility } from "@mui/icons-material";
import NgIf from "../../../components/NgIf";
import CommonService from "../../../service/CommonService";

const DdrListing: React.FC<DdrListingProps> = () => {
  const [allDdrList, setDdrList] = useState<DdrInterface[]>([]);
  const [filteredDdrs, setFilteredDdrs] = useState<DdrInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<number>(0); // Default to Pending Approval (assuming status 1)
  
  const navigate = useNavigate();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
    const fetchDdrs = async () => {
      try {
        setLoading(true);
        const allDDrList = await APIService.getAllDdrs();
        setDdrList(allDDrList);
        const pendingApprovalDdrs = allDDrList.filter((ddrItem) => ddrItem?.status === 0);
        setFilteredDdrs(pendingApprovalDdrs);
        
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchDdrs();
  }, []);

  useEffect(() => {
    let results = allDdrList;
    
    // Apply status filter first
    if (currentStatusFilter > -1) {
      results = results.filter((ddrItem) => ddrItem?.status === currentStatusFilter);
    }
    
    // Then apply search filter
    if (searchTerm) {
      results = results.filter((ddrItem) =>
        ddrItem?.ddrNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredDdrs(results);
    setPage(0);
  }, [searchTerm, allDdrList, currentStatusFilter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const statusBehalfFilterDdrList = (status: number) => {
    setCurrentStatusFilter(status);
    setPage(0);
  };

  const returnCountBasisOfStatus = (status: number) => {
    let statusCounts = 0;
    if (status == -1) {
      return allDdrList?.length;
    }
    statusCounts = allDdrList.filter((d) => d?.status == status).length;
    return statusCounts;
  };

  return (
    <MainLayout>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            DDR Management
          </Typography>
        </Box>
        <Box sx={{ gap: 2, display: "flex" }}>
          <TextField
            placeholder="Search by DDR Number "
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate("/ddr-onAction")}
          >
            Add New DDR
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {ddrStatusCountsList.map((statusItem) => (
          CommonService.checkPermission(statusItem?.permissionList) && (
            <Box
              key={statusItem.name}
              onClick={() => statusBehalfFilterDdrList(statusItem.value)}
              sx={{
                borderRadius: 2,
                m: 1,
                bgcolor: currentStatusFilter === statusItem.value ? "#e3f2fd" : "#fff",
                boxShadow: currentStatusFilter === statusItem.value 
                  ? "0 4px 12px rgba(25,118,210,0.15)" 
                  : "0 4px 12px rgba(0,0,0,0.05)",
                cursor: "pointer",
                border: currentStatusFilter === statusItem.value ? "2px solid #1976d2" : "none",
              }}
            >
              <Box sx={{ p: 1, display: "flex" }}>
                <Typography
                  display="flex"
                  alignItems={"center"}
                  variant="body2"
                  color="text.secondary"
                >
                  {statusItem.name}
                </Typography>
                <Typography sx={{ fontWeight: "bold", ml: 1 }}>
                  {returnCountBasisOfStatus(statusItem.value)}
                </Typography>
              </Box>
            </Box>
          )
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>DDR Number</TableCell>
                    <TableCell>Dealer</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Interest Rate</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDdrs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((ddrItem) => (
                      <TableRow hover key={ddrItem.id}>
                        <TableCell>{ddrItem?.ddrNumber}</TableCell>
                        <TableCell>
                          {ddrItem?.dealer?.dealershipName && (
                            <Box>
                              {ddrItem?.dealer?.dealershipName}&nbsp; (
                              {ddrItem?.dealer?.dealerCode})
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          {ddrItem.vehicleInfo ? (
                            <Tooltip
                              title={`${ddrItem?.vehicleInfo?.make} ${ddrItem?.vehicleInfo?.model} (${ddrItem?.vehicleInfo?.year})`}
                            >
                              <span>
                                {ddrItem.vehicleInfo.registrationNumber}
                              </span>
                            </Tooltip>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          {ddrItem.amount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </TableCell>
                        <TableCell>{ddrItem.interestRate ?? 0}%</TableCell>
                        <TableCell>
                          {ddrStatusList[ddrItem?.status ?? 0].name}
                          {ddrStatusList[ddrItem?.status ?? 0].name ==
                            "Rejected" && " (" + ddrItem?.rejectedReason + ")"}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <NgIf
                              condition={CommonService.checkPermission([
                                "View DDR",
                              ])}
                            >
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(`/ddr-details/${btoa(String(ddrItem.id))}`)
                                  }
                                  sx={{ color: "#1e3a8a" }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </NgIf>

                            <NgIf
                              condition={
                                ddrItem.status == 0 &&
                                CommonService.checkPermission(["Edit DDR"])
                              }
                            >
                              <Tooltip title="Edit DDR">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(`/ddr-onAction/${btoa(String(ddrItem.id))}`)
                                  }
                                  sx={{ color: "#2e7d32" }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </NgIf>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredDdrs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 2 }}>
                        No ddrs found
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
              count={filteredDdrs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              showLastButton
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default DdrListing;