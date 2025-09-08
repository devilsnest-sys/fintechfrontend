import { LoanInterface } from "./Loan.model";

export interface PaymentsInterface {
  id: number;
  loanId: number;
  loan:LoanInterface;
  paidDate: string; 
  amountPaid: number;
  remarks: string;
  status: "Pending" | "Approved" | "Rejected"; 
  createdAt: string;
}

