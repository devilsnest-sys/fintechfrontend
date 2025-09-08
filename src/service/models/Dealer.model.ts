import { statusName } from "./Ddr.model";

export interface Dealer {
  id: number;
  dealerCode: string;
  loanProposalNo: string;
  dealershipName: string;
  dealershipPAN: string;
  status: string;
  dateOfOnboarding: string; // ✅ Newly added, required
  dateOfIncorporation: string | null;
  dateOfFacilityAgreement: string | null;
  agreementDate: string | null;
  agreementExpiryDate: string | null;
  parkingAgreementDate: string | null;
  parkingAgreementExpiryDate: string | null;
  parkingStatus: string;
  officeStatus: string;

  entity: string;
  gstNo: string;
  gstRegStatus: string; // ✅ Newly added
  msmeRegistrationNo: string;
  msmeType: string;
  msmeStatus?: string;
  businessCategory?: string;
  businessType?: string;

  contactNo: string;
  alternativeContactNo: string;
  emailId: string;
  alternativeEmailId: string;

  shopAddress: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  parkingYardAddress: string;
  parkingYardPinCode: string;
  parkingYardState: string;
  parkingYardCity: string;
  relationshipManagerId: number;
  isActive: boolean;
  registeredDate: string;

  // Financial Fields
  roi?: number;
  roiPerLakh?: number;
  delayROI?: number;
  totalSanctionLimit?: number;
  processingFee?: number;
  processingCharge?: number;
  gstOnProcessingCharge?: number;
  documentationCharge?: number;
  gstOnDocCharges?: number;

  sanctionAmount?: number;
  availableLimit?: number;
  outstandingAmount?: number;
  overdueCount?: number;
  documentStatus?: number;
  stockAuditStatus?: number;
  principalOutstanding?: number;
  pfReceived?: number;
  interestReceived?: number;
  delayInterestReceived?: number;
  amountReceived?: number;
  pfAcrued?: number;
  interestAccrued?: number;
  delayInterestAccrued?: number;
  waiverAmount?: number;
  utilizationPercentage?: number;
  userId?: number;
  rejectionReason?: string;
  cibilOfEntity?: number;

  // Borrower
  borrowerDetails: DealerOnboardingBorrowerOrGuarantor[];

  documentUploads?: DealerDocumentListInterface[]; // Added for document uploads

  // Guarantor
  guarantorDetails: DealerOnboardingBorrowerOrGuarantor[];

  // Cheque
  chequeDetails: DealerOnboardingCheque[];
  beneficiaryStatus?: string;
  beneficiaryName?: string;
  chequeNumber?: string;
  accountNumber?: string;
  ifscCode?: string;
  dateOfChequeReceived?: string;
  dateOfChequeHandover?: string;
  locationOfCheque?: string;
  isENach?: string;
  chequeRemarks?: string;
  attachmentUrl?: string;

  // Security Deposit
  securityDepositStatus?: string;
  amountOfSecurityDeposit?: number;
  utrOfsecurityDeposit?: string;
  dateOfSecurtyDepositReceived?: string;
  dateOfSecurtyDepositRefunded?: string;
  securityDesoiteremarks?: string;
  securityDepositDetails: DealerOnboardingSecurityDeposite[]; // Uncommented and typed properly
}
export interface AddOrUpdateDealerInterFace extends Dealer {
  // Basic dealer info
  gstNo: string;
  gstRegStatus: string;
  msmeRegistrationNo: string;
  msmeType: string;
  msmeStatus: string;
  businessCategory: string;
  businessType: string;
  entity: string;
  contactNo: string;
  alternativeContactNo: string;
  emailId: string;
  alternativeEmailId: string;
  shopAddress: string;
  parkingYardAddress: string;
  parkingYardPinCode: string;
  parkingYardState: string;
  parkingYardCity: string;
  shopCity: string;
  shopState: string;
  shopPinCode: string;
  officeStatus: string;
  agreementDate: string | null;
  agreementExpiryDate: string | null;
  parkingStatus: string;
  parkingAgreementDate: string | null;
  parkingAgreementExpiryDate: string | null;
  dateOfOnboarding: string;
  dateOfIncorporation: string | null;
  dateOfFacilityAgreement: string | null;
  cibilOfEntity: number;

  roiPerLakh: number;
  delayROI: number;
  processingFee: number;
  processingCharge: number;
  gstOnProcessingCharge: number;
  documentationCharge: number;
  gstOnDocCharges: number;
  totalSanctionLimit: number;
  relationshipManagerId:number;
  status: string;
  rejectionReason: string;
  isActive: boolean;
  registeredDate: string;
  userId: number;
  securityDepositAttachmentUrl: string;

  // Borrower Info
  borrowerDetails: DealerOnboardingBorrowerOrGuarantor[];

  // Guarantor Info
  guarantorDetails: DealerOnboardingBorrowerOrGuarantor[];

  // Cheque Info
  chequeID: number;
  beneficiaryStatus?: string;
  beneficiaryName?: string;
  chequeNumber?: string;
  accountNumber?: string;
  ifscCode?: string;
  dateOfChequeReceived?: string;
  dateOfChequeHandover?: string;
  locationOfCheque?: string;
  isENach?: string;
  chequeRemarks?: string;
  chequeDetails: DealerOnboardingCheque[];

  // Security Deposit
  securityID: number;
  securityDepositStatus?: string;
  amountOfSecurityDeposit: number;
  utrOfsecurityDeposit?: string;
  dateOfSecurtyDepositReceived?: string;
  dateOfSecurtyDepositRefunded?: string;
  securityDesoiteremarks: string;
  securityDepositDetails: DealerOnboardingSecurityDeposite[];
  PERSONAL_GUARANTEE: DealerDocumentUpload;
  SANCTION_LETTER: DealerDocumentUpload;
  DEALERSHIP_PAN: DealerDocumentUpload;
  BORROWER_PAN: DealerDocumentUpload;
  GST_CERTIFICATE: DealerDocumentUpload;
  REGISTRATION_CERTIFICATE: DealerDocumentUpload;
  ADDRESS_PROOF: DealerDocumentUpload;
  ITR: DealerDocumentUpload;

  guarantor_PAN: DealerDocumentUpload;
  guarantor_GST_CERTIFICATE: DealerDocumentUpload;
  guarantor_REGISTRATION_CERTIFICATE: DealerDocumentUpload;
  guarantor_ADDRESS_PROOF: DealerDocumentUpload;
  guarantor_ITR: DealerDocumentUpload;
  // borrower_PAN: DealerDocumentUpload;
  // borrower_GST_CERTIFICATE: DealerDocumentUpload;
  // borrower_REGISTRATION_CERTIFICATE: DealerDocumentUpload;
  // borrower_ADDRESS_PROOF: DealerDocumentUpload;
  // proprietor_PAN: DealerDocumentUpload;
  // proprietor_GST_CERTIFICATE: DealerDocumentUpload;
  // proprietor_REGISTRATION_CERTIFICATE: DealerDocumentUpload;
  // proprietor_ADDRESS_PROOF: DealerDocumentUpload;
}
export interface DealerOnboardingBorrowerOrGuarantor {
  id: number;
  dealerId: number;
  name: string;
  pan: string;
  dateOfBirth: string;
  fatherName: string;
  mobileNumber: string;
  email: string;
  cibilScore: number;
  relationshipWithEntity: string;
  relationshipWithBorrower: string;
  currentAddress: string;
  permanentAddress: string;
  attachmentPath: string;
  personType: string;
  addressStatus: string;
  aadharNo: string;
  addressAgreementDate: string;
  addressAgreementExpiryDate: string;
  borrowerCCity: string;
  borrowerPCity: string;
  borrowerCState: string;
  borrowerPState: string;
  borrowerCPinCode: string;
  borrowerPPincode: string;
  guarantorCCity: string;
  guarantorPCity: string;
  guarantorCState: string;
  guarantorPState: string;
  guarantorCPinCode: string;
  guarantorPPincode: string;

  borrowerPCityList?: DealerMastersApiResInterface[];
  borrowerCCityList?: DealerMastersApiResInterface[];
  
  guarantorPCityList?: DealerMastersApiResInterface[];
  guarantorCCityList?: DealerMastersApiResInterface[];

}

export interface BorrowOrGurantorFormErrors {
  borrowers?: Array<{
    personType: string;
    aadharNo: string;
    // name: string;
    // pan: string;
    // dateOfBirth: string;
    addressAgreementDate: string;
    addressAgreementExpiryDate: string;
    mobileNumber: string;
  }>;
  gurantor?: Array<{
    personType: string;
    aadharNo: string;
    // name: string;
    // pan: string;
    // dateOfBirth: string;
    addressAgreementDate: string;
    addressAgreementExpiryDate: string;
    mobileNumber: string;
    guarantorPState: string;
  }>;
}

export interface DealerOnboardingCheque {
  id: number;
  dealerId: number;
  beneficiaryStatus: string;
  beneficiaryName: string;
  location: string;
  chequeNumber: string;
  accountNumber: string;
  ifscCode: string;
  dateReceived: string | null;
  dateHandover: string | null;
  // locationOfCheque: string;
  attachmentUrl: string;
  isENach: boolean;
  isENachValue: string;
  chequeRemarks: string;
  remarks: string;
}
export interface DealerOnboardingSecurityDeposite {
  id: number;
  dealerId: number;
  status: string;
  amount: number;
  utrNumber: string;
  dateReceived: string | null; // ISO string date
  dateRefunded: string | null; // ISO string date
  cibilOfEntity: string;
  totalSanctionLimit: number;
  roi: number;
  roiPerLakh: number;
  delayroiPerLakh: number;
  delayROI: number;
  processingFee: number;
  processingCharge: number;
  gstOnProcessingCharge: number;
  documentationCharge: number;
  agreementDate:string|null;
  gstOnDocCharges: number;
  rejectionReason: string;
  isActive: boolean;
  registeredDate: string; // ISO string date
  attachmentUrl: string;
  remarks: string;
}

