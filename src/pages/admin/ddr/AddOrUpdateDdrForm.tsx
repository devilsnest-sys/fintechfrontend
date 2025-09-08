import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Autocomplete,
  Chip,
  FormHelperText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DealerOnboardingSecurityDeposite } from "../../../service/models/Dealer.model";
import {
  DdrDocumentListInterface,
  DdrInterface,
  DdrMastersApiResInterface,
  DdrPurchaseByDocumentListInterface,
  ddrStatusList,
} from "../../../service/models/Ddr.model";
import { formatISO } from "date-fns";
import APIService from "../../../service/API";
import { CloudUpload, Visibility } from "@mui/icons-material";
import CommonService from "../../../service/CommonService";
import NgIf from "../../../components/NgIf";
import NgFor from "../../../components/NgFor";

const tabsList = [
  { title: "Vehicle Information", permission: "Edit Vehicle Info for DDR" },
  { title: "Documents", permission: "Edit Docs for DDR" },
  { title: "Loan Details", permission: "Edit Loan Details for DDR" },
];

const permissionTabMap: { permission: string; tabIndex: number }[] = [
  { permission: "Edit Vehicle Info for DDR", tabIndex: 0 },
  { permission: "Edit Docs for DDR", tabIndex: 1 },
  { permission: "Edit Loan Details for DDR", tabIndex: 2 },
];

interface FormErrors {
  [key: string]: string;
}

const maxInvoiceDate = new Date();
let loadingDealers = false,
    isUploadedDocSubmit=false,
    decodeId='';

const AddOrUpdateDdrForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [allVehicleMakerList, setVehicleMakerList] = useState<
    DdrMastersApiResInterface[]
  >([]);
  const [allPurchaseSourceList, setVehiclePurchaseList] = useState<
    DdrMastersApiResInterface[]
  >([]);
  const [allPurchaseByDocOptionList, setPurchaseByDocOptionsList] = useState<
    DdrPurchaseByDocumentListInterface[]
  >([]);
  const [dealers, setDealers] = useState<
    {
      id: number;
      dealershipName: string;
      dealerCode: string;
      securityDepositDetails: DealerOnboardingSecurityDeposite[];
      city?:string;
    }[]
  >([]);
  const { encodedId } = useParams<{ encodedId: string }>();
  const mode = encodedId ? "edit" : "add";
  const [formData, setFormData] = useState<DdrInterface>({
    id: 0,
    ddrNumber: "",
    dateOfWithdraw: new Date().toISOString().split("T")[0],
    amount: 0,
    bidAmount: 0,
    interestRate: 0,
    dealerId: 0,
    applicationId: "",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 59))
      .toISOString()
      .split("T")[0],
    isActive: true,
    vehicleInfo: {
      id: 0,
      loanId: 0,
      make: "",
      model: "",
      registrationNumber: "",
      year: new Date().getFullYear(),
      chassisNumber: "",
      engineNumber: "",
      value: 0,
      color: "",
    },
    attachments: [],
    invoiceNumber: "",
    invoiceDate: "",
    purchaseSource: "",
    createdDate: formatISO(new Date()).split("T")[0],
    delayedROI: 0,
  });

  const [allDdrDocuments, setDdrDocuments] = useState<
    DdrDocumentListInterface[]
  >([]);
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
    for (const { permission, tabIndex } of permissionTabMap) {
      if (CommonService.checkPermission([permission])) {
        setActiveTab(tabIndex);
        break;
      }
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const dealersData = await APIService.getAllDealers();
        const activeDealers = dealersData.filter(
          (dealer) => dealer?.status === "Active"
        );
        setDealers(activeDealers);

        const [vehicleMakers] = await Promise.all([
          APIService.getVehicleMakerList(),
        ]);
        setVehicleMakerList(vehicleMakers);

        if (mode === "add" && !encodedId) {
          const purchaseSourceList = await APIService.getVehiclePurchaseList();
          const { ddrNumber } = await APIService.getDDrNo();
          setVehiclePurchaseList(purchaseSourceList);
          setFormData((prev) => ({
            ...prev,
            ddrNumber,
          }));
        }

        if (mode === "edit" && encodedId) {
          decodeId=atob(encodedId)
          const ddrDetails = await APIService.getDdrById(parseInt(decodeId));
          const allDdrDocuments = await APIService.getDdrDocumentsById(
            parseInt(decodeId)
          );
          const purchaseSourceList = await APIService.getVehiclePurchaseList();
          setDdrDocuments(allDdrDocuments);
          setVehiclePurchaseList(purchaseSourceList);
          if (!ddrDetails) throw new Error("Ddr data not found.");

          const purchaseSourceId = purchaseSourceList.find(
            (item) => item?.name === ddrDetails?.purchaseSource
          )?.id;
          const dealerSummaryStatics = await APIService.getDashboardSummary(String(ddrDetails.dealerId));
          if (purchaseSourceId) {
            const documents = await APIService.getPurchaseSourceByDocumentList(
              purchaseSourceId
            );
            const updatedAllDocs = documents.map((doc) => {
              const matchedUploaded = allDdrDocuments.find(
                (uploaded) => uploaded.documentType === doc.documentName
              );

              return {
                ...doc,
                uploadedDoc: matchedUploaded ? { ...matchedUploaded } : null,
              };
            });
            setPurchaseByDocOptionsList(updatedAllDocs);
          }

          const formatDate = (dateStr?: string) =>
            dateStr ? formatISO(new Date(dateStr)).split("T")[0] : "";

          const vehicleInfo = {
            id: ddrDetails?.vehicleInfo?.id ?? 0,
            make: ddrDetails?.vehicleInfo?.make ?? "",
            loanId: ddrDetails?.vehicleInfo?.loanId ?? parseInt(decodeId),
            model: ddrDetails?.vehicleInfo?.model ?? "",
            registrationNumber:
              ddrDetails?.vehicleInfo?.registrationNumber ?? "",
            year: Number(ddrDetails?.vehicleInfo?.year) || 0,
            engineNumber: ddrDetails?.vehicleInfo?.engineNumber ?? "",
            value: Number(ddrDetails?.vehicleInfo?.value) || 0,
            chassisNumber: ddrDetails?.vehicleInfo?.chassisNumber ?? "",
          };

          setFormData({
            ...ddrDetails,
            vehicleInfo,
            dateOfWithdraw: formatDate(ddrDetails?.dateOfWithdraw ?? ""),
            invoiceDate: formatDate(ddrDetails?.invoiceDate ?? ""),
            dealerId: ddrDetails?.dealer?.id ?? 0,
            totalAvailableLimit: dealerSummaryStatics?.availableLimit ?? 0,
          });
        }
      } catch (error) {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [encodedId, mode]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (activeTab === 0) {
      if (!formData.dealerId) errors.dealerId = "Dealers is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleNextTab = async () => {
  try {
    if (!validateForm()) {
      setError("Please check error messages marked in red ..!");
      return;
    }


    setSubmitting(true);

    const normalizeDate = (date?: string) => date || null;

    const normalizedFormData = {
      ...formData,
      invoiceDate: normalizeDate(formData?.invoiceDate??""),
      dueDate: normalizeDate(formData?.dueDate??""),
      dateOfWithdraw: normalizeDate(formData?.dateOfWithdraw??""),
      processingFeeReceivedDate: null,
      utrNumber: '',
    };

    switch (activeTab) {
      case 0: {
        const ddrResponse = formData.id
          ? await APIService.updateDDR(formData.id, normalizedFormData)
          : await APIService.createDdr(normalizedFormData);
        setFormData((prev) => ({
          ...prev,
          id: ddrResponse?.id,
        }));
        setActiveTab(activeTab + 1);
        setSuccessMsg("DDR saved successfully");
        break;
      }

      case 1: {
        isUploadedDocSubmit=true
      const requiredDocNotUploaded=allPurchaseByDocOptionList.filter((doc) => doc?.is_mandatory==true&&!doc?.document&&!doc?.uploadedDoc?.id);
      if (requiredDocNotUploaded?.length) {
        
        setError("Please check upload doc error message ..!");
        return;
      }
        const docsToUpload = allPurchaseByDocOptionList.filter((doc) => doc?.document);
        if (docsToUpload.length > 0) {
          await APIService.uploadMultiPleDdrDoc(formData.id, docsToUpload);
          setActiveTab(activeTab + 1);
          setSuccessMsg("Document uploaded successfully");
          const updatedDocs = await APIService.getDdrDocumentsById(formData.id);
          const updatedAllDocs = allPurchaseByDocOptionList.map((doc) => {
              const matchedUploaded = updatedDocs.find(
                (uploaded) => uploaded.documentType === doc.documentName
              );

              return {
                ...doc,
                uploadedDoc: matchedUploaded ? { ...matchedUploaded } : null,
              };
            });
            setPurchaseByDocOptionsList(updatedAllDocs);
          setDdrDocuments(updatedDocs);
        }
        isUploadedDocSubmit=false
        break;
      }

      case 2: {
         if (formData.amount > formData?.bidAmount) {
           setError("BID amount should be greater than loan amount ..!");
           return;
         }
         if (formData?.totalAvailableLimit&&formData.amount > formData?.totalAvailableLimit) {
           setError("Available Limit should be greater than loan amount ..!");
           return;
         }
        await APIService.updateDDR(formData.id, normalizedFormData);
        
        setSuccessMsg(`DDR ${encodedId ? "updated" : "created"} successfully`);
        setTimeout(() => {
          navigate("/ddr-listing");
        }, 2000);
        break;
      }

      default:
        break;
    }
  } catch (err: any) {
    setError(
      err?.response?.data?.message ??
        `Failed to ${encodedId ? "update" : "create"} DDR. Please try again.`
    );
  } finally {
    setSubmitting(false);
  }
};

  const handleChange = (field: string, value: any) => {
    if (field === "dealerId" && value) {
    const filterDealerObj = dealers.find(
      (dealerItem) => dealerItem.id == value
    );
    const fetchDealerSummary = async () => {
        const dealerSummaryStatics = await APIService.getDashboardSummary(value);
        setFormData((prev) => {
          const updated = {
            ...prev,
            [field]: value,
            delayedROI: filterDealerObj?.securityDepositDetails?.[0]?.delayROI ?? 0,
            interestRate: filterDealerObj?.securityDepositDetails?.[0]?.roi ?? 0,
            totalAvailableLimit: dealerSummaryStatics?.availableLimit ?? 0,
          };

          return updated;
        });
    };
    fetchDealerSummary(); 
    } else if (field == "purchaseSource") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      fetchPurchaseSourceByDocumentsList(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const fetchPurchaseSourceByDocumentsList = async (name: string) => {
    const purchaseSourceDocumentId = allPurchaseSourceList.find(
      (purchaseSourceItem) => purchaseSourceItem?.name == name
    )?.id;
    const purchaseByDocumentList =
      await APIService.getPurchaseSourceByDocumentList(
        purchaseSourceDocumentId ?? 0
      );
    setPurchaseByDocOptionsList(purchaseByDocumentList);
  };

  const handleVehicleInfoChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      vehicleInfo: {
        ...prev.vehicleInfo,
        [field]: value,
      },
    }));
  };
  const handlePurchaseDocUpload = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    rowIndex: number
  ): void => {
    const updatedDocs = [...allPurchaseByDocOptionList];
    if (!updatedDocs[rowIndex]) return;
    const input = event as React.ChangeEvent<HTMLInputElement>;
    const file = input.target.files?.[0];
    input.target.value = "";
    if (!file) return;
    updatedDocs[rowIndex].document = file;
    setPurchaseByDocOptionsList(updatedDocs);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewDocument = (filePath: string) => {
    window.open(filePath, "_blank");
  };

  const pageTitle = mode === "add" ? "Create New DDR" : "Edit DDR";

  const renderTabsContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DDR Number"
                value={formData.ddrNumber}
                onChange={(e) => handleChange("ddrNumber", e.target.value)}
                size="small"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required size="small">
                <Autocomplete
                  options={dealers}
                  getOptionLabel={(option) =>
                    option.dealershipName + " (" + option?.dealerCode + ")"+ (option?.city? " - " +option?.city:'')  ||
                    ""
                  }
                  value={
                    dealers.find((dealer) => dealer.id === formData.dealerId) ||
                    null
                  }
                  loading={loadingDealers}
                  onChange={(event, newValue) => {
                    handleChange("dealerId", newValue ? newValue.id : 0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Dealer"
                      error={!!formErrors?.dealerId}
                      helperText={formErrors?.dealerId || ""}
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingDealers ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="purchase-source-label">
                  Purchase Source
                </InputLabel>
                <Select
                  labelId="purchase-source-label"
                  value={formData.purchaseSource}
                  onChange={(e) =>
                    handleChange("purchaseSource", e.target.value)
                  }
                  label="Purchase Source"
                >
                  {allPurchaseSourceList?.map((makerItem) => (
                    <MenuItem key={makerItem?.id} value={makerItem?.name}>
                      {makerItem?.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors?.make && (
                  <FormHelperText error>{formErrors?.make}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="vehicle-maker-label">Maker</InputLabel>
                <Select
                  labelId="vehicle-maker-label"
                  value={formData.vehicleInfo.make}
                  onChange={(e) =>
                    handleVehicleInfoChange("make", e.target.value)
                  }
                  label="Maker"
                >
                  {allVehicleMakerList?.map((makerItem) => (
                    <MenuItem key={makerItem?.id} value={makerItem?.name}>
                      {makerItem?.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors?.make && (
                  <FormHelperText error>{formErrors?.make}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model"
                value={formData.vehicleInfo.model}
                onChange={(e) =>
                  handleVehicleInfoChange("model", e.target.value)
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Colour"
                type="text"
                value={formData.vehicleInfo.color}
                onChange={(e) =>
                  handleVehicleInfoChange("color", e.target.value)
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Registration Number"
                value={formData.vehicleInfo.registrationNumber}
                onChange={(e) =>
                  handleVehicleInfoChange("registrationNumber", e.target.value)
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={formData.vehicleInfo.year}
                onChange={(e) =>
                  handleVehicleInfoChange("year", parseInt(e.target.value))
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chassis Number"
                value={formData.vehicleInfo.chassisNumber}
                onChange={(e) =>
                  handleVehicleInfoChange("chassisNumber", e.target.value)
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Engine Number"
                value={formData.vehicleInfo.engineNumber}
                onChange={(e) =>
                  handleVehicleInfoChange("engineNumber", e.target.value)
                }
                size="small"
              />
            </Grid>
            {allPurchaseSourceList?.map((makerItem) => (
                    < >
                     {(makerItem?.name === formData.purchaseSource) && makerItem?.isApplicationNoRequired && (
                      <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Application Id"
                        type="text"
                        value={formData.applicationId}
                        onChange={(e) =>
                          handleChange("applicationId", e.target.value)
                        }
                        size="small"
                      />
                    </Grid>
                     )} 
                    </>
                  ))}
            
          </Grid>
        );
      case 1:
        return (
          <Box>
            <Grid container spacing={3}>
              <NgIf condition={allPurchaseByDocOptionList?.length > 0}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Documents
                  </Typography>
                </Grid>
              </NgIf>

              <NgFor
                items={allPurchaseByDocOptionList}
                render={(purchaseByDocumentItem, docIndex) => (
                  <Grid item xs={12} md={6} key={docIndex + "index"}>
                     <Typography variant="body2" gutterBottom>
                      {purchaseByDocumentItem?.document?.name ??
                        `${
                          purchaseByDocumentItem?.uploadedDoc?.id
                            ? "Change"
                            : "Upload"
                        } ${purchaseByDocumentItem?.documentName}  `}
                    </Typography>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      fullWidth
                    >
                      {purchaseByDocumentItem?.document?.name ??
                        `${
                          purchaseByDocumentItem?.uploadedDoc?.id
                            ? "Change"
                            : "Upload"
                        } ${purchaseByDocumentItem?.documentName}  `}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handlePurchaseDocUpload(e, docIndex)}
                      />
                    </Button>
                    {!purchaseByDocumentItem?.document?.name &&
                      !purchaseByDocumentItem?.uploadedDoc?.id &&
                      purchaseByDocumentItem?.is_mandatory &&
                      isUploadedDocSubmit && (
                        <FormHelperText error>
                          {purchaseByDocumentItem?.documentName} is required *
                        </FormHelperText>
                      )}
                  </Grid>
                )}
              ></NgFor>

              <NgIf condition={formData?.id > 0}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Documents</Typography>
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
                        {allDdrDocuments?.length > 0 ? (
                          allDdrDocuments.map((doc) => (
                            <TableRow key={doc.uploadedOn}>
                              <TableCell>{doc?.documentType}</TableCell>
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
                                  {doc?.filePath && (
                                    <Tooltip title="View Document">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleViewDocument(doc.filePath)
                                        }
                                        sx={{ color: "#1e3a8a" }}
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={16}
                              align="center"
                              sx={{ py: 3 }}
                            >
                              No documents found for this dealer
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </NgIf>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Grid container spacing={3}>
           <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fair Market Value"
                type="number"
                value={formData.vehicleInfo.value}
                onChange={(e) =>
                  handleVehicleInfoChange("value", parseFloat(e.target.value))
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Loan amount"
                type="number"
                required
                value={formData.amount}
                onChange={(e) =>
                  handleChange("amount", parseFloat(e.target.value))
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="BID Amount"
                type="number"
                required
                value={formData.bidAmount}
                onChange={(e) =>
                  handleChange("bidAmount", parseFloat(e.target.value))
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Available Limit"
                type="number"
                value={formData.totalAvailableLimit}
                onChange={(e) =>
                  handleChange("totalAvailableLimit", parseFloat(e.target.value))
                }
                size="small"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Interest Rate"
                type="number"
                value={formData.interestRate}
                onChange={(e) =>
                  handleChange("interestRate", parseFloat(e.target.value))
                }
                size="small"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Delay Roi"
                type="number"
                required
                value={formData.delayedROI}
                onChange={(e) =>
                  handleChange("delayedROI", parseFloat(e.target.value))
                }
                size="small"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                required
                value={formData.invoiceNumber}
                onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.invoiceDate}
                inputProps={{
                  max: maxInvoiceDate.toISOString().split("T")[0],
                }}
                onChange={(e) => handleChange("invoiceDate", e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          my: 3,
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          p: 1,
          bgcolor: "#fff",
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
          <div>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {pageTitle}
            </Typography>
            {mode === "edit" && formData.id > 0 && (
              <Typography variant="subtitle2" color="text.secondary">
                DDR No: {formData.ddrNumber}
              </Typography>
            )}
            {mode != "edit" && !formData.id && (
              <Typography variant="subtitle1" color="text.secondary">
                Fill in the details to create a new DDR
              </Typography>
            )}
          </div>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {ddrStatusList[formData?.status ?? 0].name && (
            <Chip
              label={ddrStatusList[formData?.status ?? 0].name}
              size="small"
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ px: 3, pb: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ borderBottom: 1, mb: 3, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="dddr updating tabs"
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
              >
                {tabsList.map(({ title, permission }) => {
                  const hasPermission = CommonService.checkPermission([
                    permission,
                  ]);
                  return (
                    <Tab
                      key={title}
                      label={title}
                      disabled={!hasPermission}
                      sx={{
                        opacity: hasPermission ? 1 : 0.5,
                      }}
                    />
                  );
                })}
              </Tabs>
            </Box>

            {renderTabsContent(activeTab)}
          </Paper>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, my: 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleNextTab()}
              disabled={isSubmitting}
            >
              {activeTab == 2 ? "Submit" : "Save & Next"}
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default AddOrUpdateDdrForm;
