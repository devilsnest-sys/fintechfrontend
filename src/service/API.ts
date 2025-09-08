import axios from "axios";
import {
  DdrApproveAndRejectInterface,
  DdrDocumentListInterface,
  DdrFilter,
  DdrInterface,
  DdrMastersApiResInterface,
  DdrPurchaseByDocumentListInterface,
} from "./models/Ddr.model";
import {
  AddOrUpdateDealerInterFace,
  Dealer,
  DealerChangeStatus,
  DealerDocumentListInterface,
  DealerDocumentUpload,
  DealerMastersApiResInterface,
} from "./models/Dealer.model";
import {
  DashboardSummaryInterface,
  LoanCalculatorInterface,
  LoanDocumentUpload,
  LoanFilter,
  LoanInterface,
  LoanTransactionInterface,
} from "./models/Loan.model";
import {
  AddOrUpdateRepresentativeData,
  Representative,
} from "./models/Representative.model";
import { AddOrUpdateRole, Roles } from "./models/Roles.model";
import {
  PermissionsList,
  PermissionWithRoleName,
  UpdatePermissionWithRoleId,
} from "./models/Permission.model";
import { PaymentsInterface } from "./models/Payments.model";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://traverseb2b.traversia.net";
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "text/plain",
  },
});
axiosInstance.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    if (user) {
      const { token } = JSON.parse(user);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const APIService = {
  getDashboardSummary: async (dealerId: string = "All"): Promise<DashboardSummaryInterface> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Dashboard/summary?dealerId=${dealerId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getAllDdrs: async (): Promise<DdrInterface[]> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/api/Ddr`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDdrById: async (id: number): Promise<DdrInterface> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/api/Ddr/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createDdr: async (ddrData: DdrInterface): Promise<DdrInterface> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/Ddr`,
        ddrData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateDDR: async (
    id: number,
    ddrData: Partial<DdrInterface>
  ): Promise<DdrInterface> => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/api/Ddr/${id}`,
        ddrData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDdrDocumentsById: async (
    ddrId: number
  ): Promise<DdrDocumentListInterface[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/DDRDocumentUpload/by-ddr/${ddrId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  filterDdrs: (ddrs: DdrInterface[], filters: DdrFilter): DdrInterface[] => {
    return ddrs.filter((ddr) => {
      // Filter by dealer ID
      if (filters.dealerId !== undefined && ddr.dealerId !== filters.dealerId) {
        return false;
      }

      // Filter by active status
      if (filters.isActive !== undefined && ddr.isActive !== filters.isActive) {
        return false;
      }

      // if (filters.searchKey !== undefined && !ddr.toLowerCase().includes(filters.searchKey)) {
      //   return false;
      // }

      // Filter by min amount
      // if (filters.minAmount !== undefined && ddr.amount < filters.minAmount) {
      //   return false;
      // }

      // // Filter by max amount
      // if (filters.maxAmount !== undefined && ddr.amount > filters.maxAmount) {
      //   return false;
      // }

      // // Filter by date range
      // if (filters.fromDate && new Date(ddr.dateOfWithdraw) < new Date(filters.fromDate)) {
      //   return false;
      // }

      // if (filters.toDate && new Date(ddr.dateOfWithdraw) > new Date(filters.toDate)) {
      //   return false;
      // }

      return true;
    });
  },
  changeStatus: async (
    ddrId: number,
    status: string,
    reason: string
  ): Promise<DdrInterface[]> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/Ddr/${ddrId}/${status}`,
        status == "reject" ? { reason: reason } : null
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateDdrStatusChanged: async (
    ddrId: number,
    status: number
  ): Promise<DdrInterface[]> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/Ddr/update-status`,
        {
          ddrId: ddrId,
          status: status,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getApproveLoanCalculateData: async (
    ddrCalculation: any
  ): Promise<DdrApproveAndRejectInterface> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/LoanForecast/preview`,
        ddrCalculation
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDDrNo: async (): Promise<{ ddrNumber: "" }> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Ddr/generate-ddr-number`,
        {
          headers: {
            Accept: "text/plain",
          },
        }
      );
      // debugger;
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  uploadMultiPleDdrDoc: async (
    ddrId: number,
    documents: DdrPurchaseByDocumentListInterface[]
  ): Promise<any> => {
    try {
      const formDataPayload = new FormData();

      documents.forEach((doc, index) => {
        if (doc.document) {
          formDataPayload.append(`documents[${index}].id`, (doc?.uploadedDoc?.id??0).toString());
          formDataPayload.append(`documents[${index}].ddrId`, ddrId.toString());
          formDataPayload.append(
            `documents[${index}].documentType`,
            doc?.documentName ?? ""
          );
          formDataPayload.append(`documents[${index}].document`, doc.document);
        }
      });

      const axiosConfig = {
        headers: {
          ...{ "Content-Type": "multipart/form-data" },
        },
      };

      const url = `${API_BASE_URL}${"/api/DDRDocumentUpload/upload-multiple-documents"}`;

      return (await axiosInstance.post(url, formDataPayload, axiosConfig)).data;
    } catch (error) {
      throw error;
    }
  },

  //  Dealer apies
  createDealerRegister: async (
    dealerData: AddOrUpdateDealerInterFace
  ): Promise<any> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/Dealers/register`,
        dealerData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getAllDealers: async (): Promise<Dealer[]> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/api/Dealers`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDealerById: async (id: number): Promise<Dealer> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Dealers/${id}`
      );
      // debugger;
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDocumentsByDealerId: async (id: number): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/DocumentUpload/by-dealer/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateDealer: async (
    id: number,
    dealerData: Partial<AddOrUpdateDealerInterFace>
  ): Promise<Dealer | null | undefined> => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/api/Dealers/${id}`,
        dealerData
      );
      return response.data;
    } catch (error) {}
  },
  createDealerOnBoarding: async (
    dealerData: AddOrUpdateDealerInterFace,
    apiEndPoint: string
  ): Promise<any> => {
    let requestPayload: any;

    switch (apiEndPoint) {
      case "api/Dealers":
        requestPayload = {
          id: dealerData.id,
          dealerCode: dealerData.dealerCode,
          loanProposalNo: dealerData.loanProposalNo,
          dealershipName: dealerData.dealershipName,
          dealershipPAN: dealerData.dealershipPAN,
          gstNo: dealerData.gstNo,
          gstRegStatus: dealerData.gstRegStatus,
          msmeRegistrationNo: dealerData.msmeRegistrationNo,
          msmeType: dealerData.msmeType,
          msmeStatus: dealerData.msmeStatus,
          businessCategory: dealerData.businessCategory,
          businessType: dealerData.businessType,
          entity: dealerData.entity,
          contactNo: dealerData.contactNo,
          alternativeContactNo: dealerData.alternativeContactNo,
          emailId: dealerData.emailId,
          alternativeEmailId: dealerData.alternativeEmailId,
          shopAddress: dealerData.shopAddress,
          parkingYardAddress: dealerData.parkingYardAddress,
          parkingYardState: dealerData.parkingYardState,
          parkingYardCity: dealerData.parkingYardCity,
          city: dealerData.city,
          district: "Delhi",
          state: dealerData.state,
          pincode: dealerData.pincode,
          officeStatus: dealerData.officeStatus,
          agreementDate: nullIfBlank(dealerData.agreementDate),
          agreementExpiryDate: nullIfBlank(dealerData.agreementExpiryDate),
          parkingStatus: dealerData.parkingStatus,
          parkingAgreementDate: nullIfBlank(dealerData.parkingAgreementDate),
          parkingAgreementExpiryDate: nullIfBlank(
            dealerData.parkingAgreementExpiryDate
          ),
          dateOfOnboarding: dealerData.dateOfOnboarding, // ✅ Required field now added
          dateOfIncorporation: dealerData.dateOfIncorporation,
          dateOfFacilityAgreement: nullIfBlank(
            dealerData.dateOfFacilityAgreement
          ),
          cibilOfEntity: dealerData.cibilOfEntity,
          totalSanctionLimit: dealerData.totalSanctionLimit,
          roi: dealerData.roi,
          roiPerLakh: dealerData.roiPerLakh,
          delayROI: dealerData.delayROI,
          processingFee: dealerData.processingFee,
          processingCharge: dealerData.processingCharge,
          gstOnProcessingCharge: dealerData.gstOnProcessingCharge,
          documentationCharge: dealerData.documentationCharge,
          gstOnDocCharges: dealerData.gstOnDocCharges,
          relationshipManagerId: dealerData.relationshipManagerId,
          status: dealerData.status,
          rejectionReason: dealerData.rejectionReason,
          isActive: dealerData.isActive,
          registeredDate: dealerData.registeredDate,
          userId: dealerData.userId,

          // Optional / nested sections
          borrowerDetails: [],
          guarantorDetails: [],
          chequeDetails: [],
          securityDepositDetails: [],
          documentUploads: [],

          // Optional single fields (from enhanced model)
          beneficiaryStatus: dealerData.beneficiaryStatus,
          beneficiaryName: dealerData.beneficiaryName,
          chequeNumber: dealerData.chequeNumber,
          accountNumber: dealerData.accountNumber,
          ifscCode: dealerData.ifscCode,
          dateOfChequeReceived: dealerData.dateOfChequeReceived,
          dateOfChequeHandover: dealerData.dateOfChequeHandover,
          locationOfCheque: dealerData.locationOfCheque,
          isENach: dealerData.isENach,
          chequeRemarks: dealerData.chequeRemarks,

          securityDepositStatus: dealerData.securityDepositStatus,
          amountOfSecurityDeposit: dealerData.amountOfSecurityDeposit,
          utrOfsecurityDeposit: dealerData.utrOfsecurityDeposit,
          dateOfSecurtyDepositReceived: dealerData.dateOfSecurtyDepositReceived,
          dateOfSecurtyDepositRefunded: dealerData.dateOfSecurtyDepositRefunded,
          securityDesoiteremarks: dealerData.securityDesoiteremarks,
        };
        break;

      case "api/DealerDetails/update":
        dealerData.documentUploads = [];
        dealerData.securityDepositDetails = [];
        dealerData.chequeDetails = [];
        dealerData.borrowerDetails = [];
        dealerData.guarantorDetails = [];
        requestPayload = dealerData;
        break;

      case "api/DealerDetails/borrower-guarantor":
        requestPayload = {
          borrowers: dealerData.borrowerDetails,
          guarantors: dealerData.guarantorDetails,
        };
        break;
      case "api/DealerDetails/security-deposit":
        requestPayload = dealerData.securityDepositDetails[0];
        break;
      case "api/DealerDetails/cheque":
        requestPayload = dealerData.chequeDetails;

        break;
      default:
        throw new Error(`Unsupported API endpoint: ${apiEndPoint}`);
    }

    try {
      const url = `${API_BASE_URL}/${apiEndPoint}`;

      if (apiEndPoint == "api/DealerDetails/update")
        return (
          await axiosInstance.put(
            `${API_BASE_URL}/api/Dealers/${dealerData.id}`,
            requestPayload
          )
        ).data;
      else return (await axiosInstance.post(url, requestPayload)).data;
    } catch (error) {
      throw error;
    }
  },
  uploadMultiPleDocDealerOnBoarding: async (
    apiEndPoint: string,
    documents: DealerDocumentUpload[]
  ): Promise<DealerDocumentListInterface[]> => {
    let requestPayload: any;

    switch (apiEndPoint) {
      case "api/DocumentUpload/upload-multiple-objects":
        const formDataPayload = new FormData();

        documents.forEach((doc, index) => {
          if (doc.document) {
            formDataPayload.append(
              `documents[${index}].dealerId`,
              doc.dealerId.toString()
            );
            formDataPayload.append(
              `documents[${index}].documentType`,
              doc.documentType
            );
            formDataPayload.append(
              `documents[${index}].document`,
              doc.document
            );
          }
        });

        requestPayload = formDataPayload;
        break;
      default:
        throw new Error(`Unsupported API endpoint: ${apiEndPoint}`);
    }

    try {
      const isDocumentsAPI =
        apiEndPoint === "api/DocumentUpload/upload-multiple-objects";

      const axiosConfig = {
        headers: {
          ...(isDocumentsAPI
            ? { "Content-Type": "multipart/form-data" }
            : {
                "Content-Type": "application/json",
                Accept: "application/json",
              }),
        },
      };

      const url = `${API_BASE_URL}/${apiEndPoint}`;

      return (await axiosInstance.post(url, requestPayload, axiosConfig)).data;
    } catch (error) {
      throw error;
    }
  },

//   uploadMultiPleDocBorrowerGuarantor: async (
//     apiEndPoint: string,
//     documents: DealerDocumentUpload[]
//   ): Promise<DealerDocumentListInterface[]> => {

//     try {
//       const isDocumentsAPI =
//         apiEndPoint === "api/DocumentUpload/upload-multiple-objects";
//           const formDataPayload = new FormData();
//  documents.forEach((doc, index) => {

//           if (doc.document) {
//             formDataPayload.append(
//               `documents[${index}].dealerId`,
//               doc.dealerId.toString()
//             );
//             formDataPayload.append(
//               `documents[${index}].documentType`,
//               doc.documentType
//             );
//             formDataPayload.append(
//               `documents[${index}].documentIndex`,
//               (doc?.uploadedDocumentIndex??0)?.toString()
//             );
//             formDataPayload.append(
//               `documents[${index}].document`,
//               doc.document
//             );
//           }
//         });

//       const axiosConfig = {
//         headers: {
//           ...(isDocumentsAPI
//             ? { "Content-Type": "multipart/form-data" }
//             : {
//                 "Content-Type": "application/json",
//                 Accept: "application/json",
//               }),
//         },
//       };

//       const url = `${API_BASE_URL}/${apiEndPoint}`;

//       return (await axiosInstance.post(url, formDataPayload, axiosConfig)).data;
//     } catch (error) {
//       throw error;
//     }
//   },

  getLoanProposalAndDealerCode: async (): Promise<{
    dealerCode: "";
    loanProposalNo: "";
  }> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Dealers/generate-codes`
      );
      // debugger;
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDealerStatusOnly: async (
    changeDealerStatus: DealerChangeStatus
  ): Promise<any> => {
    try {
      return (
        await axiosInstance.put(
          `${API_BASE_URL}/api/Dealers/UpdateDealerStatus`,
          changeDealerStatus
        )
      ).data;
    } catch (error) {
      throw error;
    }
  },

  // Loan apies

  getAllLoans: async (): Promise<LoanInterface[]> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/api/Loans`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getLoansByDealer: async (dealerId: number): Promise<LoanInterface[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Loans/dealer/${dealerId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getLoanById: async (id: number): Promise<LoanInterface> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Loans/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createLoan: async (
    loanData: Omit<LoanInterface, "id">
  ): Promise<LoanInterface> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/Loans`,
        loanData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateLoan: async (
    id: number,
    loanData: Partial<LoanInterface>
  ): Promise<LoanInterface> => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/api/Loans/${id}`,
        loanData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteLoan: async (id: number): Promise<any> => {
    try {
      const response = await axiosInstance.delete(
        `${API_BASE_URL}/api/Loans/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  filterLoans: (
    loans: LoanInterface[],
    filters: LoanFilter
  ): LoanInterface[] => {
    return loans.filter((loan) => {
      // Filter by dealer ID
      if (
        filters.dealerId !== undefined &&
        loan.dealerId !== filters.dealerId
      ) {
        return false;
      }

      // Filter by active status
      if (
        filters.isActive !== undefined &&
        loan.isActive !== filters.isActive
      ) {
        return false;
      }

      // Filter by min amount
      if (filters.minAmount !== undefined && loan.amount < filters.minAmount) {
        return false;
      }

      // Filter by max amount
      if (filters.maxAmount !== undefined && loan.amount > filters.maxAmount) {
        return false;
      }

      // Filter by date range
      if (
        filters.fromDate &&
        new Date(loan.dateOfWithdraw ?? "") < new Date(filters.fromDate)
      ) {
        return false;
      }

      if (
        filters.toDate &&
        new Date(loan.dateOfWithdraw ?? "") > new Date(filters.toDate)
      ) {
        return false;
      }

      return true;
    });
  },
  bulkUploadLoan: async (file: File): Promise<LoanInterface> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/Loans/bulk-upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  addLoanPayment: async (
    loanPaymentData: LoanTransactionInterface
  ): Promise<LoanInterface> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/LoanCalculator/add-pending-installment`,
        loanPaymentData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getLoanCalculationsById: async (
    id: number
  ): Promise<LoanCalculatorInterface> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/LoanCalculator/summary/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getLoanNo: async (): Promise<{ loanNumber: "" }> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Loans/generate-codes`,
        {
          headers: {
            Accept: "text/plain",
          },
        }
      );
      // debugger;
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  loanPaymentWaiver: async (waiverObj: any): Promise<LoanInterface> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/LoanCalculator/waive/${waiverObj?.installmentId}`,
        waiverObj
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  uploadMultiPleLoanDoc: async (
    apiEndPoint: string,
    documents: LoanDocumentUpload[]
  ): Promise<any> => {
    let requestPayload: any;

    switch (apiEndPoint) {
      case "api/LoanDocumentUpload/upload-multiple-documents":
        const formDataPayload = new FormData();

        documents.forEach((doc, index) => {
          if (doc.document) {
            formDataPayload.append(
              `documents[${index}].loanId`,
              doc?.loanId.toString()
            );
            formDataPayload.append(
              `documents[${index}].documentType`,
              doc.documentType
            );
            formDataPayload.append(
              `documents[${index}].document`,
              doc.document
            );
          }
        });

        requestPayload = formDataPayload;
        break;
      default:
        throw new Error(`Unsupported API endpoint: ${apiEndPoint}`);
    }

    try {
      const isDocumentsAPI =
        apiEndPoint === "api/LoanDocumentUpload/upload-multiple-documents";

      const axiosConfig = {
        headers: {
          ...(isDocumentsAPI
            ? { "Content-Type": "multipart/form-data" }
            : {
                "Content-Type": "application/json",
                Accept: "application/json",
              }),
        },
      };

      const url = `${API_BASE_URL}/${apiEndPoint}`;

      return (await axiosInstance.post(url, requestPayload, axiosConfig)).data;
    } catch (error) {
      throw error;
    }
  },
  getDocumentsByLoanId: async (loanId: number): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/LoanDocumentUpload/by-loan/${loanId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Representive apies

  getAllRepresentatives: async (): Promise<Representative[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Auth/representatives`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getRepresentativeById: async (id: number): Promise<Representative> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Auth/representatives/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateRepresentative: async (
    id: number,
    representativeData: AddOrUpdateRepresentativeData
  ): Promise<Representative> => {
    try {
      const upateObj = {
        ...representativeData,
        password: "ttpl@123",
      };
      const response = await axiosInstance.put(
        `${API_BASE_URL}/api/Auth/representatives/${id}`,
        upateObj
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createRepresentative: async (
    representativeData: AddOrUpdateRepresentativeData
  ): Promise<Representative> => {
    try {
      const upateObj = {
        ...representativeData,
        password: "ttpl@123",
      };
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/Auth/add-representative`,
        upateObj
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteRepresentative: async (id: number): Promise<any> => {
    try {
      const response = await axiosInstance.delete(
        `${API_BASE_URL}/api/Auth/representatives/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // role all apies

  getAllRoles: async (): Promise<Roles[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/RolePermission/roles`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getRoleByPermissions: async (id: number): Promise<PermissionWithRoleName> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/RolePermission/roles/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateRole: async (id: number, roleData: AddOrUpdateRole): Promise<Roles> => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/api/role/${id}`,
        roleData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createRole: async (roleData: AddOrUpdateRole): Promise<Roles> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/RolePermission/roles`,
        roleData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // role all apies

  getAllPermission: async (): Promise<PermissionsList[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/RolePermission/permissions`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updatePermissionsOnRole: async (
    permissionData: UpdatePermissionWithRoleId
  ): Promise<Roles> => {
    try {
      const response = await axiosInstance.patch(
        `${API_BASE_URL}/api/RolePermission/roles/${permissionData?.id}`,
        permissionData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // all payment apies
  getAllPayments: async (): Promise<PaymentsInterface[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/LoanCalculator/pending-installments`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  approvePendingPayments: async (approvePaymentObj: {
    pendingInstallmentId: number;
  }): Promise<any> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/LoanCalculator/approve-pending-installment`,
        approvePaymentObj
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // all master apies
  getVehicleMakerList: async (): Promise<DdrMastersApiResInterface[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/makes`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getVehiclePurchaseList: async (): Promise<DdrMastersApiResInterface[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/purchase-sources`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDealerEntityTypeList: async (): Promise<
    DealerMastersApiResInterface[]
  > => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/entity-types`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDealerBusinessCategoryList: async (): Promise<
    DealerMastersApiResInterface[]
  > => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/business-categories`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDealerBusinessTypeList: async (): Promise<
    DealerMastersApiResInterface[]
  > => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/business-types`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDealerPersonTypeList: async (): Promise<
    DealerMastersApiResInterface[]
  > => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/person-types`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDealerAddressStatusList: async (): Promise<
    DealerMastersApiResInterface[]
  > => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/address-statuses`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDealerLocationsOfCheque: async (): Promise<
    DealerMastersApiResInterface[]
  > => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/cheque-location`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPurchaseSourceByDocumentList: async (
    purchaseSourceId: number
  ): Promise<DdrPurchaseByDocumentListInterface[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/purchase-sources/${purchaseSourceId}/documents`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getBankDetails: async (
  ): Promise<DdrMastersApiResInterface[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/bank-details`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createEntityType: async (data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/Masters/entity-types`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

updateEntityType: async (id: number, data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/Masters/entity-types/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

deleteEntityType: async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/Masters/entity-types/${id}`
    );
  } catch (error) {
    throw error;
  }
},

// Business Category CRUD
createBusinessCategory: async (data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/Masters/business-categories`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

updateBusinessCategory: async (id: number, data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/Masters/business-categories/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

deleteBusinessCategory: async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/Masters/business-categories/${id}`
    );
  } catch (error) {
    throw error;
  }
},

// Business Type CRUD
createBusinessType: async (data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/Masters/business-types`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

updateBusinessType: async (id: number, data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/Masters/business-types/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

deleteBusinessType: async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/Masters/business-types/${id}`
    );
  } catch (error) {
    throw error;
  }
},

// Address Status CRUD
createAddressStatus: async (data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/Masters/address-statuses`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

updateAddressStatus: async (id: number, data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/Masters/address-statuses/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

deleteAddressStatus: async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/Masters/address-statuses/${id}`
    );
  } catch (error) {
    throw error;
  }
},

// Person Type CRUD
createPersonType: async (data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/Masters/person-types`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

updatePersonType: async (id: number, data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/Masters/person-types/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

deletePersonType: async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/Masters/person-types/${id}`
    );
  } catch (error) {
    throw error;
  }
},

// Bank Details CRUD
createBankDetail: async (data: { id: number; name: string,accountNumber: string,bankName: string,ifsc: string,branchName: string,is_credit_account: boolean }): Promise<DdrMastersApiResInterface> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/Masters/bank-details`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

updateBankDetail: async (id: number, data: { id: number; name: string }): Promise<DdrMastersApiResInterface> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/Masters/bank-details/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

deleteBankDetail: async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/Masters/bank-details/${id}`
    );
  } catch (error) {
    throw error;
  }
},

