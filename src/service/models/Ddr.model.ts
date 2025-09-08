
import { VehicleInfo } from "./Loan.model";
import { Dealer } from "./Dealer.model";

export interface DdrInterface {
  id: number;
  ddrNumber:string;
  dateOfWithdraw: string|null;
  amount: number;
  bidAmount: number;
  interestRate: number;
  dealerId: number;
  utrNumber?: string;
  processingFee?: number;
  selectedProcessingFee?: number;
  suggestedProcessingFee?: number;
  dueDate: string|null;
  isActive: boolean;
  createdDate?: string;
  vehicleInfo: VehicleInfo;
  attachments: string[];
  invoiceNumber: string;
  invoiceDate: string | null;
  purchaseSource: string;
  gstOnProcessingFee?: number;
  interestWaiver?: number;
  settledDate?: string | null;
  processingFeeReceivedDate?: string | null;
  dealer?:Dealer
  delayedROI:number
  loanNumber?: string;
  status?:number;
  rejectedReason?:string
  approvalDate?:string;
  documentUpload?:DdrDocumentListInterface[]
  totalAvailableLimit?:number;
}

export interface DdrApproveAndRejectInterface{
  disbursementAmount?: number;
  interestCharge?: number;
  processingFee?: number;
  processingFeeWithGST?: number;
  gst?:number
  totalPayableAmount?: number;
  rejectRemakrs?:string
  roi?:number;
  delayROI?:number;
}


export interface DdrFilter {
  dealerId?: number;
  isActive?: boolean;
  searchKey?:string;
}

export interface DdrMastersApiResInterface{
  id:number;
  name:string;
}

export interface DdrPurchaseByDocumentListInterface{
  id:number;
  documentName:string;
  purchaseSourceId:number;
  document:File|null,
  is_mandatory:boolean;
  uploadedDoc?:DdrDocumentListInterface|null
}

export interface DdrDocumentListInterface {
  id?: number;
  fileName?: string;
  documentType: string;
  uploadedOn: string;
  filePath: string;
  dealerId?:number;
}

export interface DdrListingProps {
  dealerId?: number;
}
export interface statusName {
  name: string;
}
export const ddrStatusList: statusName[] = [
  { name: "Pending Approval" },
  { name: "Pending Disbursement" },
  { name: "Hold" },
  { name: "Rejected" },
  { name: "Approved" },
  { name: "Processed" },
];

export const ddrStatusCountsList: {name:string,value:number,permissionList:string[]}[] = [
  
  { name: "Pending Approval",value:0,permissionList:['Pending Approval DDR QUEUE']  },
  { name: "Approved",value:4,permissionList:['Approved DDR QUEUE']  },
  { name: "Rejected",value:3,permissionList:['Rejected DDR QUEUE']  },
  { name: "Processed Disbursement",value:5,permissionList:['Disbursement Processed DDR QUEUE']  },
  { name: "Total",value:-1,permissionList:['Manage DDR'] },
];