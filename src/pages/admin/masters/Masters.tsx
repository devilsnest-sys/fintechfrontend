import React, { useState, useEffect, useRef } from 'react';
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
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  InputAdornment,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  DialogContentText,
  Autocomplete
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutline } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import APIService from '../../../service/API';
import CommonService from '../../../service/CommonService';
import NgIf from '../../../components/NgIf';

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

interface MastersProps {}

interface DealerMastersApiResInterface {
  id: number;
  name: string;
  code?: string;
  bidAmountPercentage?: number;
}

interface DdrMastersApiResInterface {
  id: number;
  name: string;
  accountNumber: string;
  bankName: string;
  ifsc: string;
  branchName: string;
  is_credit_account: boolean;
}

interface PurchaseSourceDocument {
  id: number;
  purchaseSourceId: number;
  documentName: string;
  is_mandatory: boolean;
}

const Masters: React.FC<MastersProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const didRunRef = useRef(false);

  // Get active tab from URL parameter
  const searchParams = new URLSearchParams(location.search);
  const activeTab = parseInt(searchParams.get('tab') || '0');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formName, setFormName] = useState<string>("");
  const [bidAmountPercentage, setBidAmountPercentage] = useState<number>(0);
  const [applicationNumber, setApplicationNumber] = useState<number>(0);
  const [formLoading, setFormLoading] = useState<boolean>(false);

  // Purchase Source Document specific states
  const [purchaseSourceDocumentDialogOpen, setPurchaseSourceDocumentDialogOpen] = useState<boolean>(false);
  const [selectedPurchaseSourceId, setSelectedPurchaseSourceId] = useState<number>(0);
  const [documentName, setDocumentName] = useState<string>("");
  const [isPurchaseDocRequired, setPurchaseDocRequired] = useState<boolean>(false);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // Data states for different master types
  const [entityTypes, setEntityTypes] = useState<DealerMastersApiResInterface[]>([]);
  const [businessCategories, setBusinessCategories] = useState<DealerMastersApiResInterface[]>([]);
  const [businessTypes, setBusinessTypes] = useState<DealerMastersApiResInterface[]>([]);
  const [addressStatuses, setAddressStatuses] = useState<DealerMastersApiResInterface[]>([]);
  const [personTypes, setPersonTypes] = useState<DealerMastersApiResInterface[]>([]);
  const [bankDetails, setBankDetails] = useState<DdrMastersApiResInterface[]>([]);
  const [purchaseSources, setPurchaseSources] = useState<DealerMastersApiResInterface[]>([]);
  const [makes, setMakes] = useState<DealerMastersApiResInterface[]>([]);
  const [chequeLocations, setChequeLocations] = useState<DealerMastersApiResInterface[]>([]);
  const [purchaseSourceDocuments, setPurchaseSourceDocuments] = useState<PurchaseSourceDocument[]>([]);
  const [states, setStates] = useState<DealerMastersApiResInterface[]>([]);
  const [cities, setCities] = useState<DealerMastersApiResInterface[]>([]);
  const [designation, setDesignation] = useState<DealerMastersApiResInterface[]>([]);
  const [selectedState, setSelectedState] = useState<DealerMastersApiResInterface | null>(null);
  const [bankFormData, setBankFormData] = useState({
    id: 0,
    name: "",
    accountNumber: "",
    bankName: "",
    ifsc: "",
    branchName: "",
    is_credit_account: false
  });

  // Filtered data states
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const tabs = [
    { label: "Entity Type", value: 0, apiEndpoint: "entity-type" },
    { label: "Business Category", value: 1, apiEndpoint: "business-category" },
    { label: "Business Type", value: 2, apiEndpoint: "business-type" },
    { label: "Address Status", value: 3, apiEndpoint: "address-status" },
    { label: "Person Type", value: 4, apiEndpoint: "person-type" },
    { label: "Bank Detail", value: 5, apiEndpoint: "bank-details" },
    { label: "Purchase Source", value: 6, apiEndpoint: "purchase-source" },
    { label: "Make", value: 7, apiEndpoint: "make" },
    { label: "Cheque Location", value: 8, apiEndpoint: "cheque-location" },
    { label: "Purchase Source Documents", value: 9, apiEndpoint: "purchase-source-documents" },
    { label: "Designation", value: 10, apiEndpoint: "designation" },
    { label: "States", value: 11, apiEndpoint: "states" },
    { label: "Cities", value: 12, apiEndpoint: "cities" },
  ];

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
    fetchAllMasters();
  }, []);

  // Update filtered data when activeTab changes
  useEffect(() => {
    if (activeTab === 9) {
      fetchPurchaseSourceDocuments();
    } else {
      const currentData = getCurrentData();
      setFilteredData(currentData);
    }
    setSearchTerm("");
    setPage(0);
  }, [activeTab]);

  const fetchAllMasters = async () => {
    try {
      setLoading(true);
      const [
        entityTypesData,
        businessCategoriesData,
        businessTypesData,
        addressStatusesData,
        personTypesData,
        bankDetails,
        purchaseSourcesData,
        makesData,
        chequeLocationsData,
        stateList,
        designationList,
      ] = await Promise.all([
        APIService.getDealerEntityTypeList(),
        APIService.getDealerBusinessCategoryList(),
        APIService.getDealerBusinessTypeList(),
        APIService.getDealerAddressStatusList(),
        APIService.getDealerPersonTypeList(),
        APIService.getBankDetails(),
        APIService.getVehiclePurchaseList(),
        APIService.getVehicleMakerList(),
        APIService.getDealerLocationsOfCheque(),
           APIService.getAllStateList(),
           APIService.getDesignations(),
      ]);

      setEntityTypes(entityTypesData);
      setBusinessCategories(businessCategoriesData);
      setBusinessTypes(businessTypesData);
      setAddressStatuses(addressStatusesData);
      setPersonTypes(personTypesData);
      setBankDetails(bankDetails);
      setPurchaseSources(purchaseSourcesData);
      setMakes(makesData);
      setChequeLocations(chequeLocationsData);
      setStates(stateList);
      setDesignation(designationList);
      // Set initial filtered data based on active tab
      const currentData = getCurrentData();
      setFilteredData(currentData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch masters data");
      setLoading(false);
    }
  };

  const fetchPurchaseSourceDocuments = async () => {
    try {
      setLoading(true);
      // Fetch documents for all purchase sources
      const allDocuments: PurchaseSourceDocument[] = [];
      
      for (const purchaseSource of purchaseSources) {
        try {
          const documents = await APIService.getPurchaseSourceByDocumentList(purchaseSource.id);
          allDocuments.push(...documents);
        } catch (error) {
          console.error(`Error fetching documents for purchase source ${purchaseSource.id}:`, error);
        }
      }
      
      setPurchaseSourceDocuments(allDocuments);
      setFilteredData(allDocuments);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching purchase source documents:", err);
      setError("Failed to fetch purchase source documents");
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 0: return entityTypes;
      case 1: return businessCategories;
      case 2: return businessTypes;
      case 3: return addressStatuses;
      case 4: return personTypes;
      case 5: return bankDetails;
      case 6: return purchaseSources;
      case 7: return makes;
      case 8: return chequeLocations;
      case 9: return purchaseSourceDocuments;
      case 10: return designation;
      case 11: return states;
      case 12: return cities;
      default: return [];
    }
  };

  const updateCurrentData = (newData: any[]) => {
    switch (activeTab) {
      case 0: setEntityTypes(newData); break;
      case 1: setBusinessCategories(newData); break;
      case 2: setBusinessTypes(newData); break;
      case 3: setAddressStatuses(newData); break;
      case 4: setPersonTypes(newData); break;
      case 5: setBankDetails(newData); break;
      case 6: setPurchaseSources(newData); break;
      case 7: setMakes(newData); break;
      case 8: setChequeLocations(newData); break;
      case 9: setPurchaseSourceDocuments(newData); break;
      case 10: setDesignation(newData); break;
      case 11: setStates(newData); break;
      case 12: setCities(newData); break;
    }
  };

  useEffect(() => {
    const currentData = getCurrentData();
    let results = [];
    
    if (activeTab === 9) {
      // Special handling for Purchase Source Documents
      results = currentData.filter((item: PurchaseSourceDocument) => {
        const purchaseSource = purchaseSources.find(ps => ps.id === item.purchaseSourceId);
        const searchFields = [
          item.documentName,
          purchaseSource?.name || ""
        ].filter(Boolean);
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    } else {
      results = currentData.filter((item: any) => {
        const searchFields = [item.name, item.description, item.code].filter(Boolean);
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    setFilteredData(results);
    setPage(0);
  }, [searchTerm, activeTab, entityTypes, businessCategories, businessTypes, addressStatuses, personTypes, bankDetails, purchaseSources, makes, chequeLocations, purchaseSourceDocuments]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get API methods for each tab
  const getApiMethods = (activeTab: number) => {
    const methods = {
      0: { // Entity Type
        create: APIService.createEntityType,
        update: APIService.updateEntityType,
        delete: APIService.deleteEntityType,
      },
      1: { // Business Category
        create: APIService.createBusinessCategory,
        update: APIService.updateBusinessCategory,
        delete: APIService.deleteBusinessCategory,
      },
      2: { // Business Type
        create: APIService.createBusinessType,
        update: APIService.updateBusinessType,
        delete: APIService.deleteBusinessType,
      },
      3: { // Address Status
        create: APIService.createAddressStatus,
        update: APIService.updateAddressStatus,
        delete: APIService.deleteAddressStatus,
      },
      4: { // Person Type
        create: APIService.createPersonType,
        update: APIService.updatePersonType,
        delete: APIService.deletePersonType,
      },
      5: { // Bank Details
        create: APIService.createBankDetail,
        update: APIService.updateBankDetail,
        delete: APIService.deleteBankDetail,
      },
      6: { // Purchase Source
        create: APIService.createPurchaseSource,
        update: APIService.updatePurchaseSource,
        delete: APIService.deletePurchaseSource,
      },
      7: { // Make
        create: APIService.createMake,
        update: APIService.updateMake,
        delete: APIService.deleteMake,
      },
      8: { // Cheque Location
        create: APIService.createChequeLocation,
        update: APIService.updateChequeLocation,
        delete: APIService.deleteChequeLocation,
      },
      9: { // Purchase Source Documents
        create: APIService.createPurchaseSourceDocument,
        update: APIService.updatePurchaseSourceDocument,
        delete: APIService.deletePurchaseSourceDocument,
      },
      10:{
        create: APIService.addDesignation,
        update: APIService.updateDesignation,
        delete: APIService.deleteDesignation,
      },
      11: {
        create: APIService.getAllStateList,
        update: APIService.updateState,
      },
      12: {
        create: APIService.newCity,
        update: APIService.updateCity,
      }
    };
    
    return methods[activeTab as keyof typeof methods];
  };

  // Add Master
  const handleAddMaster = () => {
    if (activeTab === 9) {
      // Special handling for Purchase Source Documents
      setSelectedPurchaseSourceId(0);
      setDocumentName("");
      setPurchaseDocRequired(false)
      setPurchaseSourceDocumentDialogOpen(true);
    }
    else if (activeTab === 5) {
    // Special handling for Bank Details
    setBankFormData({
      id: 0,
      name: "",
      accountNumber: "",
      bankName: "",
      ifsc: "",
      branchName: "",
      is_credit_account: false
    });
    setAddDialogOpen(true);
    } 
    else {
      setFormName("");
      setBidAmountPercentage(0);
      setAddDialogOpen(true);
    }
  };

  const handleAddSubmit = async () => {
     if (activeTab === 5) {
    // Special validation for Bank Details
    if (!bankFormData.name.trim() || !bankFormData.accountNumber.trim() || 
        !bankFormData.bankName.trim() || !bankFormData.ifsc.trim() || 
        !bankFormData.branchName.trim()) {
      showSnackbar("All fields are required for Bank Details", "error");
      return;
    }
  } else {
    if (!formName.trim()) {
      showSnackbar("Name is required", "error");
      return;
    }
  }

    try {
      setFormLoading(true);
       if (activeTab === 10) {
      // Add new Designation
      await APIService.addDesignation(formName.trim());
      // Refetch designations after add
      const designationList = await APIService.getDesignations();
      setDesignation(designationList);
      setFilteredData(designationList);
    } else if (activeTab === 11) {
      // Add new State
      await APIService.addState(formName.trim());
    } else if (activeTab === 12) {
      // Add new City
      if (!selectedState || !selectedState.id) {
        showSnackbar('Please select a State before adding a City.', 'error');
        return;
      }
      await APIService.newCity(selectedState.id, formName.trim());
      // Refetch cities for the selected state after adding
      if (selectedState) {
        const cityList = await APIService.getStateByCityList(selectedState.id);
        setCities(cityList);
        setFilteredData(cityList);
      }
    } else if (activeTab != 5) {
      const apiMethods = getApiMethods(activeTab);
      const data = { id: 0, name: formName.trim(), bidAmountPercentage: bidAmountPercentage };
      await apiMethods.create(data);
    } else if (activeTab === 5) {
      await APIService.createBankDetail(bankFormData);
    }
      
      // Refresh data
      await fetchAllMasters();
      
      setAddDialogOpen(false);
      setFormName("");
      setBankFormData({
      id: 0,  
      name: "",
      accountNumber: "",
      bankName: "",
      ifsc: "",
      branchName: "",
      is_credit_account: false
    });
      showSnackbar(`${tabs[activeTab].label} added successfully`, "success");
    } catch (error) {
      console.error("Error adding master:", error);
      showSnackbar(`Failed to add ${tabs[activeTab].label}`, "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Add Purchase Source Document
  const handleAddPurchaseSourceDocument = async () => {
    if (!selectedPurchaseSourceId || !documentName.trim()) {
      showSnackbar("Purchase source and document name are required", "error");
      return;
    }

    try {
      setFormLoading(true);
      
      const data = {
        purchaseSourceId: selectedPurchaseSourceId,
        documentNames: [documentName.trim()],
        is_mandatory: isPurchaseDocRequired
      };
      
      await APIService.createPurchaseSourceDocument(selectedPurchaseSourceId, data);
      
      // Refresh purchase source documents
      await fetchPurchaseSourceDocuments();
      
      setPurchaseSourceDocumentDialogOpen(false);
      setSelectedPurchaseSourceId(0);
      setDocumentName("");
      showSnackbar("Purchase source document added successfully", "success");
    } catch (error) {
      console.error("Error adding purchase source document:", error);
      showSnackbar("Failed to add purchase source document", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Edit Master
const handleEditMaster = (item: any) => {
  if (activeTab === 12) {
    // Ensure city has a valid stateId for editing
    setSelectedItem({ ...item, stateId: item.stateId || selectedState?.id || 0 });
  } 
  else if( activeTab === 6 ){
    
    setSelectedItem({ ...item, loanBidAmtPercentage: item.loanBidAmtPercentage || 0, isApplicationNoRequired: item.isApplicationNoRequired || false });
    setApplicationNumber(item?.isApplicationNoRequired === true ? 1 : 0);
  }
  
  else {
    setSelectedItem({ ...item });
  }
  if (activeTab === 5) {
    // Special handling for Bank Details
    setBankFormData({
      id: item?.id ?? 0,
      name: item.name || "",
      accountNumber: item.accountNumber || "",
      bankName: item.bankName || "",
      ifsc: item.ifsc || "",
      branchName: item.branchName || "",
      is_credit_account: item?.is_credit_account || false,
    });
  } else {
    setFormName(item.name || item.documentName || "");
    setBidAmountPercentage(item?.bidAmountPercentage || 0);
    setPurchaseDocRequired(item?.is_mandatory ?? false);
  }
  setEditDialogOpen(true);
};

  const handleEditSubmit = async () => {
  if (activeTab === 5) {
    // Special validation for Bank Details
    if (!bankFormData.name.trim() || !bankFormData.accountNumber.trim() || 
        !bankFormData.bankName.trim() || !bankFormData.ifsc.trim() || 
        !bankFormData.branchName.trim()) {
      showSnackbar("All fields are required for Bank Details", "error");
      return;
    }
  } else {
    if (!formName.trim()) {
      showSnackbar("Name is required", "error");
      return;
    }
  }

  try {
    setFormLoading(true);
    
    if (activeTab === 9) {
      // Special handling for Purchase Source Documents
      const data = {
        purchaseSourceId: selectedItem?.purchaseSourceId,
        documentNames: [formName.trim()],
        is_mandatory: isPurchaseDocRequired
      };
      
      await APIService.createPurchaseSourceDocument(selectedItem?.purchaseSourceId, data);
    } else if (activeTab === 5) {
      const data = {
        id: selectedItem.id,
        name: bankFormData.name.trim(),
        accountNumber: bankFormData.accountNumber.trim(),
        bankName: bankFormData.bankName.trim(),
        ifsc: bankFormData.ifsc.trim(),
        branchName: bankFormData.branchName.trim(),
        is_credit_account: bankFormData.is_credit_account,
      };
      await APIService.updateBankDetail(selectedItem.id, data);
    } else {
      const apiMethods = getApiMethods(activeTab);
    if (activeTab === 6) {
      // For Purchase Source, send all three required fields
      const data = {
        id: selectedItem.id,
        name: formName.trim(),
        loanBidAmtPercentage: bidAmountPercentage,
        isApplicationNoRequired: applicationNumber === 1
      };
      await apiMethods.update(selectedItem.id, data);
    } else if (activeTab === 11) {
      // For States, pass only the name string
      await apiMethods.update(selectedItem.id, formName.trim());
    } else if (activeTab === 12) {
      // For Cities, pass cityId, stateId, and name
      await apiMethods.update(selectedItem.id, selectedItem.stateId, formName.trim());
    } else {
      await apiMethods.update(selectedItem.id, formName.trim());
    }
    }
    
    // Refresh data
    if (activeTab === 9) {
      await fetchPurchaseSourceDocuments();
    } else if (activeTab === 12) {
      // Refetch cities for the selected state after city update
      if (selectedState) {
        const cityList = await APIService.getStateByCityList(selectedState.id);
        setCities(cityList);
        setFilteredData(cityList);
      }
    } else {
      await fetchAllMasters();
    }
    
    setEditDialogOpen(false);
    setFormName("");
    setBankFormData({
      id: 0,
      name: "",
      accountNumber: "",
      bankName: "",
      ifsc: "",
      branchName: "",
      is_credit_account: false
    });
    setSelectedItem(null);
    showSnackbar(`${tabs[activeTab].label} updated successfully`, "success");
  } catch (error) {
    console.error("Error updating master:", error);
    showSnackbar(`Failed to update ${tabs[activeTab].label}`, "error");
  } finally {
    setFormLoading(false);
  }
};

  // Delete Master
  const handleDeleteMaster = (item: any) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setFormLoading(true);
      
      if (activeTab === 9) {
        // Special handling for Purchase Source Documents
        await APIService.deletePurchaseSourceDocument(selectedItem.id);
      } else {
        const apiMethods = getApiMethods(activeTab);
        await apiMethods.delete(selectedItem.id);
      }
      
      // Refresh data
      if (activeTab === 9) {
        await fetchPurchaseSourceDocuments();
      } else {
        await fetchAllMasters();
      }
      
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      showSnackbar(`${tabs[activeTab].label} deleted successfully`, "success");
    } catch (error) {
      console.error("Error deleting master:", error);
      showSnackbar(`Failed to delete ${tabs[activeTab].label}`, "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Snackbar
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const renderTableHeaders = () => {
    if (activeTab === 9) {
      // Purchase Source Documents headers
      return (
        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
          <TableCell>S.No</TableCell>
          <TableCell>Purchase Source</TableCell>
          <TableCell>Document Name</TableCell>
          <TableCell>Required</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      );
    }
    else if (activeTab === 5) {
    // Bank Details headers
    return (
      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
        <TableCell>S.No</TableCell>
        <TableCell>Name</TableCell>
        <TableCell>Account Number</TableCell>
        <TableCell>Bank Name</TableCell>
        <TableCell>IFSC</TableCell>
        <TableCell>Branch Name</TableCell>
        <TableCell>Disbursal Account</TableCell>
        <TableCell>Action</TableCell>
      </TableRow>
    );
  }
    
    return (
      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
        <TableCell>S.No</TableCell>
        <TableCell>Name</TableCell>
        {(activeTab === 6 || activeTab === 7) && <TableCell>Code</TableCell>}
      {activeTab === 6 && <>
        <TableCell>Loan Bid Amount %</TableCell>
        <TableCell>Is Application No. Required</TableCell>
      </>}
        <TableCell>Action</TableCell>
      </TableRow>
    );
  };

  const renderTableRow = (item: any, index: number) => {
    if (activeTab === 9) {
      // Purchase Source Documents row
      const purchaseSource = purchaseSources.find(ps => ps.id === item.purchaseSourceId);
      return (
        <TableRow hover key={item.id || index}>
          <TableCell>{page * rowsPerPage + index + 1}</TableCell>
          <TableCell>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  mr: 1,
                  bgcolor: "#1e3a8a",
                }}
              >
                {(purchaseSource?.name || "P").charAt(0)}
              </Avatar>
              {purchaseSource?.name || "N/A"}
            </Box>
          </TableCell>
          <TableCell>{item.documentName || "N/A"}</TableCell>
          <TableCell>{item?.is_mandatory == true ? "Yes" : "No"}</TableCell>
          <TableCell>
            <Box sx={{ display: "flex", gap: 1 }}>
              <NgIf condition={CommonService.checkPermission(["Edit Master"])}>
                <Tooltip title="Edit Document">
                  <IconButton
                    size="small"
                    onClick={() => handleEditMaster(item)}
                    sx={{ color: "#2e7d32" }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </NgIf>
              <NgIf condition={CommonService.checkPermission(["Delete Master"])}>
                <Tooltip title="Delete Document">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteMaster(item)}
                    sx={{ color: "#d32f2f" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </NgIf>
            </Box>
          </TableCell>
        </TableRow>
      );
    }
    else if (activeTab === 5) {
    // Bank Details row
    return (
      <TableRow hover key={item.id || index}>
        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1,
                bgcolor: "#1e3a8a",
              }}
            >
              {(item.name || "B").charAt(0)}
            </Avatar>
            {item.name || "N/A"}
          </Box>
        </TableCell>
        <TableCell>{item.accountNumber || "N/A"}</TableCell>
        <TableCell>{item.bankName || "N/A"}</TableCell>
        <TableCell>{item.ifsc || "N/A"}</TableCell>
        <TableCell>{item.branchName || "N/A"}</TableCell>
        <TableCell>{item?.is_credit_account ? 'Yes' : 'No'}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 1 }}>
            <NgIf condition={CommonService.checkPermission(["Edit Master"])}>
              <Tooltip title="Edit Bank Detail">
                <IconButton
                  size="small"
                  onClick={() => handleEditMaster(item)}
                  sx={{ color: "#2e7d32" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </NgIf>

            <NgIf condition={CommonService.checkPermission(["Delete Master"])}>
              <Tooltip title="Delete Bank Detail">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteMaster(item)}
                  sx={{ color: "#d32f2f" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </NgIf>
          </Box>
        </TableCell>
      </TableRow>
    );
  }
    return (
      <TableRow hover key={item.id || index}>
        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1,
                bgcolor: "#1e3a8a",
              }}
            >
              {(item.name || "N").charAt(0)}
            </Avatar>
            {item.name || "N/A"}
          </Box>
        </TableCell>
        {(activeTab === 6 || activeTab === 7) && (
        <TableCell>{item.code || "N/A"}</TableCell>
      )}
      {activeTab === 6 && (
        <>
          <TableCell>{item.loanBidAmtPercentage ?? item.loanBidAmtPercentage === 0 ? item.loanBidAmtPercentage : "N/A"}</TableCell>
          <TableCell>{item.isApplicationNoRequired === true ? "Yes" : item.isApplicationNoRequired === false ? "No" : "N/A"}</TableCell>
        </>
      )}
        <TableCell>
          <Box sx={{ display: "flex", gap: 1 }}>
            <NgIf condition={CommonService.checkPermission(["Edit Master"])}>
              <Tooltip title="Edit Master">
                <IconButton
                  size="small"
                  onClick={() => handleEditMaster(item)}
                  sx={{ color: "#2e7d32" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </NgIf>

            <NgIf condition={CommonService.checkPermission(["Delete Master"]) && activeTab !== 11 && activeTab !== 12}>
              <Tooltip title="Delete Master">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteMaster(item)}
                  sx={{ color: "#d32f2f" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </NgIf>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  const getColumnCount = () => {
    if (activeTab === 9) return 5; // Purchase Source Documents
    if (activeTab === 5) return 8; // Bank Details
    if (activeTab === 6 || activeTab === 7) return 4; // Purchase Source or Make
    return 3; // Other tabs
  };

  // const handleTabChange = (newTab: number) => {
  //   const newSearchParams = new URLSearchParams();
  //   newSearchParams.set('tab', newTab.toString());
  //   navigate(`${location.pathname}?${newSearchParams.toString()}`);
  // };

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
        <div> 
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {tabs[activeTab]?.label} Management
          </Typography>
        </div>
        <Box sx={{ display: "flex", gap: 2 }}>
          <NgIf condition={CommonService.checkPermission(["Add Master"])}>
            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              onClick={handleAddMaster}
              sx={{
                backgroundColor: "#1e3a8a",
                "&:hover": { backgroundColor: "#1e40af" },
              }}
            >
              Add {tabs[activeTab]?.label}
            </Button>
          </NgIf>
        </Box>
      </Box>

      {/* Tab Navigation */}
      {/* <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "contained" : "outlined"}
              onClick={() => handleTabChange(tab.value)}
              sx={{
                mb: 1,
                backgroundColor: activeTab === tab.value ? "#1e3a8a" : "transparent",
                color: activeTab === tab.value ? "white" : "#1e3a8a",
                borderColor: "#1e3a8a",
                "&:hover": {
                  backgroundColor: activeTab === tab.value ? "#1e40af" : "#e3f2fd",
                },
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
      </Box> */}

      {/* Search */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <TextField
          fullWidth
          placeholder={`Search ${tabs[activeTab]?.label}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      

{activeTab === 12 && (
  <Box sx={{ minWidth: '400px' }}>
    <Autocomplete
      fullWidth
      size="small"
      options={states}
      getOptionLabel={(option) => option.name || ''}
      value={selectedState}
      onChange={async (event, newValue) => {
        setSelectedState(newValue);
        if (newValue) {
          setLoading(true);
          try {
            const cityList = await APIService.getStateByCityList(newValue.id);
            setCities(cityList);
      if (activeTab === 12) setFilteredData(cityList);
          } catch (err) {
            setCities([]);
          }
          setLoading(false);
        } else {
          setCities([]);
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label="State" variant="outlined" />
      )}
      sx={{ pb: 3 }}
    />
  </Box>
)}
 
      <Button
      startIcon={<AddCircleOutlineIcon />}
        variant="contained"
        color="primary"
        onClick={() => setAddDialogOpen(true)}
        sx={{ mb: 3 }}
      >
        Add New {tabs[activeTab]?.label}
      </Button>
 
</Box>
      {/* Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>{renderTableHeaders()}</TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={getColumnCount()} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={getColumnCount()} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No {tabs[activeTab]?.label} found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, index) => renderTableRow(item, index))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={addDialogOpen || editDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setEditDialogOpen(false);
          setFormName("");
          setBankFormData({
            id: 0,
            name: "",
            accountNumber: "",
            bankName: "",
            ifsc: "",
            branchName: "",
            is_credit_account: false
          });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {addDialogOpen ? `Add ${tabs[activeTab]?.label}` : `Edit ${tabs[activeTab]?.label}`}
        </DialogTitle>
        <DialogContent>
          {activeTab === 5 ? (
            // Bank Details Form
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                value={bankFormData.name}
                onChange={(e) => setBankFormData({ ...bankFormData, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Account Number"
                value={bankFormData.accountNumber}
                onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Bank Name"
                value={bankFormData.bankName}
                onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="IFSC Code"
                value={bankFormData.ifsc}
                onChange={(e) => setBankFormData({ ...bankFormData, ifsc: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Branch Name"
                value={bankFormData.branchName}
                onChange={(e) => setBankFormData({ ...bankFormData, branchName: e.target.value })}
                fullWidth
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={bankFormData.is_credit_account}
                    onChange={(e) => setBankFormData({ ...bankFormData, is_credit_account: e.target.checked })}
                  />
                }
                label="Is Disbursal Account"
              />
            </Box>
          ) : (
            // Regular Form
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                fullWidth
                required
              />
              <NgIf condition={activeTab === 6}>
                <TextField
                  label="Loan amount % of bid amount"
                  type="number"
                  value={bidAmountPercentage}
                  onChange={(e) => setBidAmountPercentage(Number(e.target.value))}
                  fullWidth
                />
                    <FormControl fullWidth required>
  <InputLabel id="application-number-label">Application Number</InputLabel>
  <Select
    labelId="application-number-label"
    value={applicationNumber}
    label="Application Number"
    onChange={(e) => setApplicationNumber(Number(e.target.value))}
  >
    <MenuItem value={1}>True</MenuItem>
    <MenuItem value={0}>False</MenuItem>
  </Select>
</FormControl>
              </NgIf>
              <NgIf condition={activeTab === 9}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isPurchaseDocRequired}
                      onChange={(e) => setPurchaseDocRequired(e.target.checked)}
                    />
                  }
                  label="Is Required"
                />
              </NgIf>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddDialogOpen(false);
              setEditDialogOpen(false);
              setFormName("");
              setBankFormData({
                id: 0,
                name: "",
                accountNumber: "",
                bankName: "",
                ifsc: "",
                branchName: "",
                is_credit_account: false
              });
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={addDialogOpen ? handleAddSubmit : handleEditSubmit}
            variant="contained"
            disabled={formLoading}
            sx={{
              backgroundColor: "#1e3a8a",
              "&:hover": { backgroundColor: "#1e40af" },
            }}
          >
            {formLoading ? <CircularProgress size={20} /> : addDialogOpen ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Source Document Dialog */}
      <Dialog
        open={purchaseSourceDocumentDialogOpen}
        onClose={() => {
          setPurchaseSourceDocumentDialogOpen(false);
          setSelectedPurchaseSourceId(0);
          setDocumentName("");
          setPurchaseDocRequired(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Purchase Source Document</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Purchase Source</InputLabel>
              <Select
                value={selectedPurchaseSourceId}
                onChange={(e: SelectChangeEvent<number>) => 
                  setSelectedPurchaseSourceId(Number(e.target.value))
                }
                label="Purchase Source"
              >
                {purchaseSources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Document Name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              fullWidth
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPurchaseDocRequired}
                  onChange={(e) => setPurchaseDocRequired(e.target.checked)}
                />
              }
              label="Is Required"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPurchaseSourceDocumentDialogOpen(false);
              setSelectedPurchaseSourceId(0);
              setDocumentName("");
              setPurchaseDocRequired(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddPurchaseSourceDocument}
            variant="contained"
            disabled={formLoading}
            sx={{
              backgroundColor: "#1e3a8a",
              "&:hover": { backgroundColor: "#1e40af" },
            }}
          >
            {formLoading ? <CircularProgress size={20} /> : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedItem(null);
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {tabs[activeTab]?.label}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedItem(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default Masters;