export interface DealerChangeStatus {
  dealerId: number;
  newStatus: number;
  rejectionReason?: string;
}
export interface RejectedDealerFormInterface {
  rejectedReason: string;
}

export interface Borrower {
  id: number;
  dealerId: number;
  name: string;
  pan: string;
  dateOfBirth: string;
  mobileNumber: string;
  email: string;
  fatherName: string;
  relationshipWithEntity: string;
  currentAddress: string;
  permanentAddress: string;
  cibilScore: number;
  attachmentPath: string;
  aadharNo: string;
  personType: string;
  addressStatus: string;
  addressAgreementDate: string;
  addressAgreementExpiryDate: string;
  borrowerCCity: string;
  borrowerPCity: string;
  borrowerCState: string;
  borrowerPState: string;
  borrowerCPinCode: string;
  borrowerPPincode: string;

  borrowerPCityList?: DealerMastersApiResInterface[];
  borrowerCCityList?: DealerMastersApiResInterface[];

  Pan_Card: DealerDocumentUpload;
  Registration_Certificate: DealerDocumentUpload;
  Gst_Certificate: DealerDocumentUpload;
  Address_Proof: DealerDocumentUpload;
  ITR: DealerDocumentUpload;
}

export interface Guarantor {
  id: number;
  dealerId: number;
  name: string;
  pan: string;
  dateOfBirth: string;
  mobileNumber: string;
  email: string;
  fatherName: string;
  currentAddress: string;
  permanentAddress: string;
  cibilScore: number;
  attachmentPath: string;
  aadharNo: string;
  personType: string;
  addressStatus: string;
  relationshipWithBorrower: string;
  addressAgreementDate: string;
  addressAgreementExpiryDate: string;
  guarantorCCity: string;
  guarantorPCity: string;
  guarantorCState: string;
  guarantorPState: string;
  guarantorCPinCode: string;
  guarantorPPincode: string;

  guarantorPCityList?: DealerMastersApiResInterface[];
  guarantorCCityList?: DealerMastersApiResInterface[];
  Pan_Card: DealerDocumentUpload;
  Gst_Certificate: DealerDocumentUpload;
  Registration_Certificate: DealerDocumentUpload;
  Address_Proof: DealerDocumentUpload;
  ITR: DealerDocumentUpload;
}

export interface Cheque {
  isENachValue: string; 
  locationOfCheque: unknown;
  chequeRemarks: unknown;
  id: number,
  dealerId: number,
  beneficiaryStatus: string,
  beneficiaryName: string,
  chequeNumber: string,
  accountNumber: string,
  ifscCode: string,
  dateReceived: string,
  dateHandover: string,
  location: string,
  attachmentUrl: string,
  isENach: boolean,
  accountType: string,
  mandateType: string,
  maxDebitAmount: number,
  mandateAmount: number,
  frequency: string,
  mandateStartDate: string,
  mandateEndDate: string,
    remarks: string,
    Cheque_Image: DealerDocumentUpload;
}


export type DealerDocumentUpload = {
  dealerId: number | string;
  documentType: string;
  document: File | null;
};

export type MultipleFaclityAgreemntDocInterface = {
  FACILITY_AGREEMENT: DealerDocumentUpload;
};

export interface DealerDocumentListInterface {
  id?: number;
  fileName?: string;
  documentType: string;
  uploadedOn: string;
  filePath: string;
  dealerId?:number;
}

export const dealerStatusList: statusName[] = [
  { name: "Pending" },
  { name: "PendingOnboarding" },
  { name: "Approved" },
  { name: "Active" },
  { name: "Inactive" },
  { name: "Rejected" },
  { name: "KYC Completed" },
];


export const dealerStatusCountsList: {name:string,value:string,permissionList:string[]}[] = [
   
  { name: "Pending",value:'Pending', permissionList:['Pending QUEUE'] },
  { name: "Onboarding Request",value:'PendingOnboarding',permissionList:['Onboarding Request QUEUE']   },
  { name: "KYC Completed",value:'KYCCompleted',permissionList:['KYC Completed QUEUE']   },
  { name: "Approved",value:'Approved',permissionList:['Approved QUEUE']   },
  { name: "Active",value:'Active',permissionList:['Active QUEUE']   },
  { name: "Inactive",value:'Inactive',permissionList:['Inactive QUEUE']   },
  { name: "Rejected",value:'Rejected',permissionList:['Rejected QUEUE']   },
  { name: "Total",value:'',permissionList:['Manage Dealers'] },
];

export const dealerStatusListAsMessage: statusName[] = [
  { name: "Pending" },
  { name: "PendingOnboarding" },
  { name: "KYC Completed" },
  { name: "Approved" },
  { name: "Active" },
  { name: "Inactive" },
  
  
];

export interface DealerMastersApiResInterface{
  id:number;
  name:string;
}