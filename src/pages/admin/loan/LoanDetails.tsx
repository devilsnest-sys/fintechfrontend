import React, { useState, useEffect } from "react";
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
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MainLayout from "../../../components/layout/MainLayout";
import {
  LoanCalculatorInterface,
  LoanDocumentUpload,
  LoanInterface,
  LoanTransactionInterface,
  Waiver,
} from "../../../service/models/Loan.model";
import { AddCircleOutline, Close, CloudUpload } from "@mui/icons-material";
import CountryList from "../../../../public/staticJson/countries.json";
import TimelineBox from "./TimelineBox";
import APIService from "../../../service/API";
import CommonService from "../../../service/CommonService";
import NgIf from "../../../components/NgIf";

const paymentMethod = [ 
  "Online transfer",
  "Cash in bank",
  "Cheque deposit",
  "UPI",
];
interface LoanViewDocument {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  status: "Available" | "Not Available";
  filePath: string;
}
let maxDate = new Date(),decodeId=''


const accountNoList = ["86868687686", "86868688788", "89687878686"];

const modeOfTransferList = ["NEFT", "IMPS", "RTGS", "Other"];
interface FormErrors {
  [key: string]: string;
}

// Define document interface
let isPaymentAddingLoading = false,
  isDocumentAddingLoading = false,
  isWaiverApiLoading = false,
  refreshLoanDetails = "";
