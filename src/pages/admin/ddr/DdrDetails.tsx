import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Breadcrumbs,
  Link,
  Avatar,
  Tooltip,
  Dialog,
  DialogActions,
  IconButton,
  DialogTitle,
  DialogContent,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MainLayout from "../../../components/layout/MainLayout";
import APIService from "../../../service/API";
import { DdrApproveAndRejectInterface, DdrDocumentListInterface, DdrInterface, ddrStatusList } from "../../../service/models/Ddr.model";
import CommonService from "../../../service/CommonService";
import { Cancel, CheckCircle, Close } from "@mui/icons-material";
import { formatISO } from "date-fns";
import NgIf from "../../../components/NgIf";
const decodedId:string[]=[]
const maxDisbursmentDate = new Date();
const DdrDetails: React.FC = () => {
  const { encodedId } = useParams<{ encodedId: string }>();
  const [allDdrDetails, setDdrDetails] = useState<DdrInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock documents data
  const [allDocuments, setAllDocumentsList] = useState<DdrDocumentListInterface[]>([]);
  const [statusType, setStatusType] = useState<string>("");
  const [isApproveAndRejectDialogOpen, setApproveAndRejectDialog] =
    useState<boolean>(false);
  const [approveAndRejectAutoFillData, setApproveAndRejectAutoFillData] =
    useState<DdrApproveAndRejectInterface>({});
  const [approvalFormStep, setApprovalFormStep] = useState<number>(0);
  const [selectedDdrDetails, setSelectedDdrDetails] =
          useState<DdrInterface | null>();
  const didRunRef = useRef(false);
  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
 if (!encodedId) return;
decodedId.unshift(atob(String(encodedId)))
    const fetchDdrDetails = async () => {
    
      const allDdrDocuments = await APIService.getDdrDocumentsById(
        parseInt(decodedId?.[0])
      );
      setAllDocumentsList(allDdrDocuments);
      try {
        setLoading(true);
        const data = await APIService.getDdrById(Number(decodedId?.[0]));

        setDdrDetails(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchDdrDetails();
  },[encodedId]);


  
  const openApproveAndRejectDialog = async (
    ddrRowData: DdrInterface,
    statusType: string
  ) => {
    setApprovalFormStep(0);
    if (statusType == "approve") {
      const withdrawDate = new Date(
        ddrRowData?.dateOfWithdraw ?? ""
      ).toISOString();
      const dueDate = new Date(ddrRowData?.dueDate ?? "").toISOString();
      const autoFillData = await APIService.getApproveLoanCalculateData({
        dealerId: ddrRowData?.dealerId,
        startDate: withdrawDate,
        endDate: dueDate,
        principalAmount: ddrRowData?.amount ?? 0,
      });
      setApproveAndRejectAutoFillData({ ...autoFillData });
      setStatusType(statusType);
      setApproveAndRejectDialog(true);
      const formatedDate = (date: string) =>
        date ? formatISO(new Date(date)).split("T")[0] : "";
      setSelectedDdrDetails({
        ...ddrRowData,
        dateOfWithdraw: formatedDate(ddrRowData?.dateOfWithdraw ?? ""),
        dueDate: formatedDate(ddrRowData?.dueDate ?? ""),
        selectedProcessingFee: autoFillData.processingFee ?? 0,
        suggestedProcessingFee: autoFillData.processingFee ?? 0,
      });
    } else {
      setStatusType(statusType);
      setApproveAndRejectDialog(true);
      setApproveAndRejectAutoFillData({
        rejectRemakrs: "",
      });
    }
  };

  const approveOrRejectApiMethod = async () => {
    try {
      if (statusType == "approve") {
        if (selectedDdrDetails && !selectedDdrDetails?.dateOfWithdraw) {
          setErrorMsg("Please select date");
          return;
        }
        await APIService.updateDDR(
          selectedDdrDetails?.id ?? 0,
          selectedDdrDetails ?? allDdrDetails!
        );
        await APIService.changeStatus(
          selectedDdrDetails?.id ?? 0,
          statusType,
          ""
        );
        navigate("/loan-listing");
      } else {
        if (!approveAndRejectAutoFillData?.rejectRemakrs) {
          setErrorMsg("Please enter remarks ..!");
          return;
        }
        await APIService.changeStatus(
          Number(decodedId?.[0]),
          statusType,
          approveAndRejectAutoFillData?.rejectRemakrs ?? ""
        );
      }

      setLoading(true);
      let allDDrList = await APIService.getDdrById(Number(decodedId?.[0]));
      setDdrDetails(allDDrList);
      setLoading(false);
      setApproveAndRejectDialog(false);
    } catch (error) {
      setErrorMsg(`Failed to ${statusType}. Please try again later...!`);
    } finally {
      setLoading(false);
    }
  };

   const handleApproveForm = (field: string, value: string) => {
    if (field == "processingFee") {
      approveAndRejectAutoFillData.gst = Math.round(
        (Number(value) ?? 0) * 0.18
      );
      approveAndRejectAutoFillData.totalPayableAmount =
        Math.round(approveAndRejectAutoFillData.disbursementAmount ?? 0) +
        (approveAndRejectAutoFillData?.interestCharge ?? 0) +
        (Number(value) ?? 0) +
        (approveAndRejectAutoFillData.gst ?? 0);

      if (selectedDdrDetails)
        setSelectedDdrDetails({
          ...selectedDdrDetails,
          selectedProcessingFee: parseFloat(value) ?? 0,
          gstOnProcessingFee: 18,
          suggestedProcessingFee:
            approveAndRejectAutoFillData?.processingFee ?? 0,
        });
    } else if (field == "dateOfWithdraw") {
      let dueDate = "";
      if (value) {
        dueDate = new Date(
          new Date(value).setDate(new Date(value).getDate() + 59)
        )
          .toISOString()
          .split("T")[0];
      }
      if (selectedDdrDetails)
        setSelectedDdrDetails({
          ...selectedDdrDetails,
          dateOfWithdraw: value,
          dueDate: dueDate,
        });
    } else if (field == "utrNumber") {
      if (selectedDdrDetails) {
        const updated = {
          ...selectedDdrDetails,
          utrNumber: value,
        };
        setSelectedDdrDetails(updated);
      }
    } else {
      setApproveAndRejectAutoFillData({
        ...approveAndRejectAutoFillData,
        [field]: value,
      });
    }
  };
  const handleApproveNextButton = async() => {
    if (approvalFormStep == 0) {
      if (selectedDdrDetails && !selectedDdrDetails?.dateOfWithdraw) {
          setErrorMsg("Please select date");
          return;
        }
        await APIService.updateDDR(
          selectedDdrDetails?.id ?? 0,
          selectedDdrDetails ?? allDdrDetails!
        );
     await APIService.updateDdrStatusChanged(Number(decodedId?.[0]),4)
       setLoading(true);
      let allDDrList = await APIService.getDdrById(Number(decodedId?.[0]));
      setDdrDetails(allDDrList);
      setLoading(false);
      setApproveAndRejectDialog(false);
    }
    else approveOrRejectApiMethod();
  };
  const handleViewDocument = (filePath: string) => {
    window.open(filePath, '_blank');
  };


  if (loading) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }


  return (
    <MainLayout>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </Link>
        <Link
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/ddr-listing")}
        >
          DDR
        </Link>
        <Typography color="text.primary">
          DDR #{allDdrDetails?.ddrNumber}
        </Typography>
      </Breadcrumbs>

      {/* Header with back button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/ddr-listing")}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            DDR Details
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {allDdrDetails?.status == 4 && (
            <NgIf
              condition={CommonService.checkPermission(["Disbursement Processed DDR QUEUE"])}
            >
              <Button
                variant="outlined"
                color="success"
                onClick={() => {
                  openApproveAndRejectDialog(allDdrDetails, "approve");
                  setTimeout(() => {
                    setApprovalFormStep(1);
                  }, 100);
                }}
                startIcon={<CheckCircle color="success" fontSize="small" />}
                size="small"
              >
                Process Disbursement
              </Button>
            </NgIf>
          )}

          {allDdrDetails?.status == 0 && (
            <>
              <NgIf
                condition={CommonService.checkPermission([
                  "Approved DDR QUEUE",
                ])}
              >
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() =>
                    openApproveAndRejectDialog(allDdrDetails, "approve")
                  }
                  startIcon={<CheckCircle color="success" fontSize="small" />}
                  sx={{ mr: 2 }}
                  size="small"
                >
                  Approve
                </Button>
              </NgIf>

              <NgIf
                condition={CommonService.checkPermission([
                  "Rejected DDR QUEUE",
                ])}
              >
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    openApproveAndRejectDialog(allDdrDetails, "reject")
                  }
                  startIcon={<Cancel color="error" fontSize="small" />}
                  size="small"
                >
                  Reject
                </Button>
              </NgIf>
            </>
          )}
        </Box>
      </Box>

      <Card
        sx={{
          borderRadius: 2,
          mb: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{ width: 60, height: 60, bgcolor: "#1e3a8a", mr: 2 }}
                >
                  ₹
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    DDR #{allDdrDetails?.ddrNumber}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Dealer:
                    </Typography>
                    <Link
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/dealer-details/${allDdrDetails?.dealerId}`)
                      }
                    >
                      {allDdrDetails?.dealer?.dealershipName ||
                        "Unknown Dealer"}
                      &nbsp;(
                      {allDdrDetails?.dealer?.dealerCode ||
                        "Unknown Dealer Code"}
                      )
                    </Link>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Chip
                label={`${ddrStatusList[allDdrDetails?.status ?? 0].name} ${
                  allDdrDetails?.rejectedReason
                    ? "(" + allDdrDetails?.rejectedReason + ")"
                    : ""
                }`}
                color={
                  ddrStatusList[allDdrDetails?.status ?? 0].name == "Approved"
                    ? "success"
                    : "default"
                }
                sx={{ mb: 1 }}
              />
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#1e3a8a" }}
              >
                {allDdrDetails?.amount?.toLocaleString("en-US", {
                  style: "currency",
                  currency: "INR",
                })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tab Panels */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          {/* Left column */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 2,
                mb: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <DirectionsCarIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Vehicle Information</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {allDdrDetails?.vehicleInfo ? (
                  <>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Registration Number
                      </Typography>
                      <Typography variant="body1">
                        {allDdrDetails?.vehicleInfo?.registrationNumber}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Chassis Number
                      </Typography>
                      <Typography variant="body1">
                        {allDdrDetails?.vehicleInfo?.chassisNumber}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Engine Number
                      </Typography>
                      <Typography variant="body1">
                        {allDdrDetails?.vehicleInfo?.engineNumber}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Make & Model
                      </Typography>
                      <Typography variant="body1">
                        {allDdrDetails?.vehicleInfo?.make}{" "}
                        {allDdrDetails?.vehicleInfo?.model}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Year
                      </Typography>
                      <Typography variant="body1">
                        {allDdrDetails?.vehicleInfo?.year}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Purchase Source
                      </Typography>
                      <Typography variant="body1">
                        {allDdrDetails?.purchaseSource}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Invoice No
                      </Typography>
                      <Typography variant="body1">
                        {allDdrDetails?.invoiceNumber}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Invoice Date
                      </Typography>
                      <Typography variant="body1">
                        {CommonService.formatDate(
                          allDdrDetails?.invoiceDate || ""
                        )}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Fair Market Value
                      </Typography>
                      <Typography variant="body1">
                        {allDdrDetails?.vehicleInfo?.value?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        )}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body1">
                    No vehicle information available
                  </Typography>
                )}
              </CardContent>
            </Card>

            {allDdrDetails?.dealer && (
              <Card
                sx={{
                  borderRadius: 2,
                  mb: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Dealer Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dealer Name & Code
                    </Typography>
                    <Typography variant="body1">
                      {allDdrDetails?.dealer?.dealershipName} (
                      {allDdrDetails?.dealer?.dealerCode})
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Entity Type
                    </Typography>
                    <Typography variant="body1">
                      {allDdrDetails?.dealer?.entity}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Relationship Manager
                    </Typography>
                    <Typography variant="body1">
                      {allDdrDetails?.dealer?.relationshipManagerId}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      PAN
                    </Typography>
                    <Typography variant="body1">
                      {allDdrDetails?.dealer?.dealershipPAN}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  DDR Dates
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Creation Date
                  </Typography>
                  <Typography variant="body2">
                    {CommonService.formatDate(allDdrDetails?.createdDate || "")}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Approval Date
                  </Typography>
                  <Typography variant="body2">
                    {CommonService.formatDate(
                      allDdrDetails?.approvalDate ?? ""
                    )}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                {/* Financial Details */}
                <Card
                  sx={{
                    borderRadius: 2,
                    mb: 3,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Financial Overview
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Principal Amount
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#1e3a8a" }}>
                            {allDdrDetails?.amount?.toLocaleString("en-US", {
                              style: "currency",
                              currency: "INR",
                            })}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Interest Rate
                          </Typography>
                          <Typography variant="h6">
                            {allDdrDetails?.interestRate}%
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Processing Fee
                          </Typography>
                          <Typography variant="h6">
                            {allDdrDetails?.selectedProcessingFee?.toLocaleString(
                              "en-US",
                              {
                                style: "currency",
                                currency: "INR",
                              }
                            )}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            GST On Processing Fee
                          </Typography>
                          <Typography variant="h6">
                            {(
                              (allDdrDetails?.suggestedProcessingFee ?? 0) *
                              0.18
                            )?.toLocaleString("en-US", {
                              style: "currency",
                              currency: "INR",
                            })}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Available Limit
                          </Typography>
                          <Typography variant="h6">{0}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent sx={{ p: 0, paddingBottom: "0px !important" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                        px: 2,
                        pt: 2,
                      }}
                    >
                      <Typography variant="h6">DDR Documents</Typography>
                      {/* <Button
                        variant="outlined"
                        startIcon={<FileUploadIcon />}
                        size="small"
                        onClick={() =>
                          alert(
                            "In a real application, this would open an upload interface for a new document type."
                          )
                        }
                      >
                        Add New Document
                      </Button> */}
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                          <TableRow>
                            <TableCell>Document Type</TableCell>
                            <TableCell>Upload Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {allDocuments.map((doc) => (
                            <TableRow key={doc.uploadedOn}>
                              <TableCell>{doc.documentType}</TableCell>
                              <TableCell>
                                {doc.uploadedOn
                                  ? CommonService.formatDate(doc.uploadedOn)
                                  : "Not uploaded"}
                              </TableCell>
                              <TableCell align="right">
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  {doc.uploadedOn && (
                                    <Tooltip title="View Document">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleViewDocument(doc.filePath)
                                        }
                                        sx={{ color: "#1e3a8a" }}
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                          {allDocuments.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                align="center"
                                sx={{ py: 3 }}
                              >
                                No documents found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Dialog
        open={isApproveAndRejectDialogOpen}
        onClose={() => setApproveAndRejectDialog(false)}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            {statusType == "reject" && "Reject"}
            {statusType == "approve" &&
              (approvalFormStep == 0
                ? "Disbursement Details"
                : "Disbursement Date")}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setApproveAndRejectDialog(false)}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {statusType == "approve" && approvalFormStep == 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                <TextField
                  fullWidth
                  label="Disbursement Amount"
                  type="number"
                  value={approveAndRejectAutoFillData.disbursementAmount}
                  onChange={(e) =>
                    handleApproveForm("disbursementAmount", e.target.value)
                  }
                  required
                  size="small"
                  disabled
                />
              </Grid>
              {/* <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="ROI"
                  value={approveAndRejectAutoFillData.roi}
                  onChange={(e) => handleApproveForm("roi", e.target.value)}
                  type="number"
                  required
                  size="small"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Delay ROI"
                  value={approveAndRejectAutoFillData.delayROI}
                  onChange={(e) =>
                    handleApproveForm("delayROI", e.target.value)
                  }
                  type="number"
                  required
                  size="small"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Interest Charge"
                  value={approveAndRejectAutoFillData.interestCharge}
                  onChange={(e) =>
                    handleApproveForm("interestCharge", e.target.value)
                  }
                  type="number"
                  required
                  size="small"
                  disabled
                />
              </Grid> */}
              <Grid item xs={12} md={12}>
                <TextField
                  fullWidth
                  label="Processing Fee"
                  value={selectedDdrDetails?.selectedProcessingFee}
                  onChange={(e) =>
                    handleApproveForm("processingFee", e.target.value)
                  }
                  type="number"
                  required
                  size="small"
                  helperText={`Suggested Processing Fee: ${selectedDdrDetails?.suggestedProcessingFee}`}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <TextField
                  fullWidth
                  label="Processing Fee GST"
                  value={approveAndRejectAutoFillData.gst}
                  onChange={(e) => handleApproveForm("gst", e.target.value)}
                  type="number"
                  required
                  size="small"
                  disabled
                />
              </Grid>
              {/* <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Payable Amount"
                  value={approveAndRejectAutoFillData.totalPayableAmount}
                  onChange={(e) =>
                    handleApproveForm("totalPayableAmount", e.target.value)
                  }
                  type="number"
                  required
                  size="small"
                  disabled
                />
              </Grid> */}
            </Grid>
          )}

          {statusType == "reject" && approvalFormStep == 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  type="number"
                  value={approveAndRejectAutoFillData.rejectRemakrs}
                  onChange={(e) =>
                    handleApproveForm("rejectRemakrs", e.target.value)
                  }
                  required
                  size="small"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          )}

          {selectedDdrDetails &&
            statusType == "approve" &&
            approvalFormStep == 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="UTR No."
                    value={selectedDdrDetails.utrNumber}
                    onChange={(e) =>
                      handleApproveForm("utrNumber", e.target.value)
                    }
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Disbursement Date"
                    type="date"
                    value={selectedDdrDetails.dateOfWithdraw}
                    onChange={(e) =>
                      handleApproveForm("dateOfWithdraw", e.target.value)
                    }
                    required
                    size="small"
                    inputProps={{
                      max: maxDisbursmentDate.toISOString().split("T")[0],
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={selectedDdrDetails.dueDate}
                    onChange={(e) =>
                      handleApproveForm("dueDate", e.target.value)
                    }
                    required
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
              </Grid>
            )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {/* {statusType == "approve" && approvalFormStep == 1 && (
            <Button onClick={() => setApprovalFormStep(0)}>Back</Button>
          )} */}

          <Button
            onClick={() =>
              statusType == "approve"
                ? handleApproveNextButton()
                : approveOrRejectApiMethod()
            }
            color="primary"
            variant="contained"
            loading={loading}
          >
            {statusType == "approve"
              ? approvalFormStep == 0
                ? "Approve"
                : "Disburse"
              : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default DdrDetails;
