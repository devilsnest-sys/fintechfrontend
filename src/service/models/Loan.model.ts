import { Dealer } from './Dealer.model';

export interface VehicleInfo {
  id: number;
  loanId:number;
  make: string;
  model: string;
  registrationNumber: string;
  year: number;
  chassisNumber: string;
  engineNumber: string;
  value: number;
}

export interface BuyerInfo {
  id: number;
  loanId:number;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  identificationType: string;
  identificationNumber: string;
  buyerSource: string;
}

export interface LoanDocumentUpload{
  loanId: number ;
  documentType: string;
  document: File | null;
};
export interface LoanInterface {
  id: number;
  loanNumber: string;
  dateOfWithdraw: string|null;
  amount: number;
  interestRate: number;
  dealerId: number;
  dealer?:Dealer;
  utrNumber?: string;
  processingFee: number;
  dueDate?: string|null;
  isActive: boolean;
  createdDate: string;
  vehicleInfo: VehicleInfo;
  attachments: string[];
  invoiceNumber:string;
  invoiceDate:string|null;
  purchaseSource:string;
  gstOnProcessingFee:number;
  interestWaiver:number;
  settledDate:string|null;
  delayedROI:number;
  processingFeeReceivedDate:string|null;
  status?:string;
  loanDetailId?:number;
}

export interface Waiver{
  principalAmount:number;
  interest:number;
  delayedInterest:number;
}

export interface LoanTransactionInterface {
  loanId:number;
  id:number;
  paidDate: string; // common field
  amountPaid: number; // common field
  paymentMode:string; // common field
  countryCode:string; // common field
  mobileNo:string;  // common field
  remarks:string; // common field
  depositBank:string;
  depositAccountNo:string;
  transactionId:string;
  sourceBank:string;
  sourceBranch:string;
  modeOfTransfer:string;
  chequeNumber:string;
  chequeIssueDate:string;
  chequedrawnOnBank:string;
  status?:string

}

 export interface LoanCalculatorInterface {
  loanId: number;
  disbursedAmount: number;
  principalReceived: number;
  outstandingPrincipal: number;
  totalInstallmentReceived: number;
  regularInterestReceived: number;
  delayInterestReceived: number;
  processingFee: number;
  paidProcessingFee: number;
  gst: number;
  totalProcessingFeeWithGST: number;
  processingFeeOutstanding: number;
  installments: LoanTransactionInterface[];
  accruedRegularInterest:number;
  accruedDelayInterest:number;
  waivedDelayInterest:number 
  waivedInterest:number
  waivedPrincipal:number
  waivedProcessingFee:number
}


export interface LoanFilter {
  dealerId?: number;
  isActive?: boolean;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface DashboardSummaryInterface {
  UtilizationPercent: number;
  totalInterestEarned: number;
  dealerId: string | null;
  dealershipName: string;
  totalSanctionLimit: number;
  totalLoanAmount: number;
  totalPrincipalPaid: number;
  availableLimit: number;
  totalAmountPending: number;
  totalWaiversAmount: number;
}