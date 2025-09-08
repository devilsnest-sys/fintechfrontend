import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
  FormHelperText,
  Paper,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Divider,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TableContainer,
  TableHead,
  TableCell,
  TableBody,
  Tooltip,
  TableRow,
  Table,
  Switch,
  Autocomplete,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { useAuth } from "../../../context/AuthContext";
import { formatISO } from "date-fns";
import {
  AddOrUpdateDealerInterFace,
  Borrower,
  BorrowOrGurantorFormErrors,
  Cheque,
  DealerDocumentListInterface,
  DealerDocumentUpload,
  DealerMastersApiResInterface,
  DealerOnboardingBorrowerOrGuarantor,
  dealerStatusListAsMessage,
  Guarantor,
  MultipleFaclityAgreemntDocInterface,
  RejectedDealerFormInterface,
} from "../../../service/models/Dealer.model";
import MainLayout from "../../../components/layout/MainLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { AddCircleOutline, Delete, Visibility } from "@mui/icons-material";
import APIService from "../../../service/API";
import CommonService from "../../../service/CommonService";
import { Representative } from "../../../service/models/Representative.model";
import NgIf from "../../../components/NgIf";

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const formatDate = (date: string) =>
  date ? formatISO(new Date(date)).split("T")[0] : "";
const permissionTabMap: { permission: string; tabIndex: number }[] = [
  { permission: "Edit Dealership Data", tabIndex: 0 },
  { permission: "Edit KYC Upload Data", tabIndex: 1 },
  { permission: "Edit Borrower-Guarantor Data", tabIndex: 2 },
  { permission: "Edit Sanction Details Data", tabIndex: 3 },
  { permission: "Edit Cheques Details Data", tabIndex: 4 },
  { permission: "Edit Deposit Details Data", tabIndex: 5 },
];
let maxDate = new Date(),
  decodeId = '';
const tabConfigs = [
  { label: "Dealership Data", permission: "Edit Dealership Data" },
  { label: "KYC Doc", permission: "Edit KYC Upload Data" },
  { label: "Borrower & Guarantor", permission: "Edit Borrower-Guarantor Data" },
  { label: "Sanction Details", permission: "Edit Sanction Details Data" },
  { label: "Cheques Details", permission: "Edit Cheques Details Data" },
  { label: "Deposit Details", permission: "Edit Deposit Details Data" },
];
            


const relationShipOptions = [
  "Self",
  "Father",
  "Wife",
  "Mother",
  "Son",
  "Sister",
  "Daughter",
];

const beneficiaryStatusOptions = [
  "Firm",
  "Borrower",
  "Guarantor",
  "Partner",
  "Company",
  "Director",
  "Designated Partner",
];

const formSchemaROISanction = [
  {
    label: "CIBIL Of Entity",
    name: "cibilOfEntity",
    type: "number",
    section: "Financial Details",
  },
  {
    label: "Total Sanction Limit (₹)",
    name: "totalSanctionLimit",
    type: "number",
    section: "Financial Details",
  },
  {
    label: "ROI (%)",
    name: "roi",
    type: "number",
    section: "Financial Details",
  },
  {
    label: "ROI Per Lakh (₹)",
    name: "roiPerLakh",
    type: "number",
    section: "Financial Details",
  },
  {
    label: "Delay ROI (%)",
    name: "delayROI",
    type: "number",
    section: "Financial Details",
  },
  {
    label: "Processing Fee (₹)",
    name: "processingFee",
    type: "number",
    section: "Financial Details",
  },
  {
    label: "Processing Charge (₹)",
    name: "processingCharge",
    type: "number",
    section: "Financial Details",
  },
  {
    label: "GST on Processing Charge (₹)",
    name: "gstOnProcessingCharge",
    type: "number",
    section: "Financial Details",
  },
  {
    label: "Documentation Charge (₹)",
    name: "documentationCharge",
    type: "number",
    section: "Financial Details",
  },
  {
    label: "GST on Documentation Charges (₹)",
    name: "gstOnDocCharges",
    type: "number",
    section: "Financial Details",
  },
  {
    label: "Date of Facility Agreement",
    name: "dateOfFacilityAgreement",
    type: "date",
    section: "Financial Details",
  },
];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dealer-tabpanel-${index}`}
      aria-labelledby={`dealer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: AddOrUpdateDealerInterFace = {
  id: 0,
  dealerCode: "",
  loanProposalNo: "",
  dealershipName: "",
  dealershipPAN: "",
  gstNo: "",
  gstRegStatus: "",
  msmeRegistrationNo: "",
  msmeType: "",
  msmeStatus: "",
  businessCategory: "",
  businessType: "",
  entity: "",
  contactNo: "",
  alternativeContactNo: "",
  emailId: "",
  alternativeEmailId: "",
  shopAddress: "",
  parkingYardAddress: "",
  parkingYardPinCode: "",
  parkingYardState: "",
  parkingYardCity: "",
  shopCity: "",
  shopState: "",
  shopPinCode: "",
  officeStatus: "",
  agreementDate: "",
  agreementExpiryDate: "",
  parkingStatus: "",
  parkingAgreementDate: "",
  parkingAgreementExpiryDate: "",
  dateOfIncorporation: formatISO(new Date()).split("T")[0],
  dateOfOnboarding: formatISO(new Date()).split("T")[0],
  dateOfFacilityAgreement: null,
  cibilOfEntity: 0,
  totalSanctionLimit: 0,
  roi: 0,
  roiPerLakh: 0,
  delayROI: 0,
  processingFee: 0,
  processingCharge: 0,
  gstOnProcessingCharge: 0,
  documentationCharge: 0,
  gstOnDocCharges: 0,
  relationshipManagerId: 0,
  status: "",
  rejectionReason: "",
  isActive: true,
  registeredDate: new Date().toISOString(),
  userId: 0,

  borrowerDetails: [],
  guarantorDetails: [],
  chequeDetails: [],
  securityDepositDetails: [],

  securityID: 0,
  chequeID: 0,
  beneficiaryStatus: "",
  beneficiaryName: "",
  chequeNumber: "",
  accountNumber: "",
  ifscCode: "",
  dateOfChequeReceived: "",
  dateOfChequeHandover: "",
  locationOfCheque: "",
  isENach: "",
  chequeRemarks: "",
  securityDepositAttachmentUrl: "",
  securityDepositStatus: "",
  amountOfSecurityDeposit: 0,
  utrOfsecurityDeposit: "",
  dateOfSecurtyDepositReceived: "",
  dateOfSecurtyDepositRefunded: "",
  securityDesoiteremarks: "",
  PERSONAL_GUARANTEE: {
    dealerId: 0,
    documentType: "PERSONAL_GUARANTEE",
    document: null,
  },
  SANCTION_LETTER: {
    dealerId: 0,
    documentType: "SANCTION_LETTER",
    document: null,
  },
  DEALERSHIP_PAN: {
    dealerId: 0,
    documentType: "DEALERSHIP_PAN",
    document: null,
  },
  GST_CERTIFICATE: {
    dealerId: 0,
    documentType: "GST_CERTIFICATE",
    document: null,
  },
  REGISTRATION_CERTIFICATE: {
    dealerId: 0,
    documentType: "REGISTRATION_CERTIFICATE",
    document: null,
  },
  ADDRESS_PROOF: {
    dealerId: 0,
    documentType: "ADDRESS_PROOF",
    document: null,
  },
  ITR: {
    dealerId: 0,
    documentType: "ITR",
    document: null,
  },

  //Guarantor Documents
  // guarantor_PAN: {
  //   dealerId: 0,
  //   documentType: "guarantor_PAN",
  //   document: null,
  // },
  // guarantor_GST_CERTIFICATE: {
  //   dealerId: 0,
  //   documentType: "guarantor_GST_CERTIFICATE",
  //   document: null,
  // },
  // guarantor_REGISTRATION_CERTIFICATE: {
  //   dealerId: 0,
  //   documentType: "guarantor_REGISTRATION_CERTIFICATE",
  //   document: null,
  // },
  // guarantor_ADDRESS_PROOF: {
  //   dealerId: 0,
  //   documentType: "guarantor_ADDRESS_PROOF",
  //   document: null,
  // },

  // //Direct Documents
  // direct_PAN: {
  //   dealerId: 0,
  //   documentType: "direct_PAN",
  //   document: null,
  // },
  // direct_GST_CERTIFICATE: {
  //   dealerId: 0,
  //   documentType: "direct_GST_CERTIFICATE",
  //   document: null,
  // },
  // direct_REGISTRATION_CERTIFICATE: {
  //   dealerId: 0,
  //   documentType: "direct_REGISTRATION_CERTIFICATE",
  //   document: null,
  // },
  // direct_ADDRESS_PROOF: {
  //   dealerId: 0,
  //   documentType: "direct_ADDRESS_PROOF",
  //   document: null,
  // },

  // //Proprietor Documents
  // proprietor_PAN: {
  //   dealerId: 0,
  //   documentType: "proprietor_PAN",
  //   document: null,
  // },
  // proprietor_GST_CERTIFICATE: {
  //   dealerId: 0,
  //   documentType: "proprietor_GST_CERTIFICATE",
  //   document: null,
  // },
  // proprietor_REGISTRATION_CERTIFICATE: {
  //   dealerId: 0,
  //   documentType: "proprietor_REGISTRATION_CERTIFICATE",
  //   document: null,
  // },
  // proprietor_ADDRESS_PROOF: {
  //   dealerId: 0,
  //   documentType: "proprietor_ADDRESS_PROOF",
  //   document: null,
  // },

  // //Borrower Documents
  // borrower_PAN: {
  //   dealerId: 0,
  //   documentType: "borrower_PAN",
  //   document: null,
  // },
  // borrower_GST_CERTIFICATE: {
  //   dealerId: 0,
  //   documentType: "borrower_GST_CERTIFICATE",
  //   document: null,
  // },
  // borrower_REGISTRATION_CERTIFICATE: {
  //   dealerId: 0,
  //   documentType: "borrower_REGISTRATION_CERTIFICATE",
  //   document: null,
  // },
  // borrower_ADDRESS_PROOF: {
  //   dealerId: 0,
  //   documentType: "borrower_ADDRESS_PROOF",
  //   document: null,
  // },
};