// Purchase Source CRUD
createPurchaseSource: async (data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/Masters/purchase-sources`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

updatePurchaseSource: async (id: number, data: { id: number; name: string, loanBidAmtPercentage: number, isApplicationNoRequired: boolean }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/Masters/purchase-sources/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

deletePurchaseSource: async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/Masters/purchase-sources/${id}`
    );
  } catch (error) {
    throw error;
  }
},

// Make CRUD
createMake: async (data: { id: number; name: string }): Promise<DdrMastersApiResInterface> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/Masters/makes`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

updateMake: async (id: number, data: { id: number; name: string }): Promise<DdrMastersApiResInterface> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/Masters/makes/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

deleteMake: async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/Masters/makes/${id}`
    );
  } catch (error) {
    throw error;
  }
},

// Cheque Location CRUD
createChequeLocation: async (data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/Masters/cheque-location`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

updateChequeLocation: async (id: number, data: { id: number; name: string }): Promise<DealerMastersApiResInterface> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/Masters/cheque-location/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

deleteChequeLocation: async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/Masters/cheque-location/${id}`
    );
  } catch (error) {
    throw error;
  }
},

// Purchase Source Documents CRUD
createPurchaseSourceDocument: async (purchaseSourceId: number, data: { purchaseSourceId: number; documentNames: string[];is_mandatory: boolean }): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/Masters/purchase-sources/${purchaseSourceId}/documents`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

updatePurchaseSourceDocument: async (id: number, data: { id: number; documentName: string;is_mandatory: boolean }): Promise<any> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/Masters/purchase-source-documents/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

deletePurchaseSourceDocument: async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_BASE_URL}/api/Masters/purchase-source-documents/${id}`
    );
  } catch (error) {
    throw error;
  }
},

  getAllStateList: async (): Promise<DealerMastersApiResInterface[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/states`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getStateByCityList: async (
    stateId: number
  ): Promise<DealerMastersApiResInterface[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/states/${stateId}/cities`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  addState: async (name: string): Promise<any> => {
    try{
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/Masters/states`,
        {name}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateState: async (id: number, name: string): Promise<any> => {
    try{
      const response = await axiosInstance.put(
        `${API_BASE_URL}/api/Masters/states/${id}`,
        { name }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }, 
  newCity: async (stateId: number, name: string): Promise<any> => {
    try{
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/Masters/cities`,
        {stateId, name}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateCity: async (id: number, stateId: number, name: string): Promise<any> => {
    try{
      const response = await axiosInstance.put(
        `${API_BASE_URL}/api/Masters/cities/${id}`,
        { stateId, name }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDesignations: async (): Promise<DealerMastersApiResInterface[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/designations`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  addDesignation: async (name: string): Promise<any> => {
    try{
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/Masters/designations`,
        {name}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateDesignation: async (id: number, name: string): Promise<any> => {
    try{
      const response = await axiosInstance.put(
        `${API_BASE_URL}/api/Masters/designations/${id}`,
        { name }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  singleDesignation: async (id: number): Promise<DealerMastersApiResInterface> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/Masters/designations/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteDesignation: async (id: number): Promise<void> => {
    try{
      const response = await axiosInstance.delete(
        `${API_BASE_URL}/api/Masters/designations/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default APIService;

const nullIfBlank = (value: any): string | null => {
  return value?.trim() === "" ? null : value;
};
