import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Breadcrumbs, Link, Avatar, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MainLayout from '../../../components/layout/MainLayout';
import { Borrower, Dealer, DealerDocumentListInterface, DealerOnboardingBorrowerOrGuarantor, Guarantor } from '../../../service/models/Dealer.model';
import { LoanInterface } from '../../../service/models/Loan.model';
import APIService from '../../../service/API';
import CommonService from '../../../service/CommonService';
let     decodeId='';
// Define document types interface




const DealerDetails: React.FC = () => {
  const { encodedId } = useParams<{ encodedId: string }>();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loans, setLoans] = useState<LoanInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loansLoading, setLoansLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBorrowerDialogOpen, setBorrowerDialogOpen] = useState<boolean>(false);
  const [typeBorrowerOrGurantor, setTypeBorrowerOrGurantor] = useState<string>('');
  const [selectedBorrowerOrGurantorData, setBorrowerOrGurantorData] = useState<DealerOnboardingBorrowerOrGuarantor>();

  const navigate = useNavigate();

  // Mock dealer documents data
  const [documents, setDocuments] = useState<DealerDocumentListInterface[]>([]);
  const [viewMoreLoansCount, setViewMoreLoansCount] = useState<number>(5);

  // Mock financial data since it's not in the updated API response
  const [financialData, setFinancialData] = useState({
    sanctionAmount: 0,
    availableLimit: 0,
    outstandingAmount: 0,
    principalOutstanding: 0,
    roi: 0,
    delayROI: 0,
    pfReceived: 0,
    interestReceived: 0,
    delayInterestReceived: 0,
    amountReceived: 0,
    pfAcrued: 0,
    interestAccrued: 0,
    delayInterestAccrued: 0,
    waiverAmount: 0,
    overdueCount: 0,
    roiPerLakh: 0,
    delayroiPerLakh: 0,
    processingFee: 0,
    processingCharge: 0,
    gstOnProcessingCharge: 0,
    documentationCharge: 0,
    gstOnDocCharges: 0,
    cibilOfEntity:0,
    agreementDate:''
  });
  const [borrowers, setBorrowers] = useState<Borrower[]>([
    {
      id: 0,
      dealerId: 0,
      name: '',
      pan: '',
      dateOfBirth: '',
      mobileNumber: '',
      email: '',
      fatherName: '',
      relationshipWithEntity: '',
      currentAddress: '',
      permanentAddress: '',
      cibilScore: 0,
      aadharNo: '',
      personType: '',
      addressStatus: '',
      attachmentPath: '',
      addressAgreementDate: '',
      addressAgreementExpiryDate:'',
      "borrowerCPinCode": "",
      "borrowerCState": "",
      "borrowerPPincode": "",
      "borrowerPState": "",
      "borrowerCCity": "",
      "borrowerPCity": "",
    }
  ]);

  const [guarantors, setGuarantors] = useState<Guarantor[]>([
    {
      id: 0,
      dealerId: 0,
      name: '',
      pan: '',
      dateOfBirth: '',
      mobileNumber: '',
      email: '',
      fatherName: '',
      currentAddress: '',
      permanentAddress: '',
      cibilScore: 0,
      aadharNo: '',
      personType: '',
      addressStatus: '',
      attachmentPath: '',
      relationshipWithBorrower: '',
      addressAgreementDate: '',
      addressAgreementExpiryDate: '',
      "guarantorCPinCode": "",
      "guarantorCState": "",
      "guarantorPPincode": "",
      "guarantorPState": "",
      "guarantorCCity": "",
      "guarantorPCity": "",
    }
  ]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!encodedId) return;
         decodeId=atob(encodedId)
      try {
        
        const data = await APIService.getDocumentsByDealerId(Number(decodeId));

        const mappedDocuments: DealerDocumentListInterface[] = [];
        data.forEach((doc: any) => {
          mappedDocuments.push({
            id: doc?.id??0,
            documentType: doc.documentType,
            uploadedOn: doc.uploadedOn || '',
            filePath: doc.filePath || '' // adjust this if needed
          });
        });


        setDocuments(mappedDocuments);

        const dashboardData = await APIService.getDashboardSummary(decodeId);

        setFinancialData(prev => ({
        ...prev,
        sanctionAmount: dashboardData.totalSanctionLimit ?? 0,
        availableLimit: dashboardData.availableLimit ?? 0,
        outstandingAmount: dashboardData.totalAmountPending ?? 0,
        principalOutstanding: dashboardData.totalPrincipalPaid ?? 0,
        amountReceived: dashboardData.totalPrincipalPaid ?? 0,
        waiverAmount : dashboardData.totalWaiversAmount ?? 0
        // Fill additional fields from dashboardData if available
      }));
      } catch (err: any) {
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);


  useEffect(() => {

    const fetchDealerDetails = async () => {
      if (!encodedId) return;
 decodeId=atob(encodedId)
      try {
        setLoading(true);
        const data = await APIService.getDealerById(Number(decodeId));
        setDealer(data);
        financialData.roi = Number(data.securityDepositDetails?.[0]?.roi ?? 0);
        financialData.sanctionAmount = Number(data.securityDepositDetails?.[0]?.totalSanctionLimit ?? 0);
        financialData.delayROI = Number(data.securityDepositDetails?.[0]?.delayROI ?? 0);
        financialData.roiPerLakh = Number(data.securityDepositDetails?.[0]?.roiPerLakh ?? 0);
        financialData.processingFee = Number(data.securityDepositDetails?.[0]?.processingFee ?? 0);
        financialData.processingCharge = Number(data.securityDepositDetails?.[0]?.processingCharge ?? 0);
        financialData.gstOnProcessingCharge = Number(data.securityDepositDetails?.[0]?.gstOnProcessingCharge ?? 0);
        financialData.documentationCharge = Number(data.securityDepositDetails?.[0]?.documentationCharge ?? 0);
        financialData.gstOnDocCharges = Number(data.securityDepositDetails?.[0]?.gstOnDocCharges ?? 0);
        financialData.delayroiPerLakh = Number(data.securityDepositDetails?.[0]?.delayroiPerLakh ?? 0);
        financialData.cibilOfEntity = Number(data.securityDepositDetails?.[0]?.cibilOfEntity ?? 0);
        financialData.agreementDate = data.securityDepositDetails?.[0]?.agreementDate ?? "";
        setFinancialData(financialData)
        setBorrowers(data?.borrowerDetails)
        setGuarantors(data?.guarantorDetails)
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch dealer details. Please try again later.');
        setLoading(false);
      }
    };

    fetchDealerDetails();
  }, [encodedId]);

  useEffect(() => {
    const fetchDealerLoans = async () => {
      if (!encodedId) return;

      try {
        setLoansLoading(true);
        const loansData = await APIService.getLoansByDealer(Number(decodeId));

        const processedLoans = loansData.map(loan => {
          const dueDate = new Date(loan.dueDate??'');
          const today = new Date();
          let status: 'Active' | 'Closed' | 'Overdue' = loan.isActive ? 'Active' : 'Closed';
          if (loan.isActive && dueDate < today) {
            status = 'Overdue';
          }
          return { ...loan, status };
        });

        setLoans(processedLoans);
        setLoansLoading(false);
      } catch (err) {
        setLoansLoading(false);
      }
    };

    fetchDealerLoans();
  }, [encodedId]);

  const getStatusColor = (status: string) => {
    if(!status) return 'default'
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      case 'under process':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleViewDocument = (filePath: string) => {
    window.open(filePath, '_blank');
  };




  const handleViewLoan = (loanId: number) => {
    navigate(`/loan-details/${btoa(loanId.toString())}`);
  };

  
  const handleViewMoreOrLessLoan = () => {
 viewMoreLoansCount<=5
                      ?setViewMoreLoansCount(100):setViewMoreLoansCount(5)
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

    const handleViewBorrowOrGurantorDetails = (borrrowerOrGurantorRowData: any,typeBorrowerOrGurantor:string) => {
      setBorrowerOrGurantorData(borrrowerOrGurantorRowData);
        setTypeBorrowerOrGurantor(typeBorrowerOrGurantor);
setBorrowerDialogOpen(true);
  };

  if (error || !dealer) {
    return (
      <MainLayout>
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography color="error">{error || 'Dealer not found'}</Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dealer-listing')}
            sx={{ mt: 2 }}
          >
            Back to Listing
          </Button>
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
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </Link>
        <Link
          color="inherit"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/dealer-listing')}
        >
          Dealers
        </Link>
        <Typography color="text.primary">{dealer.dealershipName}</Typography>
      </Breadcrumbs>

      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dealer-listing')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Dealer Details</Typography>
      </Box>

      {/* Main content */}
      <Grid container spacing={3}>
        {/* Left side - Basic information */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              textAlign: 'left',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: '#1e3a8a', mr: 2 }}>
                  {dealer.dealershipName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {dealer.dealershipName}
                  </Typography>
                  <Chip
                    label={dealer.status}
                    size="small"
                    color={getStatusColor(dealer.status) as any}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Dealer info fields, all left-aligned */}
              {[
                ['Dealer Code', dealer.dealerCode],
                ['Loan Proposal No', dealer.loanProposalNo],
                ['PAN', dealer.dealershipPAN],
                ['Entity Type', dealer.entity],
                ['GST Registration Status', dealer.gstRegStatus],
                ['GST Number', dealer.gstNo],
                ['Date of Facility Agreement', CommonService.formatDate(financialData?.agreementDate??"")],
                ['MSME Status', `${dealer.msmeStatus}`],
                ['MSME Registration & Type', `${dealer.msmeRegistrationNo} ${dealer?.msmeType?+' ('+dealer?.msmeType+')':''}`],
                ['Business Category', `${dealer.businessCategory}`],
                ['Business Type', `${dealer.businessType}`],
                ['Relationship Manager', dealer.relationshipManager],
                ['Date of Incorporation', CommonService.formatDate(dealer.dateOfIncorporation??"")],
                ['Email', dealer.emailId],
                ['Alternative Email', dealer.alternativeEmailId],
                ['Contact No.', dealer.contactNo],
                ['Alternative Contact', dealer.alternativeContactNo],
              ].map(([label, value]) => (
                <Box key={label} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body1">{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Right side - Financial + Address + Loan Summary */}
        <Grid item xs={12} md={8}>
          {/* Financial Overview */}
          <Paper
            sx={{
              borderRadius: 2,
              p: 3,
              mb: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              textAlign: 'left',
            }}
          >
            <Typography variant="h6" sx={{ mb: 3 }}>
              Financial Overview
            </Typography>

            <Grid container spacing={3}>
              {/* Repeat each financial box with left alignment */}
              {[
                ['Sanction Amount', `₹${financialData.sanctionAmount.toLocaleString()}`, '#1e3a8a'],
                ['Available Limit', `₹${financialData.availableLimit.toLocaleString()}`, 'success.main'],
                ['Outstanding Amount', `₹${financialData.outstandingAmount.toLocaleString()}`, 'warning.main'],
                ['Principal Till Date', `₹${financialData.principalOutstanding.toLocaleString()}`, 'inherit'],
                ['Rate of Interest', `${financialData.roi}%`, 'inherit'],
                ['Delay ROI', `${financialData.delayROI}%`, 'inherit'],
              ].map(([label, value, color]) => (
                <Grid item xs={12} sm={6} md={4} key={label}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="h6" sx={{ color }}>
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              {[
                ['ROI Per Lakh', `₹${financialData.roiPerLakh.toLocaleString()}`],
                ['Delay ROI Per Lakh', `₹${financialData.delayroiPerLakh?.toLocaleString() ?? '0'}`],
                ['Processing Fee', `₹${financialData.processingFee.toLocaleString()}`],
                ['CIBIL Of Entity', `${(!isNaN(financialData.cibilOfEntity)?financialData.cibilOfEntity:0).toLocaleString()}`],
                ['Processing Charge', `₹${financialData.processingCharge.toLocaleString()}`],
                ['GST on Processing Charge', `₹${financialData.gstOnProcessingCharge.toLocaleString()}`],
                ['Documentation Charge', `₹${financialData.documentationCharge.toLocaleString()}`],
                ['GST on Documentation Charges', `₹${financialData.gstOnDocCharges.toLocaleString()}`],
                 ['Amount Waived', `₹${financialData.waiverAmount.toLocaleString()}`, 'inherit'],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={6} md={4} key={label}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="h6">{value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

          </Paper>


 <Grid container spacing={3}>
            {/* Address Information */}
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  flexGrow: 1,
                  textAlign: 'left',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Office Information
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer.officeStatus}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Agreement Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>{ CommonService.formatDate(dealer.agreementDate??"")}</Typography>
                     <Typography variant="subtitle2" color="text.secondary">
                    Agreement Expiry Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>{ CommonService.formatDate(dealer.agreementExpiryDate??"")}</Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer.shopAddress}
                  </Typography>
                 
   {dealer.officeStatus=='Rented'&&<>
                    <Typography variant="subtitle2" color="text.secondary">
                    City
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer.city}
                  </Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                    State
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer.state}
                  </Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                    Pincode
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer.pincode}
                  </Typography>
                  </>}

                </CardContent>
              </Card>
            </Grid>

            {/* Loan Summary */}
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
             <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  flexGrow: 1,
                  textAlign: 'left',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Parking Information
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                     Status
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer.parkingStatus}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                     Agreement Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>{ CommonService.formatDate(dealer?.parkingAgreementDate??"")}</Typography>
                     <Typography variant="subtitle2" color="text.secondary">
                     Agreement Expiry Date
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>{ CommonService.formatDate(dealer?.parkingAgreementExpiryDate??"")}</Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                     Address
                  </Typography>
                  {dealer.parkingStatus=='Rented'&&<>
                    <Typography variant="body1" >{dealer.parkingYardAddress}</Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                     City
                  </Typography>
                  <Typography variant="body1" >{dealer.parkingYardCity}</Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                     Address
                  </Typography>
                  <Typography variant="body1" >{dealer.parkingYardState}</Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                     Address
                  </Typography>
                  <Typography variant="body1" >{dealer.parkingYardPinCode}</Typography>
                  </>}
                
                </CardContent>
              </Card>
            </Grid>
          </Grid>
         
        </Grid>
        {/* Loans Section */}
        <Grid item xs={12} md={12}>

     <Divider sx={{ mb: 2 }} />
     <Grid container spacing={3}>
<Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  flexGrow: 1,
                  textAlign: 'left',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Cheque Information
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Beneficiary Status
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer?.chequeDetails?.[0]?.beneficiaryStatus}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Beneficiary Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>   {dealer?.chequeDetails?.[0]?.beneficiaryName}</Typography>
                     <Typography variant="subtitle2" color="text.secondary">
                    Account Number
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>   {dealer?.chequeDetails?.[0]?.accountNumber}</Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                    IFSC Code
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                      {dealer?.chequeDetails?.[0]?.ifscCode}
                  </Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                    Date of Cheque Received
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                      {CommonService.formatDate(dealer?.chequeDetails?.[0]?.dateReceived??"")}
                  </Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                    Date of Cheque Handover
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {CommonService.formatDate(dealer?.chequeDetails?.[0]?.dateHandover??"")}
                  </Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                    Location of Cheque
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer?.chequeDetails?.[0]?.location}
                  </Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                    E-Nach
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                     {dealer?.chequeDetails?.[0]?.isENach?'Yes':'No'}
                  </Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                  Remarks
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer?.chequeDetails?.[0]?.remarks}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  flexGrow: 1,
                  textAlign: 'left',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Security Deposit Information
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Security Deposit Status
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer?.securityDepositDetails?.[0]?.status}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Amount of Security Deposit
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>   {dealer?.securityDepositDetails?.[0]?.amount}</Typography>
                     <Typography variant="subtitle2" color="text.secondary">
                    UTR Number of Security Deposit
                  </Typography>
                     <Typography variant="body1" sx={{ mb: 1.5 }}>   {dealer?.securityDepositDetails?.[0]?.utrNumber}</Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                    Date of Security Deposit Received
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                      {CommonService.formatDate(dealer?.securityDepositDetails?.[0]?.dateReceived??'')}
                  </Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                    Date of Security Deposit Refunded
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {CommonService.formatDate(dealer?.securityDepositDetails?.[0]?.dateRefunded??'')}
                  </Typography>
                   <Typography variant="subtitle2" color="text.secondary">
                  Remarks
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {dealer?.securityDepositDetails?.[0]?.remarks}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            </Grid>


     <Divider sx={{ my: 3 }} />
          <Paper sx={{ borderRadius: 2, mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Borrower details</Typography>
            </Box>
             <Box sx={{overflowX: 'auto' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{textWrap:'nowrap'}}>Person Type</TableCell>
                    <TableCell>Name</TableCell>
                   
                     <TableCell>Mobile No.</TableCell>
                      <TableCell>Email</TableCell>
                        <TableCell>Father Name</TableCell>
                    <TableCell sx={{textWrap:'nowrap'}}>Relationship With Entity</TableCell>
                    <TableCell></TableCell>
                   
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={17} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : borrowers.length > 0 ? (
                    borrowers.map((borrowElement) => (
                      <TableRow key={borrowElement.id} hover>
                        <TableCell>{borrowElement.personType}</TableCell>
                         <TableCell>{borrowElement.name}</TableCell>
                        <TableCell>{borrowElement.mobileNumber}</TableCell>
                          <TableCell>{borrowElement.email}</TableCell>
                           <TableCell>{borrowElement.fatherName}</TableCell>
                          <TableCell>{borrowElement.relationshipWithEntity}</TableCell>
                            <TableCell            onClick={() => handleViewBorrowOrGurantorDetails(borrowElement,'Borrower')}
                                sx={{ color: '#1e3a8a',cursor:"pointer",textWrap:'nowrap' }} >View Details</TableCell>
                        
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={16} align="center" sx={{ py: 3 }}>
                        No Borrower found for this dealer
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
          </Paper>

               <Divider sx={{ mb: 2 }} />
          <Paper sx={{ borderRadius: 2, mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)',overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Guarantor details</Typography>
            </Box>
            <Box sx={{overflowX: 'auto' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{textWrap:'nowrap'}}>Person Type</TableCell>
                    <TableCell>Name</TableCell>
                     <TableCell>Mobile No.</TableCell>
                      <TableCell>Email</TableCell>
                        <TableCell>Father Name</TableCell>
                    <TableCell sx={{textWrap:'nowrap'}}>Relationship With Borrower</TableCell>
                      <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={16} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : guarantors.length > 0 ? (
                    guarantors.map((gurantorsElement) => (
                      <TableRow key={gurantorsElement.id} hover>
                        <TableCell>{gurantorsElement.personType}</TableCell>
                         <TableCell>{gurantorsElement.name}</TableCell>
                        <TableCell>{gurantorsElement.mobileNumber}</TableCell>
                          <TableCell>{gurantorsElement.email}</TableCell>
                          <TableCell>{gurantorsElement.fatherName}</TableCell>
                          <TableCell>{gurantorsElement.relationshipWithBorrower}</TableCell>
    <TableCell            onClick={() => handleViewBorrowOrGurantorDetails(gurantorsElement,'Gurantor')}
                                sx={{ color: '#1e3a8a',cursor:"pointer",textWrap:'nowrap' }} >View Details</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={16} align="center" sx={{ py: 3 }}>
                        No Guarantor found for this dealer
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
          </Paper>

          <Divider sx={{ mb: 2 }} />
          {/* Recent Loans Table */}
          <Paper sx={{ borderRadius: 2, mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Box sx={{ p: 2,display:'flex',justifyContent:'space-between', bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Recent Loans</Typography>
           {loans.length>0&& <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/loan-listing/${encodedId}`)}
                >
                  View All Loans
                </Button>}
            
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Loan Number</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Interest Rate</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loansLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : loans.length > 0 ? (
                    loans.slice(0, viewMoreLoansCount).map((loan) => (
                      <TableRow key={loan.id} hover>
                        <TableCell>{loan.loanNumber}</TableCell>
                        <TableCell>{CommonService.formatDate(loan.dateOfWithdraw||'')}</TableCell>
                        <TableCell>₹{loan.amount.toLocaleString()}</TableCell>
                        <TableCell>{loan.interestRate}%</TableCell>
                        <TableCell>{CommonService.formatDate(loan.dueDate||'')}</TableCell>
                        <TableCell>
                          <Chip
                            label={loan.status}
                            size="small"
                            color={
                              loan.status === 'Active' ? 'success' :
                                loan.status === 'Overdue' ? 'error' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => handleViewLoan(loan.id)}
                            sx={{ color: '#1e3a8a' }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        No loans found for this dealer
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {loans.length > 5 && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={
                    
                    handleViewMoreOrLessLoan
                    
                    }
                >
                  View {viewMoreLoansCount<=5
                      ?'more':'less'} loans
                </Button>
              </Box>
            )}
          </Paper>

          <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="subtitle1">Payment Summary</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: '50%' }}>PF Received</TableCell>
                    <TableCell>₹{financialData.pfReceived.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Interest Received</TableCell>
                    <TableCell>₹{financialData.interestReceived.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Delay Interest Received</TableCell>
                    <TableCell>₹{financialData.delayInterestReceived.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Amount Received</TableCell>
                    <TableCell>₹{financialData.amountReceived.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>PF Accrued</TableCell>
                    <TableCell>₹{financialData.pfAcrued.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Interest Accrued</TableCell>
                    <TableCell>₹{financialData.interestAccrued.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Delay Interest Accrued</TableCell>
                    <TableCell>₹{financialData.delayInterestAccrued.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Waiver Amount</TableCell>
                    <TableCell>₹{financialData.waiverAmount.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Overdue Count</TableCell>
                    <TableCell>{financialData.overdueCount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
        </Grid>


        {/* Documents Section */}
        <Grid item xs={12} md={12}>
          <Divider sx={{ mb: 2 }} />
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Documents</Typography>
                {/* <Button
                  variant="outlined"
                  startIcon={<FileUploadIcon />}
                  size="small"
                  onClick={() => alert('In a real application, this would open an upload interface for a new document type.')}
                >
                  Add New
                </Button> */}
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Document Type</TableCell>
                      <TableCell>Upload Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                    documents?.length>0?
                    (documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.documentType}</TableCell>
                        <TableCell>{doc.uploadedOn ? CommonService.formatDate(doc.uploadedOn) : 'Not uploaded'}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {doc.filePath && (
                              <Tooltip title="View Document">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDocument(doc.filePath)}
                                  sx={{ color: '#1e3a8a' }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ): (
                    <TableRow>
                      <TableCell colSpan={16} align="center" sx={{ py: 3 }}>
                        No documents found for this dealer
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

         <Dialog open={isBorrowerDialogOpen} onClose={() => setBorrowerDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>
              {typeBorrowerOrGurantor=='Borrower'?'Borrower':'Gurantor'} Details
              </DialogTitle>
              <DialogContent dividers>
                {selectedBorrowerOrGurantorData && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Person Type</Typography>
                      <Typography variant="body1">{selectedBorrowerOrGurantorData.personType}</Typography>
                    </Grid>
                      <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">{selectedBorrowerOrGurantorData.name}</Typography>
                    </Grid>
                    <Grid item xs={6} >

                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                        <Typography variant="body1">{selectedBorrowerOrGurantorData.email}</Typography>
               
                    </Grid>
                    <Grid item xs={6}>
                    
                        <Typography variant="subtitle2" color="text.secondary">Mobile No.</Typography>
                        <Typography variant="body1">{selectedBorrowerOrGurantorData.mobileNumber}</Typography>
                  
                    </Grid>
                      <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        
                        {typeBorrowerOrGurantor=='Borrower'?'Relationship With Entity':'Relationship With Borrower'}
                        </Typography>
                        {typeBorrowerOrGurantor=='Borrower'&& <Typography variant="body1">{selectedBorrowerOrGurantorData.relationshipWithEntity}</Typography>}
                         {typeBorrowerOrGurantor=='Gurantor'&& <Typography variant="body1">{selectedBorrowerOrGurantorData.relationshipWithBorrower}</Typography>}
                     
                    </Grid>
                      <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">PAN</Typography>
                      <Typography variant="body1">{selectedBorrowerOrGurantorData.pan}</Typography>
                    </Grid>
                      <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Aadhar No</Typography>
                      <Typography variant="body1">{selectedBorrowerOrGurantorData.aadharNo}</Typography>
                    </Grid>
                      <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">DOB</Typography>
                      <Typography variant="body1">{CommonService.formatDate(selectedBorrowerOrGurantorData.dateOfBirth)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Father Name</Typography>
                      <Typography variant="body1">{selectedBorrowerOrGurantorData.fatherName}</Typography>
                    </Grid>
                    
                      <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Cibil Score</Typography>
                      <Typography variant="body1">{selectedBorrowerOrGurantorData.cibilScore}</Typography>
                    </Grid>
                      <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">CurrentAddress</Typography>
                      <Typography variant="body1">{selectedBorrowerOrGurantorData.currentAddress}</Typography>
                    </Grid>
                      <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">PermanentAddress</Typography>
                      <Typography variant="body1">{selectedBorrowerOrGurantorData.permanentAddress}</Typography>
                    </Grid>
                    
            <Divider sx={{ my: 3 }} />
{typeBorrowerOrGurantor=='Borrower'&&<>
   <Grid item xs={6} md={6}>
     <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                  >
                    Current Addres Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.currentAddress}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  City
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.borrowerCCity}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  State
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.borrowerCState}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Pincode
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.borrowerCPinCode}
                </Typography>
              </Grid>
                 <Grid item xs={6} md={6}>
                       <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                  >
                    Permanent Addres Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.permanentAddress}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  City
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.borrowerPCity}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  State
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.borrowerPState}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Pincode
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.borrowerPPincode}
                </Typography>
              </Grid>
</>}

{typeBorrowerOrGurantor=='Gurantor'&&<>
   <Grid item xs={6} md={6}>
     <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                  >
                    Current Addres Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.currentAddress}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  City
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.guarantorCCity}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  State
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.guarantorCState}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Pincode
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.guarantorCPinCode}
                </Typography>
              </Grid>
                 <Grid item xs={6} md={6}>
                       <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                  >
                    Permanent Addres Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.permanentAddress}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  City
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.guarantorPCity}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  State
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.guarantorPState}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Pincode
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {selectedBorrowerOrGurantorData.guarantorPPincode}
                </Typography>
              </Grid>
</>}
           
                      <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Address Status</Typography>
                      <Typography variant="body1">{selectedBorrowerOrGurantorData.addressStatus}</Typography>
                    </Grid>
                    {selectedBorrowerOrGurantorData.addressStatus=='Rented'&&<>
                   <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Address Agreement Date</Typography>
                      <Typography variant="body1">{CommonService.formatDate(selectedBorrowerOrGurantorData.addressAgreementDate||'')}</Typography>
                    </Grid>
                      <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Address Agreement ExpiryDate</Typography>
                      <Typography variant="body1">{CommonService.formatDate(selectedBorrowerOrGurantorData.addressAgreementExpiryDate||'')}</Typography>
                    </Grid>
                    </>}
                     
                   
                  </Grid>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setBorrowerDialogOpen(false)}>Close</Button>
              </DialogActions>
            </Dialog>
    </MainLayout>
  );
};

export default DealerDetails;