const DealerOnboardingPage: React.FC = () => {
  const { encodedId } = useParams<{ encodedId: string }>();
  const mode = encodedId ? "edit" : "add";
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMsg, setErrorMessage] = useState<string>("");
  const [successMsg, setSuccessMessage] = useState<string>("");
  const [formData, setFormData] =
    useState<AddOrUpdateDealerInterFace>(initialFormData);
  //   const [guarantorBorrowerDocuments, setGuarantorBorrowerDocuments] = useState<
  //   DealerDocumentUpload[]
  // >([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [borrowOrGurantorFormErrors, setBorrowOrGurantorFormErrors] =
    useState<BorrowOrGurantorFormErrors>({});
  const [loading, setLoading] = useState<boolean>(mode === "edit");
  const [allMultipleFacilityAgreementDoc, setMultipleFacilityAgreementDoc] =
    useState<MultipleFaclityAgreemntDocInterface[]>([
      {
        FACILITY_AGREEMENT: {
          dealerId: formData.id,
          documentType: "FACILITY_AGREEMENT",
          document: null,
        },
      },
    ]);
  const [allMultipleOtherDoc, setMultipleOtherDoc] = useState<
    DealerDocumentUpload[]
  >([
    {
      dealerId: formData.id,
      documentType: "",
      document: null,
    },
  ]);
  const [borrowers, setBorrowers] = useState<Borrower[]>([
    {
      id: 0,
      dealerId: 0,
      name: "",
      pan: "",
      dateOfBirth: "",
      mobileNumber: "",
      email: "",
      fatherName: "",
      relationshipWithEntity: "",
      cibilScore: 0,
      aadharNo: "",
      personType: "",
      addressStatus: "",
      attachmentPath: "",
      addressAgreementDate: "",
      addressAgreementExpiryDate: "",
      currentAddress: "",
      borrowerCPinCode: "",
      borrowerCState: "",
      permanentAddress: "",
      borrowerPPincode: "",
      borrowerPState: "",
      borrowerCCity: "",
      borrowerPCity: "",
      borrowerCCityList: [],
      borrowerPCityList: [],
      Pan_Card: {
        dealerId: 0,
        documentType: "borrower_panCard",
        document: null,
        uploadedDocumentIndex: 0,
      },
      Registration_Certificate: {
        dealerId: 0,
        documentType: "borrower_gstCertificate",
        document: null,
        uploadedDocumentIndex: 0,
      },
      Gst_Certificate: {
        dealerId: 0,
        documentType: "borrower_REGISTRATION_CERTIFICATE",
        document: null,
        uploadedDocumentIndex: 0,
      },
      Address_Proof: {
        dealerId: 0,
        documentType: "borrower_ADDRESS_PROOF",
        document: null,
        uploadedDocumentIndex: 0,
      },
      ITR: {
        dealerId: 0,
        documentType: "borrower_ITR",
        document: null,
        uploadedDocumentIndex: 0,
      },
    },
  ]);
  const [guarantors, setGuarantors] = useState<Guarantor[]>([
    {
      id: 0,
      dealerId: 0,
      name: "",
      pan: "",
      dateOfBirth: "",
      mobileNumber: "",
      email: "",
      fatherName: "",
      cibilScore: 0,
      aadharNo: "",
      personType: "",
      addressStatus: "",
      attachmentPath: "",
      relationshipWithBorrower: "",
      addressAgreementDate: "",
      addressAgreementExpiryDate: "",
      currentAddress: "",
      guarantorCPinCode: "",
      guarantorCState: "",
      permanentAddress: "",
      guarantorPPincode: "",
      guarantorPState: "",
      guarantorCCity: "",
      guarantorPCity: "",
      guarantorCCityList: [],
      guarantorPCityList: [],
      Pan_Card: {
        dealerId: 0,
        documentType: "Pan_Card",
        document: null,
        uploadedDocumentIndex: 0,
      },
      Gst_Certificate: {
        dealerId: 0,
        documentType: "Gst_Certificate",
        document: null,
        uploadedDocumentIndex: 0,
      },
      Registration_Certificate: {
        dealerId: 0,
        documentType: "Registration_Certificate",
        document: null,
        uploadedDocumentIndex: 0,
      },
      Address_Proof: {
        dealerId: 0,
        documentType: "Address_Proof",
        document: null,
        uploadedDocumentIndex: 0,
      },
      ITR: {
        dealerId: 0,
        documentType: "ITR",
        document: null,
        uploadedDocumentIndex: 0,
      },
    },
  ]);
  const [cheques, setCheques] = useState<Cheque[]>([
    {
      id: 0,
      dealerId: formData.id || 0,
      beneficiaryStatus: "",
      beneficiaryName: "",
      chequeNumber: "",
      accountNumber: "",
      ifscCode: "",
      dateHandover: "",
      location: "",
      attachmentUrl: "",
      isENach: false,
      accountType: "",
      mandateType: "",
      maxDebitAmount: 0,
      mandateAmount: 0,
      frequency: "",
      mandateStartDate: "",
      mandateEndDate: "",
      remarks: "",
      // optional fields (if needed for form handling)
      isENachValue: "", // for temporary string value before conversion
      dateReceived: "",
      locationOfCheque: "",
      chequeRemarks: "",
      Cheque_Image: {
        dealerId: 0,
        documentType: "Cheque_Image",
        document: null,
      },
    }    
  ]);
  const [allKycDocuments, setKycDocuments] = useState<
    DealerDocumentListInterface[]
  >([]);
  const [allBorrowerOrGuarantorDocuments, setBorrowerOrGuarantorDocuments] = useState<
    DealerDocumentListInterface[]
  >([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const didRunRef = useRef(false);

  const [rejectedFormData, setRejectedFormData] =
    useState<RejectedDealerFormInterface>({
      rejectedReason: "",
    });
  const [businessCategoryOptions, setBusinessCategoryOptions] = useState<
    DealerMastersApiResInterface[]
  >([]);
  const [businessTypeOptions, setBusinessTypeOptions] = useState<
    DealerMastersApiResInterface[]
  >([]);
  const [personTypeOptions, setPersonTypeOptions] = useState<
    DealerMastersApiResInterface[]
  >([]);
  const [entityTypeOptions, setEntityTypeOptions] = useState<
    DealerMastersApiResInterface[]
  >([]);
  const [addressStatusOptions, setAddressStatusOptions] = useState<
    DealerMastersApiResInterface[]
  >([]);
  const [allStateOptions, setAllStateOptions] = useState<
    DealerMastersApiResInterface[]
  >([]);
  const [officeStateByCityOptions, setOfficeStateByCityOptions] = useState<
    DealerMastersApiResInterface[]
  >([]);
  const [parkingYardStateByCityOptions, setParkingYardStateByCityOptions] =
    useState<DealerMastersApiResInterface[]>([]);
  const [chequeLocationOptions, setChequeLocationOptions] = useState<
    DealerMastersApiResInterface[]
  >([]);
  const handleBorrowerChange = async <K extends keyof Borrower>(
    index: number,
    field: K,
    value: Borrower[K]
  ) => {
    const updated = [...borrowers];
    updated[index][field] = value;

    const fetchBorrowerCities = async (
      cityListKey: keyof Borrower,
      cityValueKey: keyof Borrower
    ) => {
      const borrowStateId = allStateOptions.find(
        (stateItem) => stateItem?.name === value
      )?.id;

      const cityList = await APIService.getStateByCityList(borrowStateId ?? 0);

      updated[index] = {
        ...updated[index],
        [cityListKey]: cityList,
        [cityValueKey]: "",
      };
    };

    if (field === "addressStatus" && value === "Owned") {
      updated[index].addressAgreementDate = "";
      updated[index].addressAgreementExpiryDate = "";
    } else if (field === "borrowerCState" && value) {
      await fetchBorrowerCities("borrowerCCityList", "borrowerCCity");
    } else if (field === "borrowerPState" && value) {
      await fetchBorrowerCities("borrowerPCityList", "borrowerPCity");
    }

    if (value && borrowOrGurantorFormErrors?.borrowers?.[index]) {
      const errorEntry = borrowOrGurantorFormErrors.borrowers[index];
      delete (errorEntry as Partial<Borrower>)[field];
    }

    setBorrowOrGurantorFormErrors({ ...borrowOrGurantorFormErrors });
    setBorrowers(updated);
  };

  const [isListloading, setIsListLoading] = useState<boolean>(true);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [filteredRepresentatives, setFilteredRepresentatives] = useState<
    Representative[]
  >([]);
  interface RelationshipManagerOption {
    id: number;
    name: string;
  }

  const [relationshipManagerOptions, setRelationshipManagerOptions] = useState<
    RelationshipManagerOption[]
  >([]);

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        setIsListLoading(true);
        const allRepresentatives = await APIService.getAllRepresentatives();
        setRepresentatives(allRepresentatives);
        setFilteredRepresentatives(allRepresentatives);

        const repOptions = allRepresentatives
          .filter((rep) => rep.isRepresentative)
          .map((rep) => ({
            id: rep.id,
            name: rep.name,
          }));
        setRelationshipManagerOptions(repOptions);

        setIsListLoading(false);
      } catch (err) {
        setIsListLoading(false);
      }
    };

    fetchRepresentatives();
  }, []);

  const handleGuarantorChange = async <K extends keyof Guarantor>(
    index: number,
    field: K,
    value: Guarantor[K]
  ) => {
    const updated = [...guarantors];
    updated[index][field] = value;

    const fetchGuarantorCities = async (
      cityListKey: keyof Guarantor,
      cityValueKey: keyof Guarantor
    ) => {
      const stateId = allStateOptions.find(
        (stateItem) => stateItem?.name === value
      )?.id;

      const cityList = await APIService.getStateByCityList(stateId ?? 0);

      updated[index] = {
        ...updated[index],
        [cityListKey]: cityList,
        [cityValueKey]: "", // Reset selected city
      };
    };

    if (field === "addressStatus" && value === "Owned") {
      updated[index].addressAgreementDate = "";
      updated[index].addressAgreementExpiryDate = "";
    } else if (field === "guarantorCState" && value) {
      await fetchGuarantorCities("guarantorCCityList", "guarantorCCity");
    } else if (field === "guarantorPState" && value) {
      await fetchGuarantorCities("guarantorPCityList", "guarantorPCity");
    }

    if (value && borrowOrGurantorFormErrors?.gurantor?.[index]) {
      const errorEntry = borrowOrGurantorFormErrors.gurantor[index];
      delete (errorEntry as Partial<Guarantor>)[field];
    }

    setBorrowOrGurantorFormErrors({ ...borrowOrGurantorFormErrors });
    setGuarantors(updated);
  };

  const handleChequeChange = <K extends keyof Cheque>(
    index: number,
    field: K,
    value: any
  ) => {
    // if(field === "Cheque_Image") {
    //   const input = 
    //   const file = input.target.files?.[0];
    //   input.target.value = "";
    //   if (!file) return;
    //   const updated = [...cheques];
    //   updated[index][field]["Cheque_Image"]["document"] = file;
    //   setCheques(updated);
    // }else {
    const updated = [...cheques];
    updated[index][field] = value;
    setCheques(updated);
    // }
  };
  
  const removeBorrower = (index: number) => {
    setBorrowers((prev) => prev.filter((_, i) => i !== index));
  };



  const removeGuarantor = (index: number) => {
    setGuarantors((prev) => prev.filter((_, i) => i !== index));
  };

  const removeCheque = (index: number) => {
    setCheques((prev) => prev.filter((_, i) => i !== index));
  };

  const getTitle = (entity: any) => {
    switch (entity) {
      case "Proprietorship":
        return "Borrower & Guarantor Information";
      case "Partnership":
        return "Partners Information";
      case "Private Limited":
      case "Limited":
        return "Company & Directors Information";
      case "LLP":
        return "LLP & Designated Partners Information";
      case "HUF":
        return "HUF & Members Information";
      default:
        return "Borrower & Guarantor Information";
    }
  };
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ): void => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const newDocument: DealerDocumentUpload = {
      dealerId: formData.id,
      documentType,
      document: file,
    };
    setFormData({
      ...formData,
      [documentType]: newDocument,
    });
  };

  const handleFacilityDocUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    facilityDocIndex: number,
    documenType: string
  ): void => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const updatedDocs = [...allMultipleFacilityAgreementDoc];
    updatedDocs[facilityDocIndex]["FACILITY_AGREEMENT"] = {
      dealerId: formData.id,
      documentType: documenType,
      document: file,
    };

    setMultipleFacilityAgreementDoc(updatedDocs);
  };
  const handleBorrowerOrGurantorDocUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number,
    documenType: "Pan_Card" | "Registration_Certificate" | "Address_Proof" | "Gst_Certificate" | "ITR",
    type:string
  ): void => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if(type==='gurantor'){
    const updatedDocs = [...guarantors];
   updatedDocs[rowIndex][documenType] = {
  dealerId: formData.id,
  documentType: documenType+"_G"+rowIndex+1, // typo? should be `documentType`
  document: file,
};



    setGuarantors(updatedDocs);
  }
  
  else if(type==='borrower'){
    const updatedDocs = [...borrowers];
   updatedDocs[rowIndex][documenType] = {
  dealerId: formData.id,
  documentType: documenType+"_B"+rowIndex+1, // typo? should be `documentType`
  document: file,
};



    setBorrowers(updatedDocs);
  }

  };
  const handleRemoveFacilityDoc = (facilityDocIndex: number) => {
    const updatedDocs = allMultipleFacilityAgreementDoc.filter(
      (_, index) => index !== facilityDocIndex
    );
    setMultipleFacilityAgreementDoc(updatedDocs);
  };

  const handleOtherDocUpload = (
    fieldType: "documentFile" | "documentType",
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    otherDocIndex: number
  ): void => {
    const updatedDocs = [...allMultipleOtherDoc];
    if (!updatedDocs[otherDocIndex]) return;
    updatedDocs[otherDocIndex].dealerId = formData.id;
    if (fieldType === "documentFile") {
      const input = event as React.ChangeEvent<HTMLInputElement>;
      const file = input.target.files?.[0];
      input.target.value = "";
      if (!file) return;

      updatedDocs[otherDocIndex].document = file;
    } else if (fieldType === "documentType") {
      const input = event as React.ChangeEvent<HTMLSelectElement>;
      updatedDocs[otherDocIndex].documentType = input.target.value;
    }
    setMultipleOtherDoc(updatedDocs);
  };
  const handleRemoveOtherDoc = (otherDocIndex: number) => {
    const updatedDocs = allMultipleOtherDoc.filter(
      (_, index) => index !== otherDocIndex
    );
    setMultipleOtherDoc(updatedDocs);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
  };

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const fetchDealerData = async () => {
      let formStateFromDealer = initialFormData;

      for (const { permission, tabIndex } of permissionTabMap) {
        if (CommonService.checkPermission([permission])) {
          setActiveTab(tabIndex);
          break;
        }
      }

      if (mode === "edit" && encodedId) {
        decodeId = atob(encodedId)
        try {
          setLoading(true);

          const dealerData = await APIService.getDealerById(parseInt(decodeId));
          if (dealerData.status === "Active") {
            navigate("/dealer-listing");
            return;
          }

          const cheque = dealerData.chequeDetails?.[0] || {};
          const security = dealerData.securityDepositDetails?.[0] || {};

          const updatedFormData: typeof initialFormData = {
            ...initialFormData,
            ...dealerData,
            chequeID: cheque.id ?? 0,
            chequeNumber: cheque.chequeNumber ?? "",
            beneficiaryName: cheque.beneficiaryName ?? "",
            beneficiaryStatus: cheque.beneficiaryStatus ?? "",
            accountNumber: cheque.accountNumber ?? "",
            ifscCode: cheque.ifscCode ?? "",
            dateOfChequeReceived: cheque.dateReceived ?? "", 
            locationOfCheque: cheque.location ?? "",
            isENach: cheque.isENach ? "Yes" : "No",
            chequeRemarks: cheque.remarks ?? "",

            securityID: security.id ?? 0,
            securityDepositStatus: security.status ?? "",
            amountOfSecurityDeposit: Number(security?.amount) ?? 0,
            utrOfsecurityDeposit: security.utrNumber ?? "",
            dateOfSecurtyDepositReceived: security.dateReceived ?? "",
            dateOfSecurtyDepositRefunded: security.dateRefunded ?? "",
            securityDepositAttachmentUrl: security.attachmentUrl ?? "",
            securityDesoiteremarks: security.remarks ?? "",
            cibilOfEntity: Number(security.cibilOfEntity ?? ""),
            roi: Number(security.roi ?? 0),
            roiPerLakh: Number(security.roiPerLakh ?? 0),
            delayROI: Number(security.delayROI ?? 0),
            processingFee: Number(security.processingFee ?? 0),
            processingCharge: Number(security.processingCharge ?? 0),
            gstOnProcessingCharge: Number(security.gstOnProcessingCharge ?? 0),
            documentationCharge: Number(security.documentationCharge ?? 0),
            gstOnDocCharges: Number(security.gstOnDocCharges ?? 0),
            totalSanctionLimit: Number(security.totalSanctionLimit ?? 0),
            relationshipManagerId: dealerData.relationshipManagerId ?? 0,
            status: dealerData.status ?? "",
            isActive: dealerData.isActive ?? false,
            registeredDate: dealerData.registeredDate ?? null,

            agreementDate: dealerData.agreementDate
              ? formatDate(dealerData.agreementDate)
              : null,
            agreementExpiryDate: dealerData.agreementExpiryDate
              ? formatDate(dealerData.agreementExpiryDate)
              : null,
            parkingAgreementDate: dealerData.parkingAgreementDate
              ? formatDate(dealerData.parkingAgreementDate)
              : null,
            parkingAgreementExpiryDate: dealerData.parkingAgreementExpiryDate
              ? formatDate(dealerData.parkingAgreementExpiryDate)
              : null,
            dateOfFacilityAgreement: security?.agreementDate
              ? formatDate(security?.agreementDate)
              : null,
            dateOfIncorporation: dealerData.dateOfIncorporation
              ? formatDate(dealerData.dateOfIncorporation)
              : null,
          };

          formStateFromDealer = updatedFormData;
          setFormData(updatedFormData);
          setCheques(dealerData.chequeDetails);

          if (Array.isArray(dealerData.borrowerDetails)) {
            setBorrowers(dealerData.borrowerDetails);
          }

          if (Array.isArray(dealerData.guarantorDetails)) {
            setGuarantors(dealerData.guarantorDetails);
          }

          if (Array.isArray(dealerData.documentUploads)) {
            setKycDocuments(dealerData.documentUploads);
          }





          setLoading(false);
        } catch (error) {
          setErrorMessage("Failed to load dealer details. Please try again.");
          setLoading(false);
          return;
        }
      } else {
        const loanAndDealerCode =
          await APIService.getLoanProposalAndDealerCode();
        formStateFromDealer = {
          ...initialFormData,
          dealerCode: loanAndDealerCode.dealerCode,
          loanProposalNo: loanAndDealerCode.loanProposalNo,
          dealershipName: "",
          dateOfOnboarding: formatISO(new Date()).split("T")[0],
          userId: currentUser?.id ?? 0,
        };
        setFormData(formStateFromDealer);
      }

      const [
        entityTypes,
        businessCategories,
        businessTypes,
        personTypes,
        addressStatuses,
        stateList,
        chequeLocationsList,
      ] = await Promise.all([
        APIService.getDealerEntityTypeList(),
        APIService.getDealerBusinessCategoryList(),
        APIService.getDealerBusinessTypeList(),
        APIService.getDealerPersonTypeList(),
        APIService.getDealerAddressStatusList(),
        APIService.getAllStateList(),
        APIService.getDealerLocationsOfCheque(),
      ]);

      setEntityTypeOptions(entityTypes);
      setBusinessCategoryOptions(businessCategories);
      setBusinessTypeOptions(businessTypes);
      setPersonTypeOptions(personTypes);
      setAddressStatusOptions(addressStatuses);
      setAllStateOptions(stateList);
      setChequeLocationOptions(chequeLocationsList);

      if (formStateFromDealer?.state) {
        const officeStateId = stateList.find(
          (stateItem) => stateItem?.name === formStateFromDealer.state
        )?.id;
        const officeCities = await APIService.getStateByCityList(
          officeStateId ?? 0
        );
        setOfficeStateByCityOptions(officeCities);
      }

      if (formStateFromDealer?.parkingYardState) {
        const parkingStateId = stateList.find(
          (stateItem) =>
            stateItem?.name === formStateFromDealer.parkingYardState
        )?.id;
        const parkingCities = await APIService.getStateByCityList(
          parkingStateId ?? 0
        );
        setParkingYardStateByCityOptions(parkingCities);
      }
    };

    fetchDealerData();
  }, [encodedId, mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });

      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: "",
        });
      }
    }
  };

  const onFieldBlur = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      if (name == "processingCharge")
        formData.gstOnProcessingCharge = Math.round(
          (formData.processingCharge ?? 0) * 0.18
        );
      if (name == "documentationCharge")
        formData.gstOnDocCharges = Math.round(
          (formData.documentationCharge ?? 0) * 0.18
        );
      setFormData({
        ...formData,
      });
    }
  };

  const handleSelectChange = async (e: SelectChangeEvent<string | boolean>) => {
    const { name, value } = e.target;

    if (name == "gstRegStatus" && value == "No") formData.gstNo = "";
    else if (name == "msmeStatus" && value == "No") {
      formData.msmeRegistrationNo = "";
      formData.msmeType = "";
    } else if (name == "officeStatus" && value == "Owned") {
      formData.agreementDate = null;
      formData.agreementExpiryDate = null;
    } else if (name == "parkingStatus" && value == "Owned") {
      formData.parkingAgreementDate = null;
      formData.parkingAgreementExpiryDate = null;
    } else if (name == "state") {
      formData.city = "";
      fetchOfficeCitiesList(value.toString());
    } else if (name == "parkingYardState") {
      formData.parkingYardCity = "";
      fetchParkingCitiesList(value.toString());
    }

    setFormData({
      ...formData,
      [name as string]: value,
    });

    if (name && formErrors[name as string]) {
      setFormErrors({
        ...formErrors,
        [name as string]: "",
      });
    }
  };
  const fetchOfficeCitiesList = async (name: string) => {
    const officeStateId = allStateOptions.find(
      (stateItem) => stateItem?.name == name
    )?.id;
    const cityList = await APIService.getStateByCityList(officeStateId ?? 0);
    setOfficeStateByCityOptions(cityList);
  };

  const fetchParkingCitiesList = async (name: string) => {
    const parkingYardStateId = allStateOptions.find(
      (stateItem) => stateItem?.name == name
    )?.id;
    const cityList = await APIService.getStateByCityList(
      parkingYardStateId ?? 0
    );
    setParkingYardStateByCityOptions(cityList);
  };
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value === "" ? 0 : parseFloat(value),
      });

      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: "",
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const borrowerErrorsArray: BorrowOrGurantorFormErrors["borrowers"] = [];
    const gurantorErrorsArray: BorrowOrGurantorFormErrors["gurantor"] = [];

    if (activeTab === 0) {
      if (!formData.dealershipName?.trim())
        errors.dealershipName = "Dealership name is required";

      if (!formData.dealerCode?.trim())
        errors.dealerCode = "Dealer code is required";

      if (!formData.dealershipPAN?.trim())
        errors.dealershipPAN = "PAN is required";
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.dealershipPAN))
        errors.dealershipPAN = "Invalid PAN format";

      if(!formData.relationshipManagerId)
        errors.relationshipManagerId = "Relationship Manager is required";

      if (!formData.entity) errors.entity = "Entity is required";

      if (!formData.gstRegStatus)
        errors.gstRegStatus = "GST Registration Status is required";

      if (!formData.msmeStatus) errors.msmeStatus = "MSME Status is required";

      if (!formData.contactNo?.trim())
        errors.contactNo = "Contact number is required";
      else if (!/^\d{10}$/.test(formData.contactNo))
        errors.contactNo = "Invalid Contact number";

      if (!formData.emailId?.trim()) errors.emailId = "Email ID is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId))
        errors.emailId = "Invalid email format";

      if (
        formData.alternativeContactNo?.trim() &&
        !/^\d{10}$/.test(formData.alternativeContactNo)
      )
        errors.alternativeContactNo = "Invalid Contact number";

      if (
        formData.alternativeEmailId?.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.alternativeEmailId)
      )
        errors.alternativeEmailId = "Invalid email format";

      if (formData.gstRegStatus == "Yes" && !formData.gstNo.trim())
        errors.gstNo = "GST No is required";

      if (
        formData.gstRegStatus == "Yes" &&
        formData.gstNo &&
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
          formData.gstNo
        )
      )
        errors.gstNo = "Invalid GST format";

      if (formData.msmeStatus == "Yes" && !formData.msmeRegistrationNo?.trim())
        errors.msmeRegistrationNo = "MSME Registration No is required";

      if (formData.msmeStatus == "Yes" && !formData.msmeType)
        errors.msmeType = "MSME Type is required";

      if (formData.officeStatus == "Rented" && !formData.agreementDate)
        errors.agreementDate = "Office Agreement Date is required";

      if (formData.officeStatus == "Rented" && !formData.agreementExpiryDate)
        errors.agreementExpiryDate = "Office Agreement Expiry Date is required";

      if (formData.parkingStatus == "Rented" && !formData.parkingAgreementDate)
        errors.parkingAgreementDate = "Parking Agreement Date is required";

      if (
        formData.parkingStatus == "Rented" &&
        !formData.parkingAgreementExpiryDate
      )
        errors.parkingAgreementExpiryDate =
          "Parking Agreement Expiry Agreement is required";
    } else if (activeTab === 2) {
      borrowers.forEach((borrower, index) => {
        const borrowerErrors: any = {};
        if (!borrower.personType?.trim())
          borrowerErrors.personType = "Person Type is required";
        if (borrower.addressStatus == "Rented") {
          if (!borrower.addressAgreementDate?.trim())
            borrowerErrors.addressAgreementDate =
              "Address Agreement Date is required";
          if (!borrower.addressAgreementExpiryDate?.trim())
            borrowerErrors.addressAgreementExpiryDate =
              "Address Agreement Expiry Date is required";
        }

        if (borrower.aadharNo.trim() && borrower.aadharNo?.length < 12)
          borrowerErrors.aadharNo = "Invalid Adhar No";
        else if (
          borrower.mobileNumber.trim() &&
          !/^\d{10}$/.test(borrower.mobileNumber)
        )
          borrowerErrors.mobileNumber = "Invalid Mobile number";
        if (Object.keys(borrowerErrors).length > 0)
          borrowerErrorsArray[index] = borrowerErrors;
      });

      if (formData.entity === "Proprietorship") {
        guarantors.forEach((gurantor, index) => {
          const gurantorErrors: any = {};
          if (!gurantor.personType?.trim())
            gurantorErrors.personType = "Person Type is required";
          if (gurantor.addressStatus == "Rented") {
            if (!gurantor.addressAgreementDate?.trim())
              gurantorErrors.addressAgreementDate =
                "Address Agreement Date is required";
            if (!gurantor.addressAgreementExpiryDate?.trim())
              gurantorErrors.addressAgreementExpiryDate =
                "Address Agreement Expiry Date is required";
          }
          if (gurantor.aadharNo.trim() && gurantor.aadharNo?.length < 12)
            gurantorErrors.aadharNo = "Invalid Adhar No";
          if (
            gurantor.mobileNumber.trim() &&
            !/^\d{10}$/.test(gurantor.mobileNumber)
          )
            gurantorErrors.mobileNumber = "Invalid Mobile number";
          if (!gurantor.guarantorPState)
            gurantorErrors.guarantorPState = "State is required";
          if (Object.keys(gurantorErrors).length > 0)
            gurantorErrorsArray[index] = gurantorErrors;
        });
      }
    }
    
    // else if (activeTab === 4) {
    //   if (!formData.beneficiaryName?.trim())
    //     errors.beneficiaryName = "Beneficiary name is required";

    //   if (!formData.chequeNumber?.trim())
    //     errors.chequeNumber = "Cheque number is required";
    //   else if (!/^\d{6}$/.test(formData.chequeNumber))
    //     errors.chequeNumber = "Cheque number must be 6 digits";

    //   if (!formData.accountNumber)
    //     errors.accountNumber = "Account number is required";

    //   if (!formData.ifscCode?.trim()) errors.ifscCode = "IFSC code is required";
    //   else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode))
    //     errors.ifscCode = "Invalid IFSC code format";

    //   if (!formData.locationOfCheque?.trim())
    //     errors.locationOfCheque = "Location is required";

    //   if (!formData.dateOfChequeReceived)
    //     errors.dateOfChequeReceived = "Date of cheque received is required";

    //   if (!formData.dateOfChequeHandover)
    //     errors.dateOfChequeHandover = "Date of cheque handover is required";

    //   if (!formData.isENach) errors.isENach = "E-Nach is required";
    // }

    if (activeTab == 2) {
      setBorrowOrGurantorFormErrors({
        borrowers: borrowerErrorsArray,
        gurantor: gurantorErrorsArray,
      });
      if (
        formData.entity === "Proprietorship" &&
        borrowerErrorsArray?.length > 0
      )
        return Object.keys(borrowerErrorsArray).length == 0;
      if (
        formData.entity === "Proprietorship" &&
        gurantorErrorsArray?.length > 0
      )
        return Object.keys(gurantorErrorsArray).length == 0;
      else return Object.keys(borrowerErrorsArray).length == 0;
    } else {
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    }
  };

  const handleSaveTabData = async () => {
   //Save data
    if (!validateForm()) {
      setErrorMessage("Please check error messages marked in red ..!");
      return;
    }
    if (activeTab == 1) {
      const invalidDocType: string[] = [];
      allMultipleOtherDoc.forEach((otherDocItem) => {
        if (!otherDocItem.documentType?.trim() && otherDocItem.document)
          invalidDocType.push("invalid documentType");
      });
      if (invalidDocType.length > 0) {
        setErrorMessage("Please enter Other document Type ..!");
        return false;
      }
    }
    setIsSubmitting(true);
    const endpoints: Record<number, string> = {
      0: "api/Dealers",
      1: "api/DocumentUpload/upload-multiple-objects",
      2: "api/DealerDetails/borrower-guarantor",
      3: "api/DealerDetails/security-deposit",
      4: "api/DealerDetails/cheque",
      5: "api/DealerDetails/security-deposit",
    }; 
    const dealerId = formData.id ?? 0;
    formData.dateOfFacilityAgreement = formData.dateOfFacilityAgreement ?? null;
    formData.dateOfIncorporation = formData.dateOfIncorporation ?? null;

    formData.chequeDetails = formData.chequeDetails?.length
      ? formData.chequeDetails
      : [{} as any];
    formData.securityDepositDetails = formData.securityDepositDetails?.length
      ? formData.securityDepositDetails
      : [{} as any];

    formData.borrowerDetails = borrowers.map((b) =>
      mapBorrowerToModel(b, dealerId)
    );

    if (formData.entity === "Proprietorship")
      formData.guarantorDetails = guarantors.map((b) =>
        mapBorrowerToModel(b, dealerId)
      );
    else formData.guarantorDetails = [];

    formData.chequeDetails =
    cheques.map((chequeItem)=>{
      return {
      ...chequeItem,
      id: mode === "edit" ? chequeItem?.id : 0,
      dealerId: dealerId,
      accountNumber: String(chequeItem.accountNumber) ?? "",
      ifscCode: chequeItem.ifscCode ?? "",
      chequeNumber: chequeItem.chequeNumber ?? "",
      dateReceived: chequeItem.dateReceived?chequeItem.dateReceived: null, 
      mandateStartDate:chequeItem.mandateStartDate?chequeItem.mandateStartDate: null,
      mandateEndDate:chequeItem.mandateEndDate?chequeItem.mandateEndDate: null,
      isENach:chequeItem.isENachValue == "Yes" ? true : false,
      chequeRemarks: chequeItem?.remarks ?? "",
      location: chequeItem?.location ?? "",
      beneficiaryName: chequeItem?.beneficiaryName ?? "",
      beneficiaryStatus: chequeItem?.beneficiaryStatus ?? "",
      attachmentUrl: chequeItem?.attachmentUrl ?? "",
      isENachValue:chequeItem.isENachValue
    }
    })
    
    formData.securityDepositDetails[0] = {
      ...formData.securityDepositDetails[0],
      id: formData.securityID ? formData.securityID : 0,
      dealerId: dealerId,
      status: formData.securityDepositStatus ?? "",
      amount: !isNaN(formData?.amountOfSecurityDeposit ?? 0)
        ? formData?.amountOfSecurityDeposit
        : 0,
      utrNumber: formData.utrOfsecurityDeposit ?? "",
      dateReceived: formData.dateOfSecurtyDepositReceived || null,
      dateRefunded: formData.dateOfSecurtyDepositRefunded || null,
      agreementDate: formData?.dateOfFacilityAgreement || null,
      cibilOfEntity: String(formData.cibilOfEntity) ?? "",
      totalSanctionLimit: Number(formData.totalSanctionLimit) ?? 0,
      roi: formData.roi ?? 0,
      roiPerLakh: formData.roiPerLakh ?? 0,
      delayROI: formData.delayROI ?? 0,
      processingFee: formData.processingFee ?? 0,
      processingCharge: formData.processingCharge ?? 0,
      gstOnProcessingCharge: formData.gstOnProcessingCharge ?? 0,
      documentationCharge: formData.documentationCharge ?? 0,
      gstOnDocCharges: formData.gstOnDocCharges ?? 0,
      rejectionReason: formData.rejectionReason ?? "",
      isActive: formData.isActive ?? false,
      registeredDate: formData.registeredDate ?? null,
      attachmentUrl: formData.securityDepositAttachmentUrl ?? "",
      remarks: formData.securityDesoiteremarks ?? "",
    };

    try {
      const apiEndPoint = endpoints[activeTab];
     
      const uploadDocuments = async (documents: DealerDocumentUpload[]) => {
        const filteredDocs = documents.filter((doc) => doc?.document);
       
        if (filteredDocs.length > 0&&activeTab!=2) {
          return await APIService.uploadMultiPleDocDealerOnBoarding(
            "api/DocumentUpload/upload-multiple-objects",
            filteredDocs
          );
        }
        if (filteredDocs.length > 0&&activeTab==2) {
          return await APIService.uploadMultiPleDocDealerOnBoarding(
            "api/DocumentUpload/upload-multiple-objects",
            filteredDocs
          );
        }
        const docsToUpload = [
          formData.guarantor_PAN,
          formData.guarantor_GST_CERTIFICATE,
          formData.guarantor_REGISTRATION_CERTIFICATE,
          formData.guarantor_ADDRESS_PROOF,
          
          ...(allMultipleOtherDoc || []).map((doc) => doc),
        ].filter(Boolean);
        const uploadedDocuments = await uploadDocuments(docsToUpload);
        console.log(uploadedDocuments,"uploadedDocuments");
        setGuarantorDocuments(uploadedDocuments);
        console.log(allGuarantorDocuments,"guarantorDocuments");
        await APIService.updateDealerStatusOnly({
          dealerId: formData?.id,
          newStatus: 1,
        });
        return [];
      };

      const handleStep = async () => {
        switch (activeTab) {
          case 0: {
            
              console.log('🚀 Final payload', JSON.stringify(initialFormData, null, 2));
            if (!formData.id) {
              const responseData = await APIService.createDealerOnBoarding(
                formData,
                apiEndPoint
              );
              if (responseData?.id) formData.id = responseData.id;
            } else
              await APIService.createDealerOnBoarding(
                formData,
                "api/DealerDetails/update"
              );
            handleNextTabBasisOnPermission();
            break;
          }
          case 2: { 
            const DOCUMENT_KEYS = [
              "Pan_Card",
              "Gst_Certificate",
              "Registration_Certificate",
              "Address_Proof",
            ] as const;
          
            type DocumentKey = typeof DOCUMENT_KEYS[number];
          
            const collectDocsToUpload = (
              parties: any[],
              keys: DocumentKey[]
            ): DealerDocumentUpload[] => {
              const docs: DealerDocumentUpload[] = [];
          console.log(parties,"parties");
              parties.forEach((party, index) => {
                keys.forEach((key) => {
                  const doc = party?.[key]?.document;
                  if (doc) {
                    party[key].uploadedDocumentIndex = index;
                    docs.push(party[key]);
                  }
                });
              });
              // setGuarantorBorrowerDocuments(docs);
          console.log(docs,"docs");
              return docs;
            };
          
            // 👇 Collect both guarantor and borrower docs
            const allDocsToUpload = [
              ...collectDocsToUpload(guarantors, DOCUMENT_KEYS),
              ...collectDocsToUpload(borrowers, DOCUMENT_KEYS),
            ];
          
            // ✅ One upload API call
            const uploadedDocuments = await uploadDocuments(allDocsToUpload);
            setBorrowerOrGuarantorDocuments(uploadedDocuments);
            // 📌 Separate uploaded documents into borrower and guarantor lists again
            // const uploadedGuarantorDocs = uploadedDocuments.filter(
            //   (doc) => doc.uploadedDocumentIndex < guarantors.length
            // );
          
            // const uploadedBorrowerDocs = uploadedDocuments.filter(
            //   (doc) => doc.uploadedDocumentIndex >= guarantors.length
            // );
          
            // setGuarantorDocuments(uploadedGuarantorDocs);
            // setBorrowerDocuments(uploadedBorrowerDocs);
          
            // 👉 Onboard dealer after upload
            await APIService.createDealerOnBoarding(formData, apiEndPoint);
          
            break;
          }
          
          case 4:{
            console.log(formData,"formData---sonali",apiEndPoint)
             await APIService.createDealerOnBoarding(formData, apiEndPoint);
          }
          case 5: {
            await APIService.createDealerOnBoarding(formData, apiEndPoint);
            break;
          }
          case 1: {
            const docsToUpload = [
              formData.DEALERSHIP_PAN,
              formData.GST_CERTIFICATE,
              formData.REGISTRATION_CERTIFICATE,
              formData.ADDRESS_PROOF,
              ...(allMultipleOtherDoc || []).map((doc) => doc),
            ].filter(Boolean);
            const uploadedDocuments = await uploadDocuments(docsToUpload);
            setKycDocuments(uploadedDocuments);
            break;
          }
          case 3: {
            const securityDepositData = await APIService.createDealerOnBoarding(
              formData,
              apiEndPoint
            );
            formData.securityID = securityDepositData?.id ?? 0;

            const docsToUpload = [
              formData?.PERSONAL_GUARANTEE,
              formData?.SANCTION_LETTER,
              ...(allMultipleFacilityAgreementDoc || []).map(
                (doc) => doc.FACILITY_AGREEMENT
              ),
            ].filter(Boolean);
            console.log(docsToUpload,"docsToUpload")
            if(docsToUpload[0].document !=null || docsToUpload[1].document !=null || docsToUpload[2].document !=null){
           console.log("yaaaaay")
           
              await uploadDocuments(docsToUpload);
            }
            break;
          }
        }
      };

      await handleStep();
      setFormData({ ...formData });

      if (activeTab < 5) {
        setSuccessMessage("Saved successfully");
      } else {
        navigate("/dealer-listing");
      }
    } catch (error: any) {
      console.log(error,"error---sonali")
      setErrorMessage(
        error?.response?.data?.message ??
        `Failed to ${mode === "add" ? "onboard" : "update"
        } dealer. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndChangeStatus = async () => {
    //Submit Data and change status
    if (!validateForm()) {
      setErrorMessage("Please check error messages marked in red ..!");
      return;
    }
    if (activeTab == 1) {
      const invalidDocType: string[] = [];
      allMultipleOtherDoc.forEach((otherDocItem) => {
        if (!otherDocItem.documentType?.trim() && otherDocItem.document)
          invalidDocType.push("invalid documentType");
      });
      if (invalidDocType.length > 0) {
        setErrorMessage("Please enter Other document Type ..!");
        return false;
      }
    }
    setIsSubmitting(true);
    const endpoints: Record<number, string> = {
      1: "api/DocumentUpload/upload-multiple-objects",
      2: "api/DealerDetails/borrower-guarantor",
    };

    const dealerId = formData.id ?? 0;

    formData.borrowerDetails = borrowers.map((b) =>
      mapBorrowerToModel(b, dealerId)
    );
    if (formData.entity === "Proprietorship")
      formData.guarantorDetails = guarantors.map((b) =>
        mapBorrowerToModel(b, dealerId)
      );
    else formData.guarantorDetails = [];

    try {
      const apiEndPoint = endpoints[activeTab];

      const uploadDocuments = async (documents: DealerDocumentUpload[]) => {
        const filteredDocs = documents.filter((doc) => doc?.document);
        if (filteredDocs.length > 0) {
          return await APIService.uploadMultiPleDocDealerOnBoarding(
            "api/DocumentUpload/upload-multiple-objects",
            filteredDocs
          );
        }

        return [];
      };

      const handleStep = async () => {
        switch (activeTab) {
          case 2: {
            
        
            await APIService.createDealerOnBoarding(formData, apiEndPoint);
            await APIService.updateDealerStatusOnly({
              dealerId: formData?.id,
              newStatus: 8,
            });
            setActiveTab(activeTab + 1);
            break;
          }
          case 1: {
            const docsToUpload = [
              formData.DEALERSHIP_PAN,
              formData.GST_CERTIFICATE,
              formData.REGISTRATION_CERTIFICATE,
              formData.ADDRESS_PROOF,
              ...(allMultipleOtherDoc || []).map((doc) => doc),
            ].filter(Boolean);
            const uploadedDocuments = await uploadDocuments(docsToUpload);
            setKycDocuments(uploadedDocuments);
            await APIService.updateDealerStatusOnly({
              dealerId: formData?.id,
              newStatus: 1,
            });
            break;
          }
         
        }
      };

      await handleStep();
      setFormData({ ...formData });

      if (activeTab < 5) {
        setSuccessMessage("Saved successfully");
      } else {
        navigate("/dealer-listing");
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ??
        `Failed to ${mode === "add" ? "onboard" : "update"
        } dealer. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const maxDOB = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );

console.log(formData.chequeDetails,"formData.chequeDetails")
  const checkChequeDetailsValid = (): boolean => {
    const errors: string[] = [];

    // formData.chequeDetails.length>0 && formData.chequeDetails.map(({
    //   beneficiaryName,
    //   chequeNumber,
    //   accountNumber,
    //   ifscCode,
    //   location,
    //   dateReceived,
    //   isENach,
      
    // }) => {

    
      if (!formData.chequeDetails[0]?.beneficiaryName?.trim()) {
        errors.push("Beneficiary name is required");
      }
  
      if (!formData.chequeDetails[0]?.chequeNumber?.trim()) {
        errors.push("Cheque number is required");
      } else if (!/^\d{6}$/.test(formData.chequeDetails[0].chequeNumber)) {
        errors.push("Cheque number must be 6 digits");
      }
  
      if (!formData.chequeDetails[0]?.accountNumber) {
        errors.push("Account number is required");
      }
  
      if (!formData.chequeDetails[0]?.ifscCode?.trim()) {
        errors.push("IFSC code is required");
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.chequeDetails[0].ifscCode)) {
        errors.push("Invalid IFSC code format");
      }
  
      if (!formData.chequeDetails[0]?.location?.trim()) {
        errors.push("Location is required");
      }
  
      if (!formData.chequeDetails[0]?.dateReceived) {
        errors.push("Date of cheque received is required");
      }
  
      // if (!dateHandover) {
      //   errors.push("Date of cheque handover is required");
      // }
  
      if (formData.chequeDetails[0]?.isENach === undefined || formData.chequeDetails[0]?.isENach === null || formData.chequeDetails[0]?.isENach === "") {
        errors.push("E-Nach is required");
      }
  
      // return errors.length === 0;
    
    
    const {
 
      relationshipManagerId
    } = formData;

    // if (!beneficiaryName?.trim()) {
    //   errors.push("Beneficiary name is required");
    // }

    // if (!chequeNumber?.trim()) {
    //   errors.push("Cheque number is required");
    // } else if (!/^\d{6}$/.test(chequeNumber)) {
    //   errors.push("Cheque number must be 6 digits");
    // }

    // if (!accountNumber) {
    //   errors.push("Account number is required");
    // }

    // if (!ifscCode?.trim()) {
    //   errors.push("IFSC code is required");
    // } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
    //   errors.push("Invalid IFSC code format");
    // }

    // if (!locationOfCheque?.trim()) {
    //   errors.push("Location is required");
    // }

    if(!relationshipManagerId){
      errors.push("Relationship Manager is Required")
    }

    // if (!dateReceived) {
    //   errors.push("Date of cheque received is required");
    // }

    // if (!dateHandover) {
    //   errors.push("Date of cheque handover is required");
    // }

    // if (isENach === undefined || isENach === null || isENach === "") {
    //   errors.push("E-Nach is required");
    // }

    return errors.length === 0;
  };

  const handleRejectDialog = async () => {
    if (!rejectedFormData.rejectedReason.trim()) {
      setErrorMessage("Please enter remarks");
      return;
    }
    try {
      await APIService.updateDealerStatusOnly({
        dealerId: formData?.id,
        newStatus: 6,
        rejectionReason: rejectedFormData?.rejectedReason ?? "",
      });
      setIsRejectModalOpen(false);
      navigate("/dealer-listing");
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
        `Failed to reject dealer. Please try again.`
      );
    }
  };

  const handleConfirmDialog = async () => {
    try {
      const statusMap: Record<number, number> = {
        0: 1,
        1: 1,
        2: 8,
        3: 3,
      };
      let newStatus = 0;
      if (activeTab == 5) {
        newStatus = isActive ? 4 : 5;
      } else newStatus = statusMap[activeTab];

      if (newStatus !== undefined) {
        await APIService.updateDealerStatusOnly({
          dealerId: formData?.id,
          newStatus,
        });
      }

      setIsConfirmModalOpen(false);
      navigate("/dealer-listing");
    } catch (error) {
      setErrorMessage(`Failed to change dealer status. Please try again.`);
    }
  };

  const handleNextTabBasisOnPermission = () => {
    for (const { permission, tabIndex } of permissionTabMap) {
      if (tabIndex > activeTab && CommonService.checkPermission([permission])) {
        setActiveTab(tabIndex);
        break;
      }
    }
  };

  const mapBorrowerToModel = (
    borrower: any,
    dealerId: number
  ): DealerOnboardingBorrowerOrGuarantor => ({
    ...borrower,
    dateOfBirth: borrower.dateOfBirth ? borrower.dateOfBirth : null,
    addressAgreementDate: borrower.addressAgreementDate
      ? borrower.addressAgreementDate
      : null,
    addressAgreementExpiryDate: borrower.addressAgreementExpiryDate
      ? borrower.addressAgreementExpiryDate
      : null,
    id: borrower.id ?? 0,
    dealerId,
    attachmentPath: "",
    borrowerCCityList: [],
    borrowerPCityList: [],
    guarantorCCityList: [],
    guarantorPCityList: [],
  });
  const handleRejectFormInputChange = (
    field: keyof RejectedDealerFormInterface,
    value: string
  ) => {
    setRejectedFormData((prev) => ({ ...prev, [field]: value }));
  };
  const pageTitle = mode === "add" ? "Add Dealer" : "Edit Dealer";
  const getStatusColor = (status: string) => {
    if (!status) return "default";
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "pending":
        return "warning";
      case "under process":
        return "info";
      default:
        return "default";
    }
  };


  const handleViewDocument = (filePath: string) => {
    window.open(filePath, "_blank");
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
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/dealer-listing")}
          >
            Dealer Management
          </Link>
          <Typography color="text.primary">{pageTitle}</Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            mt: 3,
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
              onClick={() => navigate("/dealer-listing")}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <div>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {pageTitle}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Code: {formData.dealerCode}
              </Typography>
            </div>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {formData.status && (
              <Chip
                label={formData.status}
                size="small"
                color={getStatusColor(formData.status) as any}
                sx={{ mt: 0.5 }}
              />
            )}
            {activeTab == 5 && checkChequeDetailsValid() && (
              <>
                <Switch
                  checked={isActive}
                  onChange={(e) => {
                    setIsActive(e.target.checked);
                    setIsConfirmModalOpen(true);
                  }}
                />
                Active
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 3, pt: 1, borderRadius: 2, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="dealer onboarding tabs"
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabConfigs.map(({ label, permission }) => {
              const hasPermission = CommonService.checkPermission([permission]);
              return (
                <Tab
                  key={label}
                  label={label}
                  disabled={!hasPermission}
                  sx={{
                    opacity: hasPermission ? 1 : 0.5,
                  }}
                />
              );
            })}
            {/* {CommonService.checkPermission(['Edit Dealership Data'])&& <Tab label="Dealership Data"/>}
            {CommonService.checkPermission(['Edit KYC Upload Data'])&& <Tab label="KYC Doc"/>}
            {CommonService.checkPermission(['Edit Borrower-Guarantor Data'])&& <Tab label="Borrower & Guarantor"/>}
            {CommonService.checkPermission(['Edit Sanction Details Data'])&& <Tab label="Sanction Details"/>}
            {CommonService.checkPermission(['Edit Cheques Details Data'])&& <Tab label="Cheques Details"/>}
            {CommonService.checkPermission(['Edit Deposit Details Data'])&& <Tab label="Deposit Details"/>} */}
          </Tabs>
        </Box>

        {/* Dealership Data Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                color="primary"
                sx={{ mt: 2 }}
              >
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Loan Proposal No"
                name="loanProposalNo"
                value={formData.loanProposalNo}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="Relationship-Manager-label">Relationship Manager</InputLabel>
                <Select
                  labelId="Relationship-Manager-label"
                  name="relationshipManagerId"
                  value={formData.relationshipManagerId}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      relationshipManagerId: Number(e.target.value),
                    }));
                  }}
                  label="Relationship Manager"
                >
                  {relationshipManagerOptions.map((rep) => (
                    <MenuItem key={rep.id} value={rep.id}>
                      {rep.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.relationshipManagerId && (
                  <FormHelperText error>
                    {formErrors.relationshipManagerId}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Dealer Code"
                name="dealerCode"
                value={formData.dealerCode}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                error={!!formErrors.dealerCode}
                helperText={formErrors.dealerCode}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Dealership Name"
                name="dealershipName"
                value={formData.dealershipName}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                error={!!formErrors.dealershipName}
                helperText={formErrors.dealershipName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Dealership PAN"
                name="dealershipPAN"
                value={formData.dealershipPAN}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                error={!!formErrors.dealershipPAN}
                helperText={formErrors.dealershipPAN}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="Date of Incorporation"
                name="dateOfIncorporation"
                value={formData.dateOfIncorporation}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: maxDate.toISOString().split("T")[0],
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel id="Entity-label">Entity</InputLabel>
                <Select
                  labelId="Entity-label"
                  name="entity"
                  value={formData.entity}
                  onChange={handleSelectChange}
                  label="Entity"
                  error={!!formErrors.entity}
                >
                  {entityTypeOptions?.map((entityTypeItem) => (
                    <MenuItem
                      key={entityTypeItem?.id}
                      value={entityTypeItem?.name}
                    >
                      {entityTypeItem?.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors?.entity && (
                  <FormHelperText error>{formErrors?.entity}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel id="GST-Registration-Status-label">
                  GST Registration Status
                </InputLabel>
                <Select
                  labelId="GST-Registration-Status-label"
                  name="gstRegStatus"
                  value={formData.gstRegStatus}
                  onChange={handleSelectChange}
                  label="GST Registration Status"
                  error={!!formErrors.gstRegStatus}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
                {formErrors?.gstRegStatus && (
                  <FormHelperText error>
                    {formErrors?.gstRegStatus}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            {formData.gstRegStatus == "Yes" && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="GST No"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={!!formErrors.gstNo}
                  helperText={formErrors.gstNo}
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel id="MSME-Status-label">MSME Status</InputLabel>
                <Select
                  labelId="MSME-Status-label"
                  name="msmeStatus"
                  value={formData.msmeStatus}
                  onChange={handleSelectChange}
                  label="MSME Status"
                  error={!!formErrors.msmeStatus}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
                {formErrors?.msmeStatus && (
                  <FormHelperText error>
                    {formErrors?.msmeStatus}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            {formData.msmeStatus == "Yes" && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="MSME Registration No"
                    name="msmeRegistrationNo"
                    value={formData.msmeRegistrationNo}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={!!formErrors.msmeRegistrationNo}
                    helperText={formErrors.msmeRegistrationNo}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="MSME-Type-label">MSME Type</InputLabel>
                    <Select
                      labelId="MSME-Type-label"
                      name="msmeType"
                      value={formData.msmeType}
                      onChange={handleSelectChange}
                      label="MSME Type"
                    >
                      <MenuItem value="Micro">Micro</MenuItem>
                      <MenuItem value="Small">Small</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                    </Select>
                    {formErrors?.msmeType && (
                      <FormHelperText error>
                        {formErrors?.msmeType}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="Business-Category-label">
                  Business Category
                </InputLabel>
                <Select
                  labelId="Business-Category-label"
                  name="businessCategory"
                  value={formData.businessCategory}
                  onChange={handleSelectChange}
                  label="Business-Category"
                >
                  {businessCategoryOptions?.map((businessCategoryItem) => (
                    <MenuItem
                      key={businessCategoryItem?.id}
                      value={businessCategoryItem?.name}
                    >
                      {businessCategoryItem?.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors?.businessCategory && (
                  <FormHelperText error>
                    {formErrors?.businessCategory}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="Business-Type-label">Business Type</InputLabel>
                <Select
                  labelId="Business-Type-label"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleSelectChange}
                  label="Business-Type"
                >
                  {businessTypeOptions?.map((businessTypeItem) => (
                    <MenuItem
                      key={businessTypeItem?.id}
                      value={businessTypeItem?.name}
                    >
                      {businessTypeItem?.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors?.businessType && (
                  <FormHelperText error>
                    {formErrors?.businessType}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                color="primary"
                sx={{ mt: 2 }}
              >
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Contact No"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                error={!!formErrors.contactNo}
                helperText={formErrors.contactNo}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Alternative Contact No"
                name="alternativeContactNo"
                value={formData.alternativeContactNo}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                error={!!formErrors.alternativeContactNo}
                helperText={formErrors.alternativeContactNo}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email ID"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                error={!!formErrors.emailId}
                helperText={formErrors.emailId}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Alternative Email ID"
                name="alternativeEmailId"
                value={formData.alternativeEmailId}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                size="small"
                error={!!formErrors.alternativeEmailId}
                helperText={formErrors.alternativeEmailId}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                Shop Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  multiline={true}
                  rows={3}
                  sx={{ pb: 3 }}
                  error={!!formErrors.shopAddress}
                  helperText={formErrors.shopAddress}
                />
              </Grid>
              {/* <Grid item xs={12}>
                <FormControl fullWidth size="small" sx={{ pb: 3 }}>
                  <InputLabel id="state-label">State</InputLabel>
                  <Select
                    labelId="state-label"
                    value={formData.state}
                    name="state"
                    onChange={handleSelectChange}
                    label="State"
                  >
                    {allStateOptions?.map((stateItem) => (
                      <MenuItem key={stateItem?.id} value={stateItem?.name}>
                        {stateItem?.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid> */}
             <Grid item xs={12}>
  <Autocomplete
    fullWidth
    size="small"
    options={allStateOptions || []}
    getOptionLabel={(option) => option.name || ''}
    value={
      allStateOptions?.find((item) => item.name === formData.state) || null
    }
    onChange={(event, newValue) => {
      handleSelectChange({
        target: {
          name: 'state',
          value: newValue ? newValue.name : '',
        },
      });
    }}
    renderInput={(params) => (
      <TextField {...params} label="State" variant="outlined" />
    )}
    sx={{ pb: 3 }}
  />
</Grid>
<Grid item xs={12}>
  <Autocomplete
    fullWidth
    size="small"
    options={officeStateByCityOptions || []}
    getOptionLabel={(option) => option.name || ''}
    value={
      officeStateByCityOptions?.find(
        (city) => city.name === formData.city
      ) || null
    }
    onChange={(event, newValue) => {
      handleSelectChange({
        target: {
          name: 'city',
          value: newValue ? newValue.name : '',
        },
      });
    }}
    renderInput={(params) => (
      <TextField {...params} label="City" variant="outlined" />
    )}
    sx={{ pb: 3 }}
  />
</Grid>
              <Grid item xs={12}>
                <TextField
                  type="text"
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,6}$/.test(val)) {
                      handleChange(e);
                    }
                  }}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                Parking Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="parkingYardAddress"
                  value={formData.parkingYardAddress}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  multiline={true}
                  sx={{ pb: 3 }}
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
  <Autocomplete
    fullWidth
    size="small"
    options={allStateOptions || []}
    getOptionLabel={(option) => option.name || ''}
    value={
      allStateOptions?.find(
        (state) => state.name === formData.parkingYardState
      ) || null
    }
    onChange={(event, newValue) => {
      handleSelectChange({
        target: {
          name: 'parkingYardState',
          value: newValue ? newValue.name : '',
        },
      });
    }}
    renderInput={(params) => (
      <TextField {...params} label="State" variant="outlined" />
    )}
    sx={{ pb: 3 }}
  />