const LoanDetails: React.FC = () => {
  const { encodedId } = useParams<{ encodedId: string }>();
  const [loan, setLoan] = useState<LoanInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const navigate = useNavigate();
  const [isPaymentDialogOpen, setPaymentDialog] = useState<boolean>(false);
  const [isDocumentDialogOpen, setDocumentsDialog] = useState<boolean>(false);
  const [isCalculateOustandingDialogOpen, setCalculateOustandingDialog] =
    useState<boolean>(false);
    const [depositBankList, setDepositBankList] = useState<string[]>([]);

  const [isWaiverDetailsDialogOpen, setWaiverDetailsDialog] =
    useState<boolean>(false);
  const [allTransactions, setTransactionsList] = useState<
    LoanTransactionInterface[]
  >([]);
  const [allDocuments, setDocumentsList] = useState<LoanViewDocument[]>([]);
  const [allLoanCalculators, setLoanCalculatorsData] =
    useState<LoanCalculatorInterface | null>(null);
  const [transactionsFormData, setTransactionFormData] =
    useState<LoanTransactionInterface>({
      id: 0,
      loanId: 0,
      paidDate: "",
      amountPaid: 0,
      paymentMode: "",
      countryCode: "+91",
      mobileNo: "",
      remarks: "",
      depositBank: "",
      depositAccountNo: "",
      transactionId: "",
      sourceBank: "",
      sourceBranch: "",
      modeOfTransfer: "",
      chequeNumber: "",
      chequeIssueDate: "",
      chequedrawnOnBank: "",
    });
  const [allWaiverDetails, setWaiverDetails] = useState<Waiver>({
    principalAmount: 0,
    interest: 0,
    delayedInterest: 0,
  });
  const [documentsFormData, setDocumentsFormData] =
    useState<LoanDocumentUpload>({
      loanId: 0,
      documentType: "",
      document: null,
    });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchLoanDetails = async () => {
      if (!encodedId) return;
        decodeId=atob(encodedId)
      const loansData = await APIService.getLoanById(Number(decodeId));
      const loanCalculations = await APIService.getLoanCalculationsById(
        Number(loansData?.loanDetailId ?? decodeId)
      );
      try{
        const resLoanDetails = await APIService.getBankDetails();
        const bankNames = resLoanDetails?.map((item: any) => item.name);
        setDepositBankList(bankNames || []);
        console.log(resLoanDetails,"getBankDetails")
      }catch(err){
        console.log(err)
      }
      const processedLoans = [loansData].map((loan) => {
        const dueDate = new Date(loan.dueDate ?? "");
        const today = new Date();
        let status: "Active" | "Closed" | "Overdue" = loan.isActive
          ? "Active"
          : "Closed";
        if (loan.isActive && dueDate < today) {
          status = "Overdue";
        }
        return { ...loan, status };
      });
      setLoan(processedLoans?.[0]);
      setLoanCalculatorsData(loanCalculations);

      setTransactionsList(loanCalculations.installments);
      try {
        setLoading(true);

        const loanDocuments = await APIService.getDocumentsByLoanId(Number(decodeId));

        const mappedDocuments: LoanViewDocument[] = [];

        loanDocuments.forEach((doc: any) => {
          mappedDocuments.push({
            id: doc?.id,
            name: doc?.documentType, // adjust this if needed
            type: "pdf", // hardcoded unless type comes from API
            uploadDate: doc?.uploadedOn || "",
            status: doc?.filePath ? "Available" : "Not Available",
            filePath: doc.filePath || "", // adjust this if needed
          });
        });

        setDocumentsList(mappedDocuments);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [encodedId, refreshLoanDetails]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircleIcon sx={{ color: "success.main" }} />;
      case "Pending":
        return <AccessTimeIcon sx={{ color: "warning.main" }} />;
      // default:
      //   return <ErrorIcon sx={{ color: "error.main" }} />;
    }
  };

  const getDaysRemaining = (fromDate: string, toDate: string) => {
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDocument = (filePath: string) => {
    window.open(filePath, "_blank");
  };

  const handleWaiverForm = (field: string, value: string) => {
    setWaiverDetails({
      ...allWaiverDetails,
      [field]: parseFloat(value),
    });
  };

  const handlePaymentFormChange = (field: string, value: any) => {
    if (field == "paymentMode") {
      const resetPaymentFormData = {
        id: 0,
        loanId: 0,
        paidDate: "",
        amountPaid: 0,
        paymentMode: "",
        countryCode: "+91",
        mobileNo: "",
        remarks: "",
        depositBank: "",
        depositAccountNo: "",
        transactionId: "",
        sourceBank: "",
        sourceBranch: "",
        modeOfTransfer: "",
        chequeNumber: "",
        chequeIssueDate: "",
        chequedrawnOnBank: "",
      };
      setTransactionFormData({
        ...resetPaymentFormData,
        [field]: value,
      });
      
      setFormErrors({});
    } else {
      setTransactionFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: "",
      });
    }
  };

  const handleDocumentFormChange = (
    field: string,
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    let value = null;
    if (field === "document") {
      const input = event as React.ChangeEvent<HTMLInputElement>;
      const file = input.target.files?.[0];
      input.target.value = "";
      if (!file) return;

      value = file;
    } else if (field === "documentType") {
      const input = event as React.ChangeEvent<HTMLSelectElement>;
      value = input.target.value;
    }

    setDocumentsFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: "",
      });
    }
  };

  const validateForm = (dialogType: string): boolean => {
    const errors: FormErrors = {};
    if (dialogType == "payment") {
      if (!transactionsFormData.paymentMode?.trim())
        errors.paymentMode = "Payment Method is required";

      if (
        !transactionsFormData.amountPaid ||
        transactionsFormData.amountPaid < 0
      )
        errors.amountPaid = "Amount must be greater then 0";

      if (!transactionsFormData.paidDate)
        errors.paidDate = "Deposit date is required";

      if (
        transactionsFormData?.mobileNo?.trim() &&
        transactionsFormData?.mobileNo?.length < 10
      )
        errors.mobileNo = "Invalid mobile no";

      if (
        ["Online transfer", "Cash in bank", "Cheque deposit"].includes(
          transactionsFormData.paymentMode
        )
      ) {
        if (!transactionsFormData.depositBank?.trim())
          errors.depositBank = "Deposit bank is required";
      }

      if (transactionsFormData.paymentMode == "Online transfer") {
        if (!transactionsFormData.transactionId?.trim())
          errors.transactionId = "Transaction ID is required";
        if (
          transactionsFormData.transactionId?.trim() &&
          transactionsFormData.transactionId?.length < 4
        )
          errors.transactionId = "Transaction ID at least 4 digit";
        if (!transactionsFormData.modeOfTransfer?.trim())
          errors.modeOfTransfer = "Mode Of Transfer is required";
      }

      if (transactionsFormData.paymentMode == "Cheque deposit") {
        if (!transactionsFormData.chequeNumber?.trim())
          errors.chequeNumber = "Cheque Number is required";
        if (
          transactionsFormData.chequeNumber?.trim() &&
          transactionsFormData.chequeNumber?.length < 6
        )
          errors.chequeNumber = "Cheque Number at least 6 digit";
      }
    } else if (dialogType == "document") {
      if (!documentsFormData.documentType?.trim())
        errors.documentType = "Document Type is required";
      if (!documentsFormData.document) errors.document = "Document is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const addPaymentApiMethod = async () => {
    try {
      if (!validateForm("payment")) {
        setErrorMsg("Please check error messages marked in red ..!");
        return;
      }
      isPaymentAddingLoading = true;
      transactionsFormData.loanId = loan?.loanDetailId ?? Number(decodeId);
      await APIService.addLoanPayment(transactionsFormData);
      // const loanCalculations = await LoanService.getLoanCalculationsById(
      //   Number(id)
      // );
      // setLoanCalculatorsData(loanCalculations);
      // setTransactionsList(loanCalculations.installments);
      refreshLoanDetails = "addPayment" + transactionsFormData.amountPaid;
      setPaymentDialog(false);
      setSuccessMsg("Loan payment added successfully");
    } catch (err) {
      setErrorMsg("Failed to adding loan payment. Please try again.");
    } finally {
      isPaymentAddingLoading = false;
    }
  };

  const addWaiverPaymentApiMethod = async () => {
    try {
      if (
        !allWaiverDetails.principalAmount &&
        !allWaiverDetails.interest &&
        !allWaiverDetails.delayedInterest
      ) {
        setErrorMsg("Please enter at least one waiver type ..!");
        return;
      }
      let waiverType = "",
        waiverAmt = 0;
      if (allWaiverDetails.principalAmount) {
        waiverType = "principal";
        waiverAmt = Number(allWaiverDetails.principalAmount ?? 0);
      } else if (allWaiverDetails.interest) {
        waiverType = "interest";
        waiverAmt = Number(allWaiverDetails.interest ?? 0);
      } else if (allWaiverDetails.delayedInterest) {
        waiverType = "delayinterest";
        waiverAmt = Number(allWaiverDetails.delayedInterest ?? 0);
      }
      isWaiverApiLoading = true;
      transactionsFormData.loanId = loan?.loanDetailId ?? Number(decodeId);
      await APIService.loanPaymentWaiver({
        installmentId: loan?.loanDetailId ?? Number(decodeId),
        waiverType: waiverType,
        amount: waiverAmt,
        reason: "",
      });
      refreshLoanDetails = "updateWaviver" + waiverAmt;
      setWaiverDetailsDialog(false);
      setSuccessMsg("Waiver successfully done");
    } catch (err) {
      setErrorMsg("Failed to Waiver loan payment. Please try again.");
    } finally {
      isWaiverApiLoading = false;
    }
  };

  const addDocumentApiMethod = async () => {
    try {
      if (!validateForm("document")) {
        setErrorMsg("Please check error messages marked in red ..!");
        return;
      }
      isDocumentAddingLoading = true;
      const addDocumentConvertList: LoanDocumentUpload[] = [
        {
          loanId: Number(decodeId),
          documentType: documentsFormData?.documentType,
          document: documentsFormData?.document,
        },
      ];
      await APIService.uploadMultiPleLoanDoc(
        "api/LoanDocumentUpload/upload-multiple-documents",
        addDocumentConvertList
      );
      setDocumentsFormData({
        loanId: Number(decodeId) ?? 0,
        document: null,
        documentType: "",
      });
      setDocumentsDialog(false);
      refreshLoanDetails = "documentUpdated" + Date().valueOf();
      setSuccessMsg("Loan documents added successfully");
    } catch (err) {
      setErrorMsg("Failed to adding loan document. Please try again.");
    } finally {
      isDocumentAddingLoading = false;
    }
  };
  const openAddPaymentDialog = () => {
    setTransactionFormData({
      id: 0,
      loanId: 0,
      paidDate: "",
      amountPaid: 0,
      paymentMode: "",
      countryCode: "+91",
      mobileNo: "",
      remarks: "",
      depositBank: "",
      depositAccountNo: "",
      transactionId: "",
      sourceBank: "",
      sourceBranch: "",
      modeOfTransfer: "",
      chequeNumber: "",
      chequeIssueDate: "",
      chequedrawnOnBank: "",
    });
    setFormErrors({});
    setPaymentDialog(true);
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

  // Use dealer?.roi if available for interest rate
  // const interestRate = loan?.dealer?.roi
  //   ? loan?.dealer?.roi
  //   : loan.interestRate;
  // // Use dealer?.sanctionAmount for display if loan amount is 0
  // const displayAmount =
  //   loan.amount > 0
  //     ? loan.amount
  //     : loan?.dealer?.sanctionAmount
  //     ? loan?.dealer?.sanctionAmount
  //     : 0;

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
          onClick={() => navigate("/loan-listing")}
        >
          Loans
        </Link>
        <Typography color="text.primary">Loan #{loan?.loanNumber}</Typography>
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
            onClick={() => navigate("/loan-listing")}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Loan Details
          </Typography>
        </Box>
      </Box>

      {/* Loan Header Card */}
      <Card
        sx={{
          borderRadius: 2,
          mb: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent sx={{ paddingBottom: "16px !important" }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Loan #{loan?.loanNumber}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Dealer:{" "}
                    </Typography>
                    <Link
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/dealer-details/${btoa(String(loan?.dealer?.id??""))}`)
                      }
                    >
                      {loan?.dealer?.dealershipName || "Unknown Dealer"}&nbsp; (
                      {loan?.dealer?.dealerCode || "Unknown Dealer Code"})
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
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Chip
                  label={loan?.status}
                  color={
                    loan?.status === "Active"
                      ? "success"
                      : loan?.status === "Overdue"
                      ? "error"
                      : "default"
                  }
                  sx={{ mb: 1, ml: 1 }}
                />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#1e3a8a" }}
              >
                {allLoanCalculators?.disbursedAmount?.toLocaleString("en-US", {
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

                {loan?.vehicleInfo ? (
                  <>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Registration Number
                      </Typography>
                      <Typography variant="body1">
                        {loan?.vehicleInfo.registrationNumber}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Chassis Number
                      </Typography>
                      <Typography variant="body1">
                        {loan?.vehicleInfo.chassisNumber}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Engine Number
                      </Typography>
                      <Typography variant="body1">
                        {loan?.vehicleInfo.engineNumber}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Make & Model
                      </Typography>
                      <Typography variant="body1">
                        {loan?.vehicleInfo.make} {loan?.vehicleInfo.model}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Year
                      </Typography>
                      <Typography variant="body1">
                        {loan?.vehicleInfo.year}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Purchase Source
                      </Typography>
                      <Typography variant="body1">
                        {loan?.purchaseSource}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Invoice No
                      </Typography>
                      <Typography variant="body1">
                        {loan?.invoiceNumber}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Invoice Date
                      </Typography>
                      <Typography variant="body1">
                        {CommonService.formatDate(loan?.invoiceDate || "")}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Fair Market Value
                      </Typography>
                      <Typography variant="body1">
                        {loan?.vehicleInfo.value
                          ? loan?.vehicleInfo.value.toLocaleString("en-US", {
                              style: "currency",
                              currency: "INR",
                            })
                          : "N/A"}
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

            {loan?.dealer && (
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
                      {loan?.dealer?.dealershipName} ({loan?.dealer?.dealerCode}
                      )
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Entity Type
                    </Typography>
                    <Typography variant="body1">
                      {loan?.dealer?.entity}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {loan?.dealer?.city}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Relationship Manager
                    </Typography>
                    <Typography variant="body1">
                      {loan?.dealer?.relationshipManager}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      PAN
                    </Typography>
                    <Typography variant="body1">
                      {loan?.dealer?.dealershipPAN}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Loan Timeline */}
            <Card
              sx={{
                borderRadius: 2,
                mb: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Loan Timeline
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
                    Approval Date
                  </Typography>
                  <Typography variant="body2">
                    {CommonService.formatDate(loan?.createdDate ?? "")}
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
                    Disbursement Date
                  </Typography>
                  <Typography variant="body2">
                    {CommonService.formatDate(loan?.dateOfWithdraw ?? "")}
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
                    Processing Fee Received Date
                  </Typography>
                  <Typography variant="body2">
                    {CommonService.formatDate(
                      loan?.processingFeeReceivedDate ?? ""
                    )}
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
                    Settled Date
                  </Typography>
                  <Typography variant="body2">
                    {CommonService.formatDate(loan?.settledDate ?? "")}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body2">
                    {CommonService.formatDate(loan?.dueDate ?? "")}
                  </Typography>
                </Box>
              </CardContent>
              {/* {loan?.isActive && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: "#f0f7ff",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    ` Days Remaining:{" "}
                    {getDaysRemaining(
                      new Date().toISOString(),
                      loan?.dueDate ?? ""
                    ) > 0
                      ? getDaysRemaining(
                          new Date().toISOString(),
                          loan?.dueDate ?? ""
                        )
                      : `${Math.abs(
                          getDaysRemaining(
                            new Date().toISOString(),
                            loan?.dueDate ?? ""
                          )
                        )} days over due`}
                    `
                  </Typography>
                </Box>
              )} */}
            </Card>

            <Grid item xs={12} md={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  mb: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Loan Document Timeline
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TimelineBox />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Right column */}
          <Grid item xs={12} md={8}>
            {/* Financial Details */}
            <Grid item xs={12} md={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  mb: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Loan Summary
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Loan Amount
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#1e3a8a" }}>
                        {allLoanCalculators?.disbursedAmount?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        ) ?? 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Disbursement Date
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#1e3a8a" }}>
                        {CommonService.formatDate(loan?.dateOfWithdraw ?? "")}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Interest Rate
                      </Typography>
                      <Typography variant="h6">
                        {loan?.interestRate ?? 0}%
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Delayed Interest Rate
                      </Typography>
                      <Typography variant="h6">
                        {loan?.delayedROI ?? 0}%
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Processing Fee
                      </Typography>
                      <Typography variant="h6">
                        {allLoanCalculators?.processingFee?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        )}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        GST On Processing Fee
                      </Typography>
                      <Typography variant="h6">
                        {allLoanCalculators?.gst?.toLocaleString("en-US", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Term
                      </Typography>
                      <Typography variant="h6">
                        {getDaysRemaining(
                          loan?.dueDate ?? "",
                          loan?.dateOfWithdraw ?? ""
                        ) > 0
                          ? getDaysRemaining(
                              loan?.dueDate ?? "",
                              loan?.dateOfWithdraw ?? ""
                            )
                          : `${Math.abs(
                              getDaysRemaining(
                                loan?.dueDate ?? "",
                                loan?.dateOfWithdraw ?? ""
                              ) - 1
                            )}`}
                        Days
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Total Payment Received
                      </Typography>
                      <Typography variant="h6">
                        {allLoanCalculators?.totalInstallmentReceived?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Waiver
                      </Typography>
                      <Typography variant="h6">
                        {(
                          (allLoanCalculators?.waivedPrincipal ?? 0) +
                          (allLoanCalculators?.waivedInterest ?? 0) +
                          (allLoanCalculators?.waivedDelayInterest ?? 0) +
                          (allLoanCalculators?.waivedProcessingFee ?? 0)
                        ).toLocaleString("en-US", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Interest Received
                      </Typography>
                      <Typography variant="h6">
                        {allLoanCalculators?.regularInterestReceived?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Delayed Interest Received
                      </Typography>
                      <Typography variant="h6">
                        {allLoanCalculators?.delayInterestReceived?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        )}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Accrue Interest
                      </Typography>
                      <Typography variant="h6">
                        {" "}
                        {allLoanCalculators?.accruedRegularInterest?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        )}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Accrue Delayed Interest
                      </Typography>
                      <Typography variant="h6">
                        {" "}
                        {allLoanCalculators?.accruedDelayInterest?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        )}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Booked Interest
                      </Typography>
                      <Typography variant="h6">
                        {" "}
                        {allLoanCalculators?.regularInterestReceived?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        )}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        Booked Delayed Interest
                      </Typography>
                      <Typography variant="h6">
                        {" "}
                        {allLoanCalculators?.delayInterestReceived?.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        )}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sx={{ textAlign: "right" }}>
                      <Button
                        variant="contained"
                        sx={{ bgcolor: "#1e3a8a" }}
                        onClick={() => setCalculateOustandingDialog(true)}
                      >
                        Calculate Oustanding
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  mb: 3,
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
                    <Typography variant="h6">Transaction History</Typography>

                    <NgIf
                      condition={CommonService.checkPermission(["Add Payment"])}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<AddCircleOutline />}
                        size="small"
                        onClick={() => openAddPaymentDialog()}
                      >
                        Add New Payment
                      </Button>
                    </NgIf>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Transaction Type</TableCell>
                          <TableCell>Reference</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allTransactions.map((transaction) => (
                          <TableRow key={transaction.id} hover>
                            <TableCell>
                              {CommonService.formatDate(transaction?.paidDate)}
                            </TableCell>
                            <TableCell>{transaction.paymentMode}</TableCell>
                            <TableCell>{transaction.remarks}</TableCell>
                            <TableCell>
                              {transaction?.amountPaid?.toLocaleString(
                                "en-US",
                                {
                                  style: "currency",
                                  currency: "INR",
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {getStatusIcon(transaction?.status ?? "")}
                                <Typography variant="body2" sx={{ ml: 0.5 }}>
                                  {transaction.status}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                        {allTransactions.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              align="center"
                              sx={{ py: 3 }}
                            >
                              No transactions found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  mb: 3,
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
                    <Typography variant="h6">Loan Documents</Typography>

                    <NgIf
                      condition={CommonService.checkPermission([
                        "Add Loan docs",
                      ])}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<AddCircleOutline />}
                        size="small"
                        onClick={() => setDocumentsDialog(true)}
                      >
                        Add New Document
                      </Button>
                    </NgIf>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                        <TableRow>
                          <TableCell>Document Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Upload Date</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allDocuments.map((doc) => (
                          <TableRow key={doc.id} hover>
                            <TableCell>{doc.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={doc.status}
                                size="small"
                                color={
                                  doc.status === "Available"
                                    ? "success"
                                    : "default"
                                }
                                sx={{ fontSize: "0.7rem" }}
                              />
                            </TableCell>
                            <TableCell>
                              {CommonService.formatDate(doc.uploadDate)}
                            </TableCell>
                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                {doc.status === "Available" && (
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
                              sx={{ py: 2 }}
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
      </Box>
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {successMsg}
        </Alert>
      </Snackbar>

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

      <Dialog
        maxWidth="sm"
        open={isPaymentDialogOpen}
        onClose={() => setPaymentDialog(false)}
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
            Add Payment
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setPaymentDialog(false)}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <FormControl fullWidth size="small">
                <InputLabel id="payment-type-label">Payment Mode</InputLabel>
                <Select
                  labelId="payment-type-label"
                  value={transactionsFormData.paymentMode}
                  onChange={(e) =>
                    handlePaymentFormChange("paymentMode", e.target.value)
                  }
                  label="Payment Mode"
                  required
                  error={!!formErrors.paymentMode}
                >
                  {paymentMethod.map((label) => (
                    <MenuItem key={label} value={label}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.paymentMode && (
                  <FormHelperText error>
                    {formErrors.paymentMode}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            {transactionsFormData.paymentMode == "Cash in hand" && (
              <>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Amount (in INR)"
                    type="number"
                    required
                    value={transactionsFormData.amountPaid}
                    onChange={(e) =>
                      handlePaymentFormChange(
                        "amountPaid",
                        parseFloat(e.target.value)
                      )
                    }
                    size="small"
                    error={!!formErrors.amountPaid}
                    helperText={formErrors.amountPaid}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Deposit Date"
                    required
                    value={transactionsFormData.paidDate}
                    onChange={(e) =>
                      handlePaymentFormChange("paidDate", e.target.value)
                    }
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!formErrors.paidDate}
                    inputProps={{
                      max: maxDate.toISOString().split("T")[0],
                    }}
                    helperText={formErrors.paidDate}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="Country-Code-label">
                      Country Code
                    </InputLabel>
                    <Select
                      labelId="Country-Code-label"
                      value={transactionsFormData.countryCode}
                      onChange={(e) =>
                        handlePaymentFormChange("countryCode", e.target.value)
                      }
                      label="Country Code"
                      required
                      error={!!formErrors.countryCode}
                    >
                      {CountryList.map((countryItem) => (
                        <MenuItem
                          key={countryItem.name}
                          value={countryItem?.dial_code}
                        >
                          {countryItem?.name} ({countryItem?.dial_code})
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.countryCode && (
                      <FormHelperText error>
                        {formErrors.countryCode}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Mobile No"
                    value={transactionsFormData.mobileNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,10}$/.test(val)) {
                        handlePaymentFormChange("mobileNo", e.target.value);
                      }
                    }}
                    size="small"
                    inputProps={{ maxLength: 10 }}
                    error={!!formErrors.mobileNo}
                    helperText={formErrors.mobileNo}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    value={transactionsFormData.remarks}
                    onChange={(e) =>
                      handlePaymentFormChange("remarks", e.target.value)
                    }
                    size="small"
                  />
                </Grid>
              </>
            )}

            {transactionsFormData.paymentMode == "Online transfer" && (
              <>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Amount (in INR)"
                    type="number"
                    required
                    value={transactionsFormData.amountPaid}
                    onChange={(e) =>
                      handlePaymentFormChange(
                        "amountPaid",
                        parseInt(e.target.value)
                      )
                    }
                    size="small"
                    error={!!formErrors.amountPaid}
                    helperText={formErrors.amountPaid}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Deposit Date"
                    required
                    value={transactionsFormData.paidDate}
                    onChange={(e) =>
                      handlePaymentFormChange("paidDate", e.target.value)
                    }
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: maxDate.toISOString().split("T")[0],
                    }}
                    error={!!formErrors.paidDate}
                    helperText={formErrors.paidDate}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="Country-Code-label">
                      Country Code
                    </InputLabel>
                    <Select
                      labelId="Country-Code-label"
                      value={transactionsFormData.countryCode}
                      onChange={(e) =>
                        handlePaymentFormChange("countryCode", e.target.value)
                      }
                      label="Country Code"
                      required
                      error={!!formErrors.countryCode}
                    >
                      {CountryList.map((countryItem) => (
                        <MenuItem
                          key={countryItem.name}
                          value={countryItem?.dial_code}
                        >
                          {countryItem?.name} ({countryItem?.dial_code})
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.countryCode && (
                      <FormHelperText error>
                        {formErrors.countryCode}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Mobile No"
                    value={transactionsFormData.mobileNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,10}$/.test(val)) {
                        handlePaymentFormChange("mobileNo", e.target.value);
                      }
                    }}
                    size="small"
                    inputProps={{ maxLength: 10 }}
                    error={!!formErrors.mobileNo}
                    helperText={formErrors.mobileNo}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth required size="small">
                    <InputLabel id="depositBank-type-label">
                      Deposit Bank
                    </InputLabel>
                    <Select
                      labelId="depositBank-type-label"
                      value={transactionsFormData.depositBank}
                      onChange={(e) =>
                        handlePaymentFormChange("depositBank", e.target.value)
                      }
                      label="Deposit Bank"
                      required
                      error={!!formErrors.depositBank}
                    >
                      {depositBankList.map((label) => (
                        <MenuItem key={label} value={label}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.depositBank && (
                      <FormHelperText error>
                        {formErrors.depositBank}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                {/* <Grid item xs={12} md={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="Deposit-Account-type-label">
                      Deposit Account No
                    </InputLabel>
                    <Select
                      labelId="Deposit-Account-type-label"
                      value={transactionsFormData.depositAccountNo}
                      onChange={(e) =>
                        handlePaymentFormChange(
                          "depositAccountNo",
                          e.target.value
                        )
                      }
                      label="Deposit Account No"
                      error={!!formErrors.depositAccountNo}
                    >
                      {accountNoList.map((label) => (
                        <MenuItem key={label} value={label}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.depositAccountNo && (
                      <FormHelperText error>
                        {formErrors.depositAccountNo}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid> */}
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Transaction ID"
                    required
                    value={transactionsFormData.transactionId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,10}$/.test(val)) {
                        handlePaymentFormChange(
                          "transactionId",
                          e.target.value
                        );
                      }
                    }}
                    inputProps={{ maxLength: 4 }}
                    error={!!formErrors.transactionId}
                    helperText={formErrors.transactionId}
                    size="small"
                  />
                </Grid>
                {/* <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Source Bank"
                    value={transactionsFormData.sourceBank}
                    onChange={(e) =>
                      handlePaymentFormChange("sourceBank", e.target.value)
                    }
                    size="small"
                  />
                </Grid> */}
                {/* <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Source Branch"
                    value={transactionsFormData.sourceBranch}
                    onChange={(e) =>
                      handlePaymentFormChange("sourceBranch", e.target.value)
                    }
                    size="small"
                  />
                </Grid> */}
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth required size="small">
                    <InputLabel id="Mode-Of-Transfer-label">
                      Mode Of Transfer
                    </InputLabel>
                    <Select
                      labelId="Mode-Of-Transfer-label"
                      value={transactionsFormData.modeOfTransfer}
                      onChange={(e) =>
                        handlePaymentFormChange(
                          "modeOfTransfer",
                          e.target.value
                        )
                      }
                      label="Mode Of Transfer"
                      error={!!formErrors.modeOfTransfer}
                    >
                      {modeOfTransferList.map((label) => (
                        <MenuItem key={label} value={label}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.modeOfTransfer && (
                      <FormHelperText error>
                        {formErrors.modeOfTransfer}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    value={transactionsFormData.remarks}
                    onChange={(e) =>
                      handlePaymentFormChange("remarks", e.target.value)
                    }
                    size="small"
                  />
                </Grid>
              </>
            )}

            {transactionsFormData.paymentMode == "Cash in bank" && (
              <>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Amount (in INR)"
                    type="number"
                    required
                    value={transactionsFormData.amountPaid}
                    onChange={(e) =>
                      handlePaymentFormChange(
                        "amountPaid",
                        parseInt(e.target.value)
                      )
                    }
                    size="small"
                    error={!!formErrors.amountPaid}
                    helperText={formErrors.amountPaid}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Deposit Date"
                    required
                    value={transactionsFormData.paidDate}
                    onChange={(e) =>
                      handlePaymentFormChange("paidDate", e.target.value)
                    }
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: maxDate.toISOString().split("T")[0],
                    }}
                    error={!!formErrors.paidDate}
                    helperText={formErrors.paidDate}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="Country-Code-label">
                      Country Code
                    </InputLabel>
                    <Select
                      labelId="Country-Code-label"
                      value={transactionsFormData.countryCode}
                      onChange={(e) =>
                        handlePaymentFormChange("countryCode", e.target.value)
                      }
                      label="Country Code"
                      required
                      error={!!formErrors.countryCode}
                    >
                      {CountryList.map((countryItem) => (
                        <MenuItem
                          key={countryItem.name}
                          value={countryItem?.dial_code}
                        >
                          {countryItem?.name} ({countryItem?.dial_code})
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.countryCode && (
                      <FormHelperText error>
                        {formErrors.countryCode}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Mobile No"
                    value={transactionsFormData.mobileNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,10}$/.test(val)) {
                        handlePaymentFormChange("mobileNo", e.target.value);
                      }
                    }}
                    size="small"
                    inputProps={{ maxLength: 10 }}
                    error={!!formErrors.mobileNo}
                    helperText={formErrors.mobileNo}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth required size="small">
                    <InputLabel id="depositBank-type-label">
                      Deposit Bank
                    </InputLabel>
                    <Select
                      labelId="depositBank-type-label"
                      value={transactionsFormData.depositBank}
                      onChange={(e) =>
                        handlePaymentFormChange("depositBank", e.target.value)
                      }
                      label="Deposit Bank"
                      error={!!formErrors.depositBank}
                    >
                      {depositBankList.map((label) => (
                        <MenuItem key={label} value={label}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.depositBank && (
                      <FormHelperText error>
                        {formErrors.depositBank}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="Deposit-Account-type-label">
                      Deposit Account No
                    </InputLabel>
                    <Select
                      labelId="Deposit-Account-type-label"
                      value={transactionsFormData.depositAccountNo}
                      onChange={(e) =>
                        handlePaymentFormChange(
                          "depositAccountNo",
                          e.target.value
                        )
                      }
                      label="Deposit Account No"
                      error={!!formErrors.depositAccountNo}
                    >
                      {accountNoList.map((label) => (
                        <MenuItem key={label} value={label}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.depositAccountNo && (
                      <FormHelperText error>
                        {formErrors.depositAccountNo}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    value={transactionsFormData.remarks}
                    onChange={(e) =>
                      handlePaymentFormChange("remarks", e.target.value)
                    }
                    size="small"
                  />
                </Grid>
              </>
            )}

            {transactionsFormData.paymentMode == "Cheque deposit" && (
              <>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Amount (in INR)"
                    type="number"
                    required
                    value={transactionsFormData.amountPaid}
                    onChange={(e) =>
                      handlePaymentFormChange(
                        "amountPaid",
                        parseInt(e.target.value)
                      )
                    }
                    size="small"
                    error={!!formErrors.amountPaid}
                    helperText={formErrors.amountPaid}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Deposit Date"
                    required
                    value={transactionsFormData.paidDate}
                    onChange={(e) =>
                      handlePaymentFormChange("paidDate", e.target.value)
                    }
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!formErrors.paidDate}
                    helperText={formErrors.paidDate}
                    inputProps={{
                      max: maxDate.toISOString().split("T")[0],
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="Country-Code-label">
                      Country Code
                    </InputLabel>
                    <Select
                      labelId="Country-Code-label"
                      value={transactionsFormData.countryCode}
                      onChange={(e) =>
                        handlePaymentFormChange("countryCode", e.target.value)
                      }
                      label="Country Code"
                      required
                      error={!!formErrors.countryCode}
                    >
                      {CountryList.map((countryItem) => (
                        <MenuItem
                          key={countryItem.name}
                          value={countryItem?.dial_code}
                        >
                          {countryItem?.name} ({countryItem?.dial_code})
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.countryCode && (
                      <FormHelperText error>
                        {formErrors.countryCode}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Mobile No"
                    value={transactionsFormData.mobileNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,10}$/.test(val)) {
                        handlePaymentFormChange("mobileNo", e.target.value);
                      }
                    }}
                    size="small"
                    inputProps={{ maxLength: 10 }}
                    error={!!formErrors.mobileNo}
                    helperText={formErrors.mobileNo}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Cheque Number"
                    required
                    value={transactionsFormData.chequeNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,10}$/.test(val)) {
                        handlePaymentFormChange("chequeNumber", e.target.value);
                      }
                    }}
                    inputProps={{ maxLength: 6 }}
                    error={!!formErrors.chequeNumber}
                    helperText={formErrors.chequeNumber}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Cheque Issue Date"
                    value={transactionsFormData.chequeIssueDate}
                    onChange={(e) =>
                      handlePaymentFormChange("chequeIssueDate", e.target.value)
                    }
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: maxDate.toISOString().split("T")[0],
                    }}
                  />
                </Grid>
                {/* <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Cheque Drawn On Bank"
                    value={transactionsFormData.chequedrawnOnBank}
                    onChange={(e) =>
                      handlePaymentFormChange(
                        "chequedrawnOnBank",
                        e.target.value
                      )
                    }
                    size="small"
                  />
                </Grid> */}
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth required size="small">
                    <InputLabel id="depositBank-type-label">
                      Deposit Bank
                    </InputLabel>
                    <Select
                      labelId="depositBank-type-label"
                      value={transactionsFormData.depositBank}
                      onChange={(e) =>
                        handlePaymentFormChange("depositBank", e.target.value)
                      }
                      label="Deposit Bank"
                      error={!!formErrors.depositBank}
                    >
                      {depositBankList.map((label) => (
                        <MenuItem key={label} value={label}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.depositBank && (
                      <FormHelperText error>
                        {formErrors.depositBank}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="Deposit-Account-type-label">
                      Deposit Account No
                    </InputLabel>
                    <Select
                      labelId="Deposit-Account-type-label"
                      value={transactionsFormData.depositAccountNo}
                      onChange={(e) =>
                        handlePaymentFormChange(
                          "depositAccountNo",
                          e.target.value
                        )
                      }
                      label="Deposit Account No"
                      error={!!formErrors.depositAccountNo}
                    >
                      {accountNoList.map((label) => (
                        <MenuItem key={label} value={label}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.depositAccountNo && (
                      <FormHelperText error>
                        {formErrors.depositAccountNo}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    value={transactionsFormData.remarks}
                    onChange={(e) =>
                      handlePaymentFormChange("remarks", e.target.value)
                    }
                    size="small"
                  />
                </Grid>
              </>
            )}

            {transactionsFormData.paymentMode == "UPI" && (
              <>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Amount (in INR)"
                    type="number"
                    required
                    value={transactionsFormData.amountPaid}
                    onChange={(e) =>
                      handlePaymentFormChange(
                        "amountPaid",
                        parseInt(e.target.value)
                      )
                    }
                    size="small"
                    error={!!formErrors.amountPaid}
                    helperText={formErrors.amountPaid}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Deposit Date"
                    required
                    value={transactionsFormData.paidDate}
                    onChange={(e) =>
                      handlePaymentFormChange("paidDate", e.target.value)
                    }
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!formErrors.paidDate}
                    helperText={formErrors.paidDate}
                    inputProps={{
                      max: maxDate.toISOString().split("T")[0],
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="Country-Code-label">
                      Country Code
                    </InputLabel>
                    <Select
                      labelId="Country-Code-label"
                      value={transactionsFormData.countryCode}
                      onChange={(e) =>
                        handlePaymentFormChange("countryCode", e.target.value)
                      }
                      label="Country Code"
                      error={!!formErrors.countryCode}
                    >
                      {CountryList.map((countryItem) => (
                        <MenuItem
                          key={countryItem.name}
                          value={countryItem?.dial_code}
                        >
                          {countryItem?.name} ({countryItem?.dial_code})
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.countryCode && (
                      <FormHelperText error>
                        {formErrors.countryCode}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Mobile No"
                    value={transactionsFormData.mobileNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,10}$/.test(val)) {
                        handlePaymentFormChange("mobileNo", e.target.value);
                      }
                    }}
                    size="small"
                    inputProps={{ maxLength: 10 }}
                    error={!!formErrors.mobileNo}
                    helperText={formErrors.mobileNo}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    value={transactionsFormData.remarks}
                    onChange={(e) =>
                      handlePaymentFormChange("remarks", e.target.value)
                    }
                    size="small"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPaymentDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => addPaymentApiMethod()}
            variant="contained"
            color="primary"
            disabled={isPaymentAddingLoading}
            startIcon={
              isPaymentAddingLoading ? <CircularProgress size={20} /> : null
            }
          >
            {isPaymentAddingLoading ? "Adding..." : "Add Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        maxWidth="sm"
        open={isDocumentDialogOpen}
        onClose={() => setDocumentsDialog(false)}
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
            Add Document
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setDocumentsDialog(false)}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                size="small"
                label="Document Type"
                value={documentsFormData.documentType}
                onChange={(e) => handleDocumentFormChange("documentType", e)}
                error={!!formErrors.documentType}
                helperText={formErrors.documentType}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                fullWidth
              >
                {documentsFormData?.document?.name ?? `Upload Doc`}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleDocumentFormChange("document", e)}
                />
              </Button>
              {formErrors.document && (
                <FormHelperText error>{formErrors.document}</FormHelperText>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDocumentsDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => addDocumentApiMethod()}
            variant="contained"
            color="primary"
            disabled={isDocumentAddingLoading}
            startIcon={
              isDocumentAddingLoading ? <CircularProgress size={20} /> : null
            }
          >
            {isDocumentAddingLoading ? "Adding..." : "Add Document"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isCalculateOustandingDialogOpen}
        onClose={() => setCalculateOustandingDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <DialogTitle>Oustanding Details</DialogTitle>
        </Box>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Principal{" "}
              </Typography>
              <Typography variant="body1">
                {" "}
                {allLoanCalculators?.outstandingPrincipal?.toLocaleString(
                  "en-US",
                  {
                    style: "currency",
                    currency: "INR",
                  }
                )}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Interest
              </Typography>
              <Typography variant="body1">
                {" "}
                {allLoanCalculators?.accruedRegularInterest?.toLocaleString(
                  "en-US",
                  {
                    style: "currency",
                    currency: "INR",
                  }
                )}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Delayed Interest{" "}
              </Typography>
              <Typography variant="body1">
                {" "}
                {allLoanCalculators?.accruedDelayInterest?.toLocaleString(
                  "en-US",
                  {
                    style: "currency",
                    currency: "INR",
                  }
                )}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Processing Fee
              </Typography>
              <Typography variant="body1">
                {" "}
                {allLoanCalculators?.processingFeeOutstanding?.toLocaleString(
                  "en-US",
                  {
                    style: "currency",
                    currency: "INR",
                  }
                )}
              </Typography>
            </Grid>
            <Grid item xs={6} md={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Outstanding
              </Typography>
              <Typography variant="body1">
                {(
                  (allLoanCalculators?.outstandingPrincipal ?? 0) +
                  (allLoanCalculators?.processingFeeOutstanding ?? 0) +
                  (allLoanCalculators?.accruedRegularInterest ?? 0) +
                  (allLoanCalculators?.accruedDelayInterest ?? 0)
                ).toLocaleString("en-US", {
                  style: "currency",
                  currency: "INR",
                })}
              </Typography>
            </Grid>
            <Grid
              item
              xs={6}
              md={12}
              sx={{ display: "flex", justifyContent: "end" }}
            >
              <NgIf condition={CommonService.checkPermission(["Add Payment"])}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setCalculateOustandingDialog(false);
                    openAddPaymentDialog();
                  }}
                >
                  Add New Payment
                </Button>
              </NgIf>

              <NgIf condition={CommonService.checkPermission(["Add Waiver"])}>
                <Button
                  variant="contained"
                  sx={{ ml: 2 }}
                  onClick={() => {
                    setCalculateOustandingDialog(false);
                    setWaiverDetails({
                      principalAmount: 0,
                      interest: 0,
                      delayedInterest: 0,
                    });
                    setWaiverDetailsDialog(true);
                  }}
                >
                  Waiver
                </Button>
              </NgIf>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculateOustandingDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isWaiverDetailsDialogOpen}
        onClose={() => setWaiverDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <DialogTitle>Waiver Details</DialogTitle>
        </Box>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Principal Amount"
                type="number"
                value={allWaiverDetails.principalAmount}
                onChange={(e) =>
                  handleWaiverForm("principalAmount", e.target.value)
                }
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Interest"
                value={allWaiverDetails.interest}
                onChange={(e) => handleWaiverForm("interest", e.target.value)}
                type="number"
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delayed Interest"
                value={allWaiverDetails.delayedInterest}
                onChange={(e) =>
                  handleWaiverForm("delayedInterest", e.target.value)
                }
                type="number"
                required
                size="small"
              />
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                variant="contained"
                onClick={() => addWaiverPaymentApiMethod()}
                loading={isWaiverApiLoading}
              >
                Submit Waiver
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWaiverDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default LoanDetails;