</Grid>
<Grid item xs={12}>
  <Autocomplete
    fullWidth
    size="small"
    options={parkingYardStateByCityOptions || []}
    getOptionLabel={(option) => option.name || ''}
    value={
      parkingYardStateByCityOptions?.find(
        (city) => city.name === formData.parkingYardCity
      ) || null
    }
    onChange={(event, newValue) => {
      handleSelectChange({
        target: {
          name: 'parkingYardCity',
          value: newValue ? newValue.name : '',
        },
      });
    }}
    renderInput={(params) => (
      <TextField {...params} label="City" variant="outlined" />
    )}
    sx={{ pb: 3 }}
  />
</Grid>
              <Grid item xs={12}>
                <TextField
                  type="text"
                  label="Pincode"
                  name="parkingYardPinCode"
                  value={formData.parkingYardPinCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,6}$/.test(val)) {
                      handleChange(e);
                    }
                  }}
                  fullWidth
                  variant="outlined"
                  size="small"
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                color="primary"
                sx={{ mt: 2 }}
              >
                Agreement Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="Office-Status-label">Office Status</InputLabel>
                <Select
                  labelId="Office-Status-label"
                  name="officeStatus"
                  value={formData.officeStatus}
                  onChange={handleSelectChange}
                  label="Office Status"
                >
                  {addressStatusOptions?.map((addressStatusItem) => (
                    <MenuItem
                      key={addressStatusItem?.id}
                      value={addressStatusItem?.name}
                    >
                      {addressStatusItem?.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors?.officeStatus && (
                  <FormHelperText error>
                    {formErrors?.officeStatus}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="Parking-Status-label">
                  Parking Status
                </InputLabel>
                <Select
                  labelId="Parking-Status-label"
                  name="parkingStatus"
                  value={formData.parkingStatus}
                  onChange={handleSelectChange}
                  label="Parking Status"
                >
                  {addressStatusOptions?.map((addressStatusItem) => (
                    <MenuItem
                      key={addressStatusItem?.id}
                      value={addressStatusItem?.name}
                    >
                      {addressStatusItem?.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors?.parkingStatus && (
                  <FormHelperText error>
                    {formErrors?.parkingStatus}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            {formData.officeStatus == "Rented" && (
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Office Agreement Date"
                  name="agreementDate"
                  value={formData.agreementDate}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.agreementDate}
                  helperText={formErrors.agreementDate} inputProps={{
                    max: maxDate.toISOString().split("T")[0],
                  }}
                />
              </Grid>
            )}

            {formData.parkingStatus == "Rented" && (
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Parking Agreement Date"
                  name="parkingAgreementDate"
                  value={formData.parkingAgreementDate}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.parkingAgreementDate}
                  helperText={formErrors.parkingAgreementDate}
                  inputProps={{
                    max: maxDate.toISOString().split("T")[0],
                  }}
                />
              </Grid>
            )}

            {formData.officeStatus == "Rented" && (
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Office Agreement Expiry Date"
                  name="agreementExpiryDate"
                  value={formData.agreementExpiryDate}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.agreementExpiryDate}
                  helperText={formErrors.agreementExpiryDate}
                />
              </Grid>
            )}

            {formData.parkingStatus == "Rented" && (
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Parking Agreement Expiry Date"
                  name="parkingAgreementExpiryDate"
                  value={formData.parkingAgreementExpiryDate}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.parkingAgreementExpiryDate}
                  helperText={formErrors.parkingAgreementExpiryDate}
                />
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {/* ATTACHMENTS SECTION */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Soft Copy / Attachments
              </Typography>
            </Grid>

            {/* Dealership PAN */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Dealership PAN
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                {formData.DEALERSHIP_PAN?.document?.name ??
                  `Upload Dealership PAN`}

                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, "DEALERSHIP_PAN")}
                />
              </Button>
            </Grid>

            {/* GST Certificate / Declaration */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                GST Certificate / Declaration
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                {formData.GST_CERTIFICATE?.document?.name ??
                  `Upload GST Certificate / Declaration`}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, "GST_CERTIFICATE")}
                />
              </Button>
            </Grid>

            {/* Registration Certificate */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Registration Certificate
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                {formData.REGISTRATION_CERTIFICATE?.document?.name ??
                  `Upload Registration Certificate`}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFileUpload(e, "REGISTRATION_CERTIFICATE")
                  }
                />
              </Button>
            </Grid>

            {/* Address Proof */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Address Proof
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                {formData.ADDRESS_PROOF?.document?.name ??
                  `Upload Address Proof`}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, "ADDRESS_PROOF")}
                />
              </Button>
            </Grid>

            <Grid item xs={9}>
              <Typography variant="subtitle1" gutterBottom>
                Multi Other Doc
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AddCircleOutline />}
                fullWidth
                onClick={() =>
                  setMultipleOtherDoc([
                    ...allMultipleOtherDoc,
                    {
                      dealerId: formData.id,
                      documentType: "",
                      document: null,
                    },
                  ])
                }
              >
                Add Other Doc
              </Button>
            </Grid>

            
            {allMultipleOtherDoc.map((otherDocItem, otherDocIndex) => (
              <React.Fragment key={otherDocIndex + "index"}>
                <Grid item xs={12} md={allMultipleOtherDoc.length > 1 ? 6 : 6}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Document Type"
                    value={otherDocItem.documentType}
                    onChange={(e) =>
                      handleOtherDocUpload("documentType", e, otherDocIndex)
                    }
                    sx={{ pb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} md={allMultipleOtherDoc.length > 1 ? 5 : 6}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    {otherDocItem?.document?.name ?? `Upload Other Doc  `}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        handleOtherDocUpload("documentFile", e, otherDocIndex)
                      }
                    />
                  </Button>
                </Grid>
                {allMultipleOtherDoc.length > 1 && (
                  <Grid
                    item
                    xs={12}
                    md={1}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Delete
                      onClick={() => handleRemoveOtherDoc(otherDocIndex)}
                      color="error"
                    />
                  </Grid>
                )}
              </React.Fragment>
            ))}
            {formData?.id > 0 && (
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
                      {allKycDocuments?.length > 0 ? (
                        allKycDocuments.map((doc) => (
                          <TableRow key={doc.id}>
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
                          <TableCell colSpan={16} align="center" sx={{ py: 3 }}>
                            No documents found for this dealer
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                {getTitle(formData.entity)}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            {/* Proprietorship UI - Borrower & Guarantor */}
            {/* Borrowers */}
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {formData.entity === "Proprietorship" ? "Borrower Details" : ""}
              </Typography>
            </Grid>
            {borrowers.map((b, i) => (
              <Grid
                container
                spacing={2}
                key={`borrower-${i}`}
                sx={{
                  mb: 4,
                  pr: 2,
                  pb: 2,
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  ml: 3,
                }}
              >
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="borrower-type-label">
                      Person Type
                    </InputLabel>
                    <Select
                      labelId="borrower-type-label"
                      value={b.personType}
                      onChange={(e) =>
                        handleBorrowerChange(i, "personType", e.target.value)
                      }
                      label="Person Type"
                      error={
                        !!borrowOrGurantorFormErrors.borrowers?.[i]?.personType
                      }
                    >
                      {personTypeOptions?.map((personItem) => (
                        <MenuItem key={personItem?.id} value={personItem?.name}>
                          {personItem?.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {borrowOrGurantorFormErrors.borrowers?.[i]?.personType && (
                      <FormHelperText error>
                        {borrowOrGurantorFormErrors.borrowers?.[i]?.personType}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Name"
                    value={b.name}
                    onChange={(e) =>
                      handleBorrowerChange(i, "name", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="PAN"
                    value={b.pan}
                    onChange={(e) =>
                      handleBorrowerChange(i, "pan", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={b.dateOfBirth?.split("T")[0] || ""}
                    onChange={(e) =>
                      handleBorrowerChange(i, "dateOfBirth", e.target.value)
                    }
                    inputProps={{
                      max: maxDOB.toISOString().split("T")[0],
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mobile"
                    value={b.mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,10}$/.test(val)) {
                        handleBorrowerChange(i, "mobileNumber", e.target.value);
                      }
                    }}
                    inputProps={{ maxLength: 10 }}
                    error={
                      !!borrowOrGurantorFormErrors.borrowers?.[i]?.mobileNumber
                    }
                    helperText={
                      borrowOrGurantorFormErrors.borrowers?.[i]?.mobileNumber
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    value={b.email}
                    onChange={(e) =>
                      handleBorrowerChange(i, "email", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Father Name"
                    value={b.fatherName}
                    onChange={(e) =>
                      handleBorrowerChange(i, "fatherName", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Adhar No"
                    value={b.aadharNo}
                    onChange={(e) =>
                      handleBorrowerChange(
                        i,
                        "aadharNo",
                        isNaN(Number(e.target.value))
                          ? ""
                          : String(e.target.value)
                      )
                    }
                    inputProps={{ maxLength: 12 }}
                    error={
                      !!borrowOrGurantorFormErrors.borrowers?.[i]?.aadharNo
                    }
                    helperText={
                      borrowOrGurantorFormErrors.borrowers?.[i]?.aadharNo
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="CIBIL"
                    value={b.cibilScore}
                    onChange={(e) =>
                      handleBorrowerChange(
                        i,
                        "cibilScore",
                        isNaN(Number(e.target.value))
                          ? 0
                          : Number(e.target.value)
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="borrower-relation-with-borrow-label">
                      Relationship With Borrower
                    </InputLabel>
                    <Select
                      labelId="borrower-relation-with-borrow-label"
                      value={b.relationshipWithEntity}
                      onChange={(e) =>
                        handleBorrowerChange(
                          i,
                          "relationshipWithEntity",
                          e.target.value
                        )
                      }
                      label="Relationship With Entity"
                    >
                      {relationShipOptions?.map((value: string) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                  >
                    Current Address Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Address"
                      multiline
                      rows={2}
                      value={b.currentAddress}
                      onChange={(e) =>
                        handleBorrowerChange(
                          i,
                          "currentAddress",
                          e.target.value
                        )
                      }
                      sx={{ pb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
  <Autocomplete
    fullWidth
    size="small"
    options={allStateOptions || []}
    getOptionLabel={(option) => option.name || ''}
    value={
      allStateOptions?.find(
        (state) => state.name === b.borrowerCState
      ) || null
    }
    onChange={(event, newValue) => {
      handleBorrowerChange(i, "borrowerCState", newValue ? newValue.name : "");
    }}
    renderInput={(params) => (
      <TextField {...params} label="State" variant="outlined" />
    )}
    sx={{ pb: 3 }}
  />
</Grid>
<Grid item xs={12}>
  <Autocomplete
    fullWidth
    size="small"
    options={b?.borrowerCCityList || []}
    getOptionLabel={(option) => option.name || ''}
    value={
      b?.borrowerCCityList?.find(
        (city) => city.name === b.borrowerCCity
      ) || null
    }
    onChange={(event, newValue) => {
      handleBorrowerChange(i, "borrowerCCity", newValue ? newValue.name : "");
    }}
    renderInput={(params) => (
      <TextField {...params} label="City" variant="outlined" />
    )}
    sx={{ pb: 3 }}
  />
</Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Pincode"
                      value={b.borrowerCPinCode}
                      onChange={(e) =>
                        handleBorrowerChange(
                          i,
                          "borrowerCPinCode",
                          isNaN(Number(e.target.value))
                            ? ""
                            : String(e.target.value)
                        )
                      }
                      inputProps={{ maxLength: 6 }}
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                  >
                    Permanent Address Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Address"
                      multiline
                      rows={2}
                      value={b.permanentAddress}
                      onChange={(e) =>
                        handleBorrowerChange(
                          i,
                          "permanentAddress",
                          e.target.value
                        )
                      }
                      sx={{ pb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
  <Autocomplete
    fullWidth
    size="small"
    options={allStateOptions || []}
    getOptionLabel={(option) => option.name || ''}
    value={
      allStateOptions?.find((state) => state.name === b.borrowerPState) || null
    }
    onChange={(event, newValue) => {
      handleBorrowerChange(
        i,
        "borrowerPState",
        newValue ? newValue.name : ""
      );
    }}
    renderInput={(params) => (
      <TextField {...params} label="State" variant="outlined" />
    )}
    sx={{ pb: 3 }}
  />
</Grid>
<Grid item xs={12}>
  <Autocomplete
    fullWidth
    size="small"
    options={b?.borrowerPCityList || []}
    getOptionLabel={(option) => option.name || ''}
    value={
      b?.borrowerPCityList?.find(
        (city) => city.name === b.borrowerPCity
      ) || null
    }
    onChange={(event, newValue) => {
      handleBorrowerChange(
        i,
        "borrowerPCity",
        newValue ? newValue.name : ""
      );
    }}
    renderInput={(params) => (
      <TextField {...params} label="City" variant="outlined" />
    )}
    sx={{ pb: 3 }}
  />
</Grid>


                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Pincode"
                      value={b.borrowerPPincode}
                      onChange={(e) =>
                        handleBorrowerChange(
                          i,
                          "borrowerPPincode",
                          isNaN(Number(e.target.value))
                            ? ""
                            : String(e.target.value)
                        )
                      }
                      inputProps={{ maxLength: 6 }}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="address-status-label">
                      Address Status
                    </InputLabel>
                    <Select
                      labelId="address-status-label"
                      value={b.addressStatus}
                      onChange={(e) =>
                        handleBorrowerChange(i, "addressStatus", e.target.value)
                      }
                      label="Address Status"
                    >
                      {addressStatusOptions?.map((addressStatusItem) => (
                        <MenuItem
                          key={addressStatusItem?.id}
                          value={addressStatusItem?.name}
                        >
                          {addressStatusItem?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {b.addressStatus == "Rented" && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Address Agreement Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={b.addressAgreementDate?.split("T")[0] || ""}
                        onChange={(e) =>
                          handleBorrowerChange(
                            i,
                            "addressAgreementDate",
                            e.target.value
                          )
                        }
                        inputProps={{
                          max: maxDate.toISOString().split("T")[0],
                        }}
                        error={
                          !!borrowOrGurantorFormErrors.borrowers?.[i]
                            ?.addressAgreementDate
                        }
                        helperText={
                          borrowOrGurantorFormErrors.borrowers?.[i]
                            ?.addressAgreementDate
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Address Agreement Expiry Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={
                          b.addressAgreementExpiryDate?.split("T")[0] || ""
                        }
                        onChange={(e) =>
                          handleBorrowerChange(
                            i,
                            "addressAgreementExpiryDate",
                            e.target.value
                          )
                        }
                        error={
                          !!borrowOrGurantorFormErrors.borrowers?.[i]
                            ?.addressAgreementExpiryDate
                        }
                        helperText={
                          borrowOrGurantorFormErrors.borrowers?.[i]
                            ?.addressAgreementExpiryDate
                        }
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Button color="error" onClick={() => removeBorrower(i)}>
                    {formData.entity === "Proprietorship"
                      ? "Remove Borrower"
                      : "Remove"}
                  </Button>
                </Grid>
                {/* Dealership PAN */}
                {/* <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    {b.personType}_PAN
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                   {formData[`${b.personType}_PAN` as keyof typeof formData]?.document?.name ??
  `Upload ${b.personType} PAN`}

<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleFileUpload(e, `${b.personType}_PAN`)}
/>
                    {/* {formData.DEALERSHIP_PAN?.document?.name ??
                  `Upload Dealership PAN`}

                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, "DEALERSHIP_PAN")}
                /> 
                  </Button>
                </Grid> */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    {b.personType} PAN
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                   {b.Pan_Card?.document?.name??'Upload'}
<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleBorrowerOrGurantorDocUpload(e,i, 'Pan_Card','borrower')}
/>
                
                  </Button>
                </Grid>
                {/* GST Certificate / Declaration */}
               <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  {b.personType} Adhaar
                </Typography>
<Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                   {b.Gst_Certificate?.document?.name??'Upload'}
<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleBorrowerOrGurantorDocUpload(e,i, 'Gst_Certificate','borrower')}
/>
                
                  </Button>
                </Grid>
                {/* Registration Certificate */}
                
               <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                 {b.personType} Bank Statement
                </Typography>
<Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                   {b.Registration_Certificate?.document?.name??'Upload'}
<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleBorrowerOrGurantorDocUpload(e,i, 'Registration_Certificate','borrower')}
/>
                
                  </Button>
                </Grid>

                {/* Address Proof */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    {b.personType} Address Proof
                  </Typography>
                 <Button
                 component="label"
                 variant="outlined"
                 startIcon={<CloudUploadIcon />}
                 fullWidth
                 >
                  {b.Address_Proof?.document?.name??'Upload'}
<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleBorrowerOrGurantorDocUpload(e,i, 'Address_Proof','borrower')}
/>
                </Button>
                </Grid>

                {/*ITR*/}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    {b.personType} ITR
                  </Typography>
                 <Button
                 component="label"
                 variant="outlined"
                 startIcon={<CloudUploadIcon />}
                 fullWidth
                 >
                  {b.ITR?.document?.name??'Upload'}
<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleBorrowerOrGurantorDocUpload(e,i, 'ITR','borrower')}
/>
                </Button>
                </Grid>
              </Grid>
            ))}
            <Grid xs={12} sx={{ textAlign: "right", mb: 2 }}>
              <Button
                variant="outlined"
                onClick={() =>
                  setBorrowers([
                    ...borrowers,
                    {
                      id: 0,
                      dealerId: 0,
                      name: "",
                      pan: "",
                      dateOfBirth: "",
                      mobileNumber: "",
                      email: "",
                      fatherName: "",
                      relationshipWithEntity: "",
                      cibilScore: 0,
                      aadharNo: "",
                      personType: "",
                      addressStatus: "",
                      attachmentPath: "",
                      addressAgreementDate: "",
                      addressAgreementExpiryDate: "",
                      currentAddress: "",
                      borrowerCPinCode: "",
                      borrowerCState: "",
                      permanentAddress: "",
                      borrowerPPincode: "",
                      borrowerPState: "",
                      borrowerCCity: "",
                      borrowerPCity: "",
                      borrowerCCityList: [],
                      borrowerPCityList: [],
                      Pan_Card: {
                        dealerId: "",
                        documentType: "",
                        document: null
                      },
                      Registration_Certificate: {
                        dealerId: "",
                        documentType: "",
                        document: null
                      },
                      Gst_Certificate: {
                        dealerId: "",
                        documentType: "",
                        document: null
                      },
                      Address_Proof: {
                        dealerId: "",
                        documentType: "",
                        document: null
                      }
                    },
                  ])
                }
              >
                {formData.entity === "Proprietorship" ? "Add Borrower" : "Add"}
              </Button>
            </Grid>
            {formData.entity === "Proprietorship" && (
              <>
                {/* Guarantors */}
                <Grid item xs={12} sx={{ pt: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Guarantor Details
                  </Typography>
                </Grid>

                {guarantors.map((g, i) => (
                  <Grid
                    container
                    spacing={2}
                    key={`guarantor-${i}`}
                    sx={{
                      mb: 3,
                      pr: 2,
                      pb: 2,
                      border: "1px solid #ccc",
                      borderRadius: 1,
                      ml: 3,
                    }}
                  >
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="guarantor-type-label">
                          Person Type
                        </InputLabel>
                        <Select
                          labelId="guarantor-type-label"
                          value={g.personType}
                          onChange={(e) =>
                            handleGuarantorChange(
                              i,
                              "personType",
                              e.target.value
                            )
                          }
                          label="Person Type"
                          error={
                            !!borrowOrGurantorFormErrors.gurantor?.[i]
                              ?.personType
                          }
                        >
                          {personTypeOptions?.map((personItem) => (
                            <MenuItem
                              key={personItem?.id}
                              value={personItem?.name}
                            >
                              {personItem?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {borrowOrGurantorFormErrors.gurantor?.[i]
                          ?.personType && (
                            <FormHelperText error>
                              {
                                borrowOrGurantorFormErrors.gurantor?.[i]
                                  ?.personType
                              }
                            </FormHelperText>
                          )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Name"
                        value={g.name}
                        onChange={(e) =>
                          handleGuarantorChange(i, "name", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="PAN"
                        value={g.pan}
                        onChange={(e) =>
                          handleGuarantorChange(i, "pan", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Date of Birth"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={g.dateOfBirth?.split("T")[0] || ""}
                        onChange={(e) =>
                          handleGuarantorChange(
                            i,
                            "dateOfBirth",
                            e.target.value
                          )
                        }
                        inputProps={{
                          max: maxDate.toISOString().split("T")[0],
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Mobile"
                        value={g.mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d{0,10}$/.test(val)) {
                            handleGuarantorChange(
                              i,
                              "mobileNumber",
                              e.target.value
                            );
                          }
                        }}
                        error={
                          !!borrowOrGurantorFormErrors.gurantor?.[i]
                            ?.mobileNumber
                        }
                        helperText={
                          borrowOrGurantorFormErrors.gurantor?.[i]?.mobileNumber
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        value={g.email}
                        onChange={(e) =>
                          handleGuarantorChange(i, "email", e.target.value)
                        }
                      />
                    </Grid>
                      
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Father Name"
                        value={g.fatherName}
                        onChange={(e) =>
                          handleGuarantorChange(i, "fatherName", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Adhar No"
                        value={g.aadharNo}
                        onChange={(e) =>
                          handleGuarantorChange(
                            i,
                            "aadharNo",
                            isNaN(Number(e.target.value))
                              ? ""
                              : String(e.target.value)
                          )
                        }
                        inputProps={{ maxLength: 12 }}
                        error={
                          !!borrowOrGurantorFormErrors.gurantor?.[i]?.aadharNo
                        }
                        helperText={
                          borrowOrGurantorFormErrors.gurantor?.[i]?.aadharNo
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="CIBIL"
                        value={g.cibilScore}
                        onChange={(e) =>
                          handleGuarantorChange(
                            i,
                            "cibilScore",
                            isNaN(Number(e.target.value))
                              ? 0
                              : Number(e.target.value)
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="guarantor-relation-with-borrow-label">
                          Relationship With Borrower
                        </InputLabel>
                        <Select
                          labelId="guarantor-relation-with-borrow-label"
                          value={g.relationshipWithBorrower}
                          onChange={(e) =>
                            handleGuarantorChange(
                              i,
                              "relationshipWithBorrower",
                              e.target.value
                            )
                          }
                          label="Relationship With Borrower"
                        >
                          {relationShipOptions?.map((value: string) => (
                            <MenuItem key={value} value={value}>
                              {value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                        color="primary"
                      >
                        Current Address Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Address"
                          multiline
                          rows={2}
                          value={g.currentAddress}
                          onChange={(e) =>
                            handleGuarantorChange(
                              i,
                              "currentAddress",
                              e.target.value
                            )
                          }
                          sx={{ pb: 3 }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl fullWidth size="small" sx={{ pb: 3 }}>
                          <InputLabel id="gurantor-state-label">
                            State
                          </InputLabel>
                          <Select
                            labelId="gurantor-state-label"
                            value={g.guarantorCState}
                            onChange={(e) =>
                              handleGuarantorChange(
                                i,
                                "guarantorCState",
                                e.target.value
                              )
                            }
                            label="State"
                          >
                            {allStateOptions?.map((stateItem) => (
                              <MenuItem
                                key={stateItem?.id}
                                value={stateItem?.name}
                              >
                                {stateItem?.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small" sx={{ pb: 3 }}>
                          <InputLabel id="city-gurantor-label">City</InputLabel>
                          <Select
                            labelId="city-gurantor-label"
                            value={g.guarantorCCity}
                            onChange={(e) =>
                              handleGuarantorChange(
                                i,
                                "guarantorCCity",
                                e.target.value
                              )
                            }
                            label="City"
                          >
                            {g?.guarantorCCityList?.map((cityItem) => (
                              <MenuItem
                                key={cityItem?.id}
                                value={cityItem?.name}
                              >
                                {cityItem?.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Pincode"
                          value={g.guarantorCPinCode}
                          onChange={(e) =>
                            handleGuarantorChange(
                              i,
                              "guarantorCPinCode",
                              isNaN(Number(e.target.value))
                                ? ""
                                : String(e.target.value)
                            )
                          }
                          inputProps={{ maxLength: 6 }}
                        />
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                        color="primary"
                      >
                        Permanent Address Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Address"
                          multiline
                          rows={2}
                          value={g.permanentAddress}
                          onChange={(e) =>
                            handleGuarantorChange(
                              i,
                              "permanentAddress",
                              e.target.value
                            )
                          }
                          sx={{ pb: 3 }}
                        />
                      </Grid>

                      <Grid item xs={12}>
  <Autocomplete
    fullWidth
    size="small"
    options={allStateOptions || []}
    getOptionLabel={(option) => option.name || ''}
    value={
      allStateOptions?.find(
        (state) => state.name === g.guarantorPState
      ) || null
    }
    onChange={(event, newValue) => {
      handleGuarantorChange(
        i,
        "guarantorPState",
        newValue ? newValue.name : ""
      );
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="State"
        variant="outlined"
        error={!!borrowOrGurantorFormErrors.gurantor?.[i]?.guarantorPState}
        helperText={
          borrowOrGurantorFormErrors.gurantor?.[i]?.guarantorPState || ""
        }
      />
    )}
    sx={{ pb: 3 }}
  />
</Grid>
<Grid item xs={12}>
  <Autocomplete
    fullWidth
    size="small"
    options={g?.guarantorPCityList || []}
    getOptionLabel={(option) => option.name || ''}
    value={
      g?.guarantorPCityList?.find(
        (city) => city.name === g.guarantorPCity
      ) || null
    }
    onChange={(event, newValue) => {
      handleGuarantorChange(
        i,
        "guarantorPCity",
        newValue ? newValue.name : ""
      );
    }}
    renderInput={(params) => (
      <TextField {...params} label="City" variant="outlined" />
    )}
    sx={{ pb: 3 }}
  />
</Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Pincode"
                          value={g.guarantorPPincode}
                          onChange={(e) =>
                            handleGuarantorChange(
                              i,
                              "guarantorPPincode",
                              isNaN(Number(e.target.value))
                                ? ""
                                : String(e.target.value)
                            )
                          }
                          inputProps={{ maxLength: 6 }}
                        />
                      </Grid>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="address-status-label">
                          Address Status
                        </InputLabel>
                        <Select
                          labelId="address-status-label"
                          value={g.addressStatus}
                          onChange={(e) =>
                            handleGuarantorChange(
                              i,
                              "addressStatus",
                              e.target.value
                            )
                          }
                          label="Address Status"
                        >
                          {addressStatusOptions?.map((addressStatusItem) => (
                            <MenuItem
                              key={addressStatusItem?.id}
                              value={addressStatusItem?.name}
                            >
                              {addressStatusItem?.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid> <br />
                    <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    {g.personType}PAN
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                   {g.Pan_Card?.document?.name??'Upload'}
<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleBorrowerOrGurantorDocUpload(e,i, 'Pan_Card','gurantor')}
/>
                
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    {g.personType}Adhar
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                   {g.Gst_Certificate?.document?.name??'Upload'}
<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleBorrowerOrGurantorDocUpload(e,i, 'Gst_Certificate','gurantor')}
/>
                
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    {g.personType}Bank Statement
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                   {g.Registration_Certificate?.document?.name??'Upload'}
<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleBorrowerOrGurantorDocUpload(e,i, 'Registration_Certificate','gurantor')}
/>
                
                  </Button>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    {g.personType}_ADDRESS_PROOF
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                   {g.Address_Proof?.document?.name??'Upload'}
<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleBorrowerOrGurantorDocUpload(e,i, 'Address_Proof','gurantor')}
/>
                
                  </Button>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    {g.personType}_ITR
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                   {g.ITR?.document?.name??'Upload'}
<input
  type="file"
  hidden
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleBorrowerOrGurantorDocUpload(e,i, 'ITR','gurantor')}
/>
                
                  </Button>
                </Grid>
                </Grid>
                    {g.addressStatus == "Rented" && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Address Agreement Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={g.addressAgreementDate?.split("T")[0] || ""}
                            onChange={(e) =>
                              handleGuarantorChange(
                                i,
                                "addressAgreementDate",
                                e.target.value
                              )
                            }
                            error={
                              !!borrowOrGurantorFormErrors.gurantor?.[i]
                                ?.addressAgreementDate
                            }
                            helperText={
                              borrowOrGurantorFormErrors.gurantor?.[i]
                                ?.addressAgreementDate
                            }
                            inputProps={{
                              max: maxDate.toISOString().split("T")[0],
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Address Agreement Expiry Date"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={
                              g.addressAgreementExpiryDate?.split("T")[0] || ""
                            }
                            onChange={(e) =>
                              handleGuarantorChange(
                                i,
                                "addressAgreementExpiryDate",
                                e.target.value
                              )
                            }
                            error={
                              !!borrowOrGurantorFormErrors.gurantor?.[i]
                                ?.addressAgreementDate
                            }
                            helperText={
                              borrowOrGurantorFormErrors.gurantor?.[i]
                                ?.addressAgreementDate
                            }
                          />
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12}>
                      <Button color="error" onClick={() => removeGuarantor(i)}>
                        Remove Guarantor
                      </Button>
                    </Grid>
                  </Grid>
                ))}

                <Grid xs={12} sx={{ textAlign: "right", mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setGuarantors([
                        ...guarantors,
                        {
                          id: 0,
                          dealerId: 0,
                          name: "",
                          pan: "",
                          dateOfBirth: "",
                          mobileNumber: "",
                          email: "",
                          fatherName: "",
                          currentAddress: "",
                          permanentAddress: "",
                          cibilScore: 0,
                          aadharNo: "",
                          personType: "",
                          addressStatus: "",
                          attachmentPath: "",
                          relationshipWithBorrower: "",
                          addressAgreementDate: "",
                          addressAgreementExpiryDate: "",
                          guarantorCCity: "",
                          guarantorPCity: "",
                          guarantorCState: "",
                          guarantorPState: "",
                          guarantorCPinCode: "",
                          guarantorPPincode: "",
                          guarantorCCityList: [],
                          guarantorPCityList: [],
                        },
                      ])
                    }
                  >
                    Add Guarantor
                  </Button>
                </Grid>
              </>
            )}
            {formData?.id > 0 && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Documents:</Typography>
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
                    {allBorrowerOrGuarantorDocuments?.length > 0 ? (
                        allBorrowerOrGuarantorDocuments.map((doc) => (
                          <TableRow key={doc.id}>
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
                          <TableCell colSpan={16} align="center" sx={{ py: 3 }}>
                            No documents found for Borrower & Guarantor
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            {/* AGREEMENTS SECTION */}

            <Grid item xs={9}>
              <Typography variant="subtitle1" gutterBottom>
                Multi Facility Agreements Doc
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AddCircleOutline />}
                fullWidth
                onClick={() =>
                  setMultipleFacilityAgreementDoc([
                    ...allMultipleFacilityAgreementDoc,
                    {
                      FACILITY_AGREEMENT: {
                        dealerId: formData.id,
                        documentType: "FACILITY_AGREEMENT",
                        document: null,
                      },
                    },
                  ])
                }
              >
                Add Facility Doc
              </Button>
            </Grid>
            {allMultipleFacilityAgreementDoc.map(
              (facilityAgreemntDocItem, facilityDocIndex) => (
                <React.Fragment key={facilityDocIndex + "index"}>
                  <Grid
                    item
                    xs={12}
                    md={allMultipleFacilityAgreementDoc.length > 1 ? 11 : 12}
                  >
                  <Typography variant="body2" gutterBottom>
                    Facility Agreement
                  </Typography>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                    >
                      {facilityAgreemntDocItem.FACILITY_AGREEMENT?.document
                        ?.name ?? `Upload Facility Agreement  `}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          handleFacilityDocUpload(
                            e,
                            facilityDocIndex,
                            "FACILITY_AGREEMENT"
                          )
                        }
                      />
                    </Button>
                  </Grid>
                  {/* <Grid item xs={12} md={6}>
                    <TextField
                      type="date"
                      label="Date of Facility Agreement"
                      name="dateOfFacilityAgreement"
                      value={formData.dateOfFacilityAgreement}
                      onChange={handleChange}
                      fullWidth
                      required
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      error={!!formErrors.dateOfFacilityAgreement}
                      helperText={formErrors.dateOfFacilityAgreement}
                    />
                  </Grid> */}
                  {allMultipleFacilityAgreementDoc.length > 1 && (
                    <Grid
                      item
                      xs={12}
                      md={1}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <IconButton
                        onClick={() =>
                          handleRemoveFacilityDoc(facilityDocIndex)
                        }
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  )}
                </React.Fragment>
              )
            )}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Agreements
              </Typography>
            </Grid>
            {/* Facility Agreement */}

            {/* Personal Guarantee Agreement */}
            <Grid item xs={12} md={6}>
               <Typography variant="body2" gutterBottom>
                    Guarantee Agreement
                  </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                {formData.PERSONAL_GUARANTEE?.document?.name ??
                  `Upload Personal Guarantee Agreement`}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "PERSONAL_GUARANTEE")}
                />
              </Button>
            </Grid>

            {/* Sanction Letter */}
            <Grid item xs={12} md={6}>
               <Typography variant="body2" gutterBottom>
                    Sanction Letter
                  </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                {formData.SANCTION_LETTER?.document?.name ??
                  `Upload Sanction Letter`}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, "SANCTION_LETTER")}
                />
              </Button>
            </Grid>

            {/* Other Agreement */}

            {/* FINANCIAL DETAILS FORM FIELDS */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Financial Details
              </Typography>
            </Grid>
            {formSchemaROISanction.map((field) => (
              <Grid item xs={12} md={6} key={field.name}>
                {field?.type != "date" && (
                  <TextField
                    fullWidth
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name as keyof typeof formData] ?? 0}
                    variant="outlined"
                    onChange={handleChange}
                    onBlur={onFieldBlur}
                    size="small"
                  />
                )}
                {field?.type == "date" && (
                  <TextField
                    fullWidth
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name as keyof typeof formData] ?? 0}
                    variant="outlined"
                    onChange={handleChange}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: maxDate.toISOString().split("T")[0],
                    }}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Cheques Details Tab */}
        
        <TabPanel value={activeTab} index={4}>
        {cheques.map((c, i) => (
          <>
          <Grid container spacing={3} sx={{ mt: 2 }} key={i}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                Cheque Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
          
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel id="beneficiary-status-label">
                  Beneficiary Status
                </InputLabel>
                <Select
                  labelId="beneficiary-status-label"
                  name="beneficiaryStatus"
                  value={c.beneficiaryStatus}
                  onChange={(e) => handleChequeChange(i, "beneficiaryStatus", e.target.value  )}
                  label="Beneficiary Status"
                >
                  {beneficiaryStatusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.beneficiaryStatus && (
                  <FormHelperText error>
                    {formErrors.beneficiaryStatus}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
           
            

            <Grid item xs={12} md={6}>
              <TextField
                label="Beneficiary Name"
                name="beneficiaryName"
                value={cheques[i].beneficiaryName}
                onChange={(e) => handleChequeChange(i, e.target.name as keyof Cheque, e.target.value)}

                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                placeholder="Name Mentioned on Cheque"
                error={!!formErrors.beneficiaryName}
                helperText={formErrors.beneficiaryName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Cheque Number"
                name="chequeNumber"
                value={cheques[i].chequeNumber}
                onChange={(e) => handleChequeChange(i, e.target.name as keyof Cheque, e.target.value)}

                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                placeholder="Six digit cheque number"
                inputProps={{ maxLength: 6 }}
                error={!!formErrors.chequeNumber}
                helperText={formErrors.chequeNumber}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Account Number"
                name="accountNumber"
                value={cheques[i].accountNumber}
                onChange={(e) => handleChequeChange(i, e.target.name as keyof Cheque, e.target.value)}

                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                error={!!formErrors.accountNumber}
                helperText={formErrors.accountNumber}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="IFSC Code"
                name="ifscCode"
                value={cheques[i].ifscCode}
                onChange={(e) => handleChequeChange(i, e.target.name as keyof Cheque, e.target.value)}
                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                inputProps={{ maxLength: 11 }}
                error={!!formErrors.ifscCode}
                helperText={formErrors.ifscCode}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Date of Cheque Received"
                name="dateReceived"
                type="date"
                value={cheques[i].dateReceived?.split("T")[0] || ""}
                onChange={(e) => handleChequeChange(i, e.target.name as keyof Cheque, e.target.value)}

                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.dateReceived}
                helperText={formErrors.dateReceived}
                inputProps={{
                  max: maxDate.toISOString().split("T")[0],
                }}
              />
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <TextField
                label="Date of Cheque Handover"
                name="dateHandover"
                type="date"
                value={cheques[i].dateHandover?.split("T")[0] || ""}
                onChange={(e) => handleChequeChange(i, e.target.name as keyof Cheque, e.target.value)}

                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.dateHandover}
                helperText={formErrors.dateHandover}
                inputProps={{
                  max: maxDate.toISOString().split("T")[0],
                }}
              />
            </Grid> */}

            {/* <Grid item xs={12} md={6}>
              <TextField
                label="Date of Cheque Handover"
                name="dateOfChequeHandover"
                type="date"
                value={formData.dateOfChequeHandover?.split("T")[0] || ""}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.dateOfChequeHandover}
                helperText={formErrors.dateOfChequeHandover}
                 inputProps={{
                      max: maxDate.toISOString().split("T")[0],
                    }}
              />
            </Grid> */}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel id="cheque-location-label">
                  Location of Cheque
                </InputLabel>
                <Select
                  labelId="cheque-location-label"
                  name="location"
                  value={cheques[i].location}
                  onChange={(e) => handleChequeChange(i, e.target.name as keyof Cheque, e.target.value)}

                  label="Location of Cheque"
                >
                  {chequeLocationOptions.map((locationItem) => (
                    <MenuItem key={locationItem.id} value={locationItem?.name}>
                      {locationItem?.name}
                    </MenuItem>
                  ))}
                </Select>
                {!!formErrors.locationOfCheque && (
                  <FormHelperText error>
                    {formErrors.locationOfCheque}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel id="enach-label">E-Nach</InputLabel>
                <Select
                  labelId="enach-label"
                  name="isENach"
                  value={cheques[i].isENach}
                  onChange={(e) => handleChequeChange(i, e.target.name as keyof Cheque, e.target.value)}

                  label="E-Nach"
                >
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
                {!!formErrors.isENach && (
                  <FormHelperText error>{formErrors.isENach}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/*when e-natch is yes then show below fields */}
            {cheques[i].isENach === true && (
              <>
             <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel id="enach-label">Account Type</InputLabel>
                <Select
                  labelId="enach-label"
                  name="accountType"
                  value={cheques[i].accountType}
                  onChange={(e) => handleChequeChange(i, e.target.name as keyof Cheque, e.target.value)}

                  label="Account Type"
                >
                  <MenuItem value="Saving">Saving</MenuItem>
                  <MenuItem value="Current">Current</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {!!formErrors.accountType && (
                  <FormHelperText error>{formErrors.accountType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel id="enach-label">Mandate Type</InputLabel>
                <Select
                  labelId="enach-label"
                  name="mandateType"
                  // value={formData.accountType}
                  onChange={handleSelectChange}
                  label="Mandate Type"
                >
                  <MenuItem value="Fixed">Fixed</MenuItem>
                  <MenuItem value="Variable">Variable</MenuItem>
                </Select>
                {!!formErrors.mandateType && (
                  <FormHelperText error>{formErrors.mandateType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel id="enach-label">Frequency</InputLabel>
                <Select
                  labelId="enach-label"
                  name="frequency"
                  // value={formData.accountType}
                  onChange={handleSelectChange}
                  label="Frequency"
                >   <MenuItem value="OneTime">One Time</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
               
                  <MenuItem value="AsPresented">As presented</MenuItem>
                </Select>
                {!!formErrors.frequency && (
                  <FormHelperText error>{formErrors.frequency}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Amount to be Debited"
                name="amountToBeDebited"
                // value={formData.amountToBeDebited}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                inputProps={{ maxLength: 11 }}
                error={!!formErrors.amountToBeDebited}
                helperText={formErrors.amountToBeDebited}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Start Date of Mandate"
                name="startDateOfMandate"
                type="date"
                // value={formData.startDateOfMandate?.split("T")[0] || ""}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.startDateOfMandate}
                helperText={formErrors.startDateOfMandate}
                inputProps={{
                  max: maxDate.toISOString().split("T")[0],
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="End Date of Mandate"
                name="endDateOfMandate"
                type="date"
                // value={formData.endDateOfMandate?.split("T")[0] || ""}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.dateOfChequeReceived}
                helperText={formErrors.dateOfChequeReceived}
                inputProps={{
                  max: maxDate.toISOString().split("T")[0],
                }}
              />
            </Grid>
              </>
            )}

            <Grid item xs={6}>
               <Typography variant="body2" gutterBottom>
                    Cheque Image
                  </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
                fullWidth
              >
                Upload Cheque Copy
                <input
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.pdf"
                
                />
              </Button>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Remarks"
                name="remarks"
                value={cheques[i].remarks}
                onChange={(e) => handleChequeChange(i, e.target.name as keyof Cheque, e.target.value)}

                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                multiline
                rows={2}
                placeholder="Any additional notes or comments"
              />
            </Grid>
           
          </Grid>
          <Grid item xs={12}>
                      <Button color="error" onClick={() => removeCheque(i)}>
                        Remove Cheque
                      </Button>
                    </Grid>
                    </>
        ))}



        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setCheques([
                ...cheques,
                {
                  dealerId: formData.id,
                  beneficiaryStatus: "",
                  beneficiaryName: "",
                  chequeNumber: "",
                  accountNumber: "",
                  ifscCode: "",
                  dateOfChequeReceived: "",
                  dateOfChequeHandover: "",
                  locationOfCheque: "",
                  isENach: "",
                  chequeRemarks: "",
                  attachmentUrl: "",
                  uploadedDocumentIndex: 0,
                },
              ]);
            }}
            sx={{ mt: 2 }}
          >
            Add New Cheque
          </Button>
        </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <Grid container spacing={3}>
            {/* Section Title */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Security Deposit Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This section displays Security Deposit information.
              </Typography>
            </Grid>

            {/* Security Deposit Status */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Security Deposit Status"
                fullWidth
                variant="outlined"
                name="securityDepositStatus"
                placeholder="Collected / Not Collected"
                size="small"
                value={formData.securityDepositStatus}
                onChange={handleChange}
                error={!!formErrors.securityDepositStatus}
                helperText={formErrors.securityDepositStatus}
              />
            </Grid>

            {/* Amount of Security Deposit */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Amount of Security Deposit (₹)"
                fullWidth
                variant="outlined"
                name="amountOfSecurityDeposit"
                placeholder="Enter amount"
                type="number"
                size="small"
                value={formData.amountOfSecurityDeposit}
                onChange={handleNumberChange}
                error={!!formErrors.amountOfSecurityDeposit}
                helperText={formErrors.amountOfSecurityDeposit}
              />
            </Grid>

            {/* UTR Number */}
            <Grid item xs={12} md={6}>
              <TextField
                label="UTR Number of Security Deposit"
                fullWidth
                variant="outlined"
                name="utrOfsecurityDeposit"
                placeholder="Enter UTR number"
                size="small"
                value={formData.utrOfsecurityDeposit}
                onChange={handleChange}
                error={!!formErrors.utrOfsecurityDeposit}
                helperText={formErrors.utrOfsecurityDeposit}
              />
            </Grid>

            {/* Date of Security Deposit Received */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Date of Security Deposit Received"
                fullWidth
                type="date"
                name="dateOfSecurtyDepositReceived"
                InputLabelProps={{ shrink: true }}
                size="small"
                value={
                  formData.dateOfSecurtyDepositReceived?.split("T")[0] || ""
                }
                onChange={handleChange}
                error={!!formErrors.dateOfSecurtyDepositReceived}
                helperText={formErrors.dateOfSecurtyDepositReceived}
                inputProps={{
                  max: maxDate.toISOString().split("T")[0],
                }}
              />
            </Grid>

            {/* Date of Security Deposit Refunded */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Date of Security Deposit Refunded"
                fullWidth
                type="date"
                name="dateOfSecurtyDepositRefunded"
                InputLabelProps={{ shrink: true }}
                size="small"
                value={
                  formData.dateOfSecurtyDepositRefunded?.split("T")[0] || ""
                }
                onChange={handleChange}
                error={!!formErrors.dateOfSecurtyDepositRefunded}
                helperText={formErrors.dateOfSecurtyDepositRefunded}
                inputProps={{
                  max: maxDate.toISOString().split("T")[0],
                }}
              />
            </Grid>

            {/* UTR Attachment Upload */}
            {/* <Grid item xs={12} md={6}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Upload UTR Attachment
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </Button>
              <Typography variant="caption" display="block">
                Upload softcopy of the UTR document.
              </Typography>
            </Grid> */}

            <Grid item xs={12} md={6}>
              <TextField
                label="Remarks"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="securityDesoiteremarks"
                placeholder="Enter any remarks"
                value={formData.securityDesoiteremarks}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Financial Information Section - Shown regardless of active tab */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3, display: "none" }}>
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                Financial Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* ROI & Delay ROI */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Rate of Interest (%)"
                name="roi"
                type="number"
                value={formData.roi}
                onChange={handleNumberChange}
                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                error={!!formErrors.roi}
                helperText={formErrors.roi}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Delay Rate of Interest (%)"
                name="delayROI"
                type="number"
                value={formData.delayROI}
                onChange={handleNumberChange}
                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                error={!!formErrors.delayROI}
                helperText={formErrors.delayROI}
              />
            </Grid>

            {/* Sanction Amount */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Sanction Amount"
                name="sanctionAmount"
                type="number"
                value={formData.sanctionAmount}
                onChange={handleNumberChange}
                fullWidth
                variant="outlined"
                margin="dense"
                size="small"
                InputProps={{
                  inputProps: { min: 0 },
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                error={!!formErrors.sanctionAmount}
                helperText={formErrors.sanctionAmount}
              />
            </Grid>

            {/* Additional Financial Fields for Edit Mode */}
            {mode === "edit" && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Available Limit"
                    name="availableLimit"
                    type="number"
                    value={formData.availableLimit}
                    onChange={handleNumberChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    size="small"
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Outstanding Amount"
                    name="outstandingAmount"
                    type="number"
                    value={formData.outstandingAmount}
                    onChange={handleNumberChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    size="small"
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Waiver Amount"
                    name="waiverAmount"
                    type="number"
                    value={formData.waiverAmount}
                    onChange={handleNumberChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    size="small"
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Utilization Percentage"
                    name="utilizationPercentage"
                    type="number"
                    value={formData.utilizationPercentage}
                    onChange={handleNumberChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    size="small"
                    InputProps={{
                      inputProps: { min: 0, max: 100, step: 0.01 },
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Principal Outstanding"
                    name="principalOutstanding"
                    type="number"
                    value={formData.principalOutstanding}
                    onChange={handleNumberChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    size="small"
                    InputProps={{
                      inputProps: { min: 0 },
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Overdue Count"
                    name="overdueCount"
                    type="number"
                    value={formData.overdueCount}
                    onChange={handleNumberChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    size="small"
                    InputProps={{
                      inputProps: { min: 0 },
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, my: 3 }}>
        {activeTab == 0   && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleSaveTabData();
            }}
            disabled={isSubmitting}
          >
            Save & Next
          </Button>
        )}
        {activeTab == 1 && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSaveTabData()}
              disabled={isSubmitting}
            >
              Save
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSaveAndChangeStatus()}
              disabled={isSubmitting}
            >
              Submit
            </Button>
          </>
        )}
        {activeTab == 2 && (
          <>
          
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSaveAndChangeStatus()}
              disabled={isSubmitting}
            >
              Submit
            </Button>
            <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleSaveAndChangeStatus();
            
            }}
            disabled={isSubmitting}
          >
            Save & Next
          </Button>
            {/* <Button
              variant="contained"
              color="primary"
              onClick={() => handleNextTabBasisOnPermission()}
            >
              Next
            </Button> */}
          </>
        )}
        {activeTab == 5 && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSaveTabData()}
          >
            Save
          </Button>
        )}

        {activeTab == 3 && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSaveTabData()}
              disabled={isSubmitting}
            >
              Save
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={isSubmitting}
            >
              Approve
            </Button>
            <NgIf condition={formData.status != 'Approved'}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setRejectedFormData({
                    rejectedReason: "",
                  });
                  setIsRejectModalOpen(true);
                }}
                disabled={isSubmitting}
              >
                Reject
              </Button>
            </NgIf>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleNextTabBasisOnPermission()}
            >
              Next
            </Button>
          </>
        )}

        {activeTab != 5 &&
          activeTab != 3 &&
          activeTab != 0 &&
          activeTab != 1 &&
          activeTab != 2 && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSaveTabData()}
                disabled={isSubmitting}
              >
                Save
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleNextTabBasisOnPermission()}
              >
                Next
              </Button>
            </>
          )}
      </Box>
      <Dialog
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
      >
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            Reject
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                type="number"
                value={rejectedFormData.rejectedReason}
                onChange={(e) =>
                  handleRejectFormInputChange("rejectedReason", e.target.value)
                }
                required
                size="small"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setIsRejectModalOpen(false)}
          >
            Close
          </Button>

          <Button
            onClick={() => handleRejectDialog()}
            color="primary"
            variant="contained"
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      >
        <DialogTitle>
          <Typography sx={{ fontSize: "16px" }}>
            Do you want to confirm ?
            {/* <b>
              {activeTab < 5
                ? dealerStatusListAsMessage[activeTab].name
                : isActive
                ? "Active"
                : "Inactive"}
            </b>{" "} */}
            ?
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
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default DealerOnboardingPage;
