import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../../components/layout/MainLayout';
import axios from 'axios';
import { LoanInterface } from '../../../service/models/Loan.model';
import APIService from '../../../service/API';
import { AddCircleOutline, Upload } from '@mui/icons-material';
import CommonService from '../../../service/CommonService';
import NgIf from '../../../components/NgIf';


const LoanListing: React.FC = ( ) => {
  const { dealerId } = useParams<{ dealerId: string }>();
  const [loans, setLoans] = useState<LoanInterface[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [dealerName, setDealerName] = useState<string>('');
  
  // Filter states
  // const [showFilters, setShowFilters] = useState<boolean>(false);
  // const [filterActive, setFilterActive] = useState<string>('');
  // const [filterFromDate, setFilterFromDate] = useState<Date | null>(null);
  // const [filterToDate, setFilterToDate] = useState<Date | null>(null);
  // const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  // const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');
    const inputUploadExcelFileRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        let loansData: LoanInterface[];
        
        if (dealerId) {
          const decodeId=atob(dealerId)
          loansData = await APIService.getLoansByDealer(Number(decodeId));
          try {
            const dealerData = await APIService.getDealerById(Number(decodeId));
            setDealerName(dealerData.dealershipName);
          } catch (err) {
          }
        } else 
          loansData = await APIService.getAllLoans();
        
          let processedLoans = loansData.map(loan => {
          const dueDate = new Date(loan.dueDate??'');
          const today = new Date();
          let status: 'Active' | 'Closed' | 'Overdue' = loan.isActive ? 'Active' : 'Closed';
          if (loan.isActive && dueDate < today) {
            status = 'Overdue';
          }
          return { ...loan, status };
        });
        setLoans(processedLoans);
        processedLoans=processedLoans.filter((loanItem)=>loanItem.isActive==true)
        setFilteredLoans(processedLoans);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [dealerId]);


    useEffect(() => {
      const results = loans.filter(loan =>
        loan?.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan?.dealer?.dealershipName?.toLowerCase().includes(searchTerm.toLowerCase())||
        loan?.vehicleInfo?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())||
        loan?.amount<=(Number(searchTerm)?Number(searchTerm):0)
      );
      setFilteredLoans(results);
      setPage(0);
    }, [searchTerm]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return {
      totalLoans: loans.length,
      totalAmount: loans.reduce((sum, loan) => sum + loan.amount, 0),
      activeLoans: loans.filter(loan => loan.isActive).length,
      inactiveLoans: loans.filter(loan => !loan.isActive).length,
      totalVehicleValue: loans.reduce((sum, loan) => 
        sum + (loan.vehicleInfo ? loan.vehicleInfo.value : 0), 0),
    };
  }, [loans]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  
const uploadExcelButton=()=>{
    inputUploadExcelFileRef.current?.click(); 
}
   const handleExcelFileUpload = async (
     event: React.ChangeEvent<HTMLInputElement>
   ) => {
     const file = event.target.files?.[0];
     event.target.value = "";
     if (!file) return;

     try {
       const bulkUploadedData = await APIService.bulkUploadLoan(file);
       if (bulkUploadedData) {
         setSuccessMsg("Uploaded succesfully");
         setLoading(true);
         const loansData = await APIService.getAllLoans();
          let processedLoans = loansData.map(loan => {
          const dueDate = new Date(loan.dueDate??'');
          const today = new Date();
          let status: 'Active' | 'Closed' | 'Overdue' = loan.isActive ? 'Active' : 'Closed';
          if (loan.isActive && dueDate < today) {
            status = 'Overdue';
          }
          return { ...loan, status };
        });
        setLoans(processedLoans);
        processedLoans=processedLoans.filter((loanItem)=>loanItem.isActive==true)
        setFilteredLoans(processedLoans);
         setLoading(false);
       }
     } catch (error: unknown) {
       if (axios.isAxiosError(error)) {
         if (error.response) setErrorMsg(error.response.data?.message);
       }
     }
   };

    const statusBehalfFilterDdrList=(status:string)=>{
      let filtersActiveDealer:LoanInterface[]=[]
      setPage(0);
      const updatedBooleanStatus=status=='Active'?true:false
      if(status){
         filtersActiveDealer=loans.filter((loanItem)=>loanItem?.isActive==updatedBooleanStatus);
        setFilteredLoans(filtersActiveDealer);
    }else     setFilteredLoans(loans);
        
    }


  // const handleApplyFilters = () => {
  //   const filters: LoanFilter = {};
    
  //   if (specificDealerId) filters.dealerId = specificDealerId;
  //   if (filterActive === 'active') filters.isActive = true;
  //   if (filterActive === 'inactive') filters.isActive = false;
  //   if (filterMinAmount) filters.minAmount = parseFloat(filterMinAmount);
  //   if (filterMaxAmount) filters.maxAmount = parseFloat(filterMaxAmount);
  //   if (filterFromDate) filters.fromDate = filterFromDate.toISOString();
  //   if (filterToDate) filters.toDate = filterToDate.toISOString();
    
  //   const filtered = LoanService.filterLoans(loans, filters);
  //   setFilteredLoans(filtered);
  //   setPage(0);
  // };

  // const handleResetFilters = () => {
  //   setFilterActive('');
  //   setFilterFromDate(null);
  //   setFilterToDate(null);
  //   setFilterMinAmount('');
  //   setFilterMaxAmount('');
  //   setFilteredLoans(loans);
  // };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

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
        <Box>
          {dealerId ? (
            <>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Loans for {dealerName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                View all loans issued to this dealer
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Loan Management
              </Typography>
              {/* <Typography variant="subtitle1" color="text.secondary">
                View and manage all loans
              </Typography> */}
            </>
          )}
        </Box>
        <Box>
          <TextField
          placeholder="Search by dealer, loan number or registration"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
           sx={{
              mr: 3,
            }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

<NgIf condition={CommonService.checkPermission(['Create Loan'])}>
<Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={() => navigate(`/add-loan`)}
             sx={{
              mr: 3,
            }}
          >
            Add New Loan
          </Button>
</NgIf>
<NgIf condition={CommonService.checkPermission(['Loans Manual Upload'])}>

  <Button
            variant="contained"
            color="primary"
            startIcon={<Upload />}
            onClick={() => uploadExcelButton()}  
          >
            Upload Excel File
            <input
              type="file"
              hidden
              accept=".xls,.xlsx"
              onChange={(e) => handleExcelFileUpload(e)}
              ref={inputUploadExcelFileRef}
            />
          </Button>
</NgIf>
         
       
        
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card onClick={()=>statusBehalfFilterDdrList('')}
            sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)",cursor:'pointer' }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                {/* <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} /> */}
                <Typography variant="body2" color="text.secondary">
                  Total Loans
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {summaryStats.totalLoans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <NgIf condition={CommonService.checkPermission(['Active Loan QUEUE'])}>
 <Grid item xs={12} md={3}>
          <Card onClick={()=>statusBehalfFilterDdrList('Active')}
            sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)",cursor:'pointer' }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Loans
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {summaryStats.activeLoans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        </NgIf>
       
       <NgIf condition={CommonService.checkPermission(['Closed Loan QUEUE'])}>
 <Grid item xs={12} md={3}>
          <Card onClick={()=>statusBehalfFilterDdrList('Inactive')}
            sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)",cursor:'pointer' }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Closed Loans
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {summaryStats.inactiveLoans}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

       </NgIf>
       
        <Grid item xs={12} md={3}>
          <Card
            sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Fair Market Value
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {summaryStats.totalVehicleValue.toLocaleString("en-US", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: "none", justifyContent: "space-between" }}>
        
        {/* <Button
          startIcon={<FilterListIcon />}
          variant="outlined"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button> */}
      </Box>

      {/* Filter Panel */}
      {/* {showFilters && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Filter Loans
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterActive}
                  label="Status"
                  onChange={(e) => setFilterActive(e.target.value as string)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Min Amount"
                type="number"
                fullWidth
                size="small"
                value={filterMinAmount}
                onChange={(e) => setFilterMinAmount(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Max Amount"
                type="number"
                fullWidth
                size="small"
                value={filterMaxAmount}
                onChange={(e) => setFilterMaxAmount(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button variant="outlined" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button variant="contained" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </Box>
        </Paper>
      )} */}

      {/* Loan List */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>Loan Number</TableCell>
                    {!dealerId && <TableCell>Dealer</TableCell>}
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Interest Rate</TableCell>
                    <TableCell>Withdraw Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLoans
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((loan) => (
                      <TableRow hover key={loan.id}>
                        <TableCell>{loan.loanNumber}</TableCell>
                        {!dealerId && (
                          <TableCell>{loan?.dealer?.dealershipName}</TableCell>
                        )}
                        <TableCell>
                          {loan.vehicleInfo ? (
                            <Tooltip
                              title={`${loan.vehicleInfo.make} ${loan.vehicleInfo.model} (${loan.vehicleInfo.year})`}
                            >
                              <span>{loan.vehicleInfo.registrationNumber}</span>
                            </Tooltip>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          {loan?.amount?.toLocaleString("en-US", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </TableCell>
                        <TableCell>{loan.interestRate}%</TableCell>
                        <TableCell>
                          {formatDate(loan.dateOfWithdraw ?? "")}
                        </TableCell>
                        <TableCell>{formatDate(loan.dueDate ?? "")}</TableCell>
                        <TableCell>
                          <Chip
                            label={loan.status}
                            size="small"
                             color={
                              loan.status === 'Active' ? 'success' :
                                loan.status === 'Overdue' ? 'error' : 'default'
                            }
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <NgIf condition={CommonService.checkPermission(['View Loans'])}>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigate(`/loan-details/${btoa(loan?.id?.toString())}`)
                                }
                                sx={{ color: "#1e3a8a" }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                          </NgIf>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredLoans.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={dealerId ? 8 : 9}
                        align="center"
                        sx={{ py: 3 }}
                      >
                        No loans found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5,10,20,50,100]}
              component="div"
              showFirstButton
              count={filteredLoans.length}
              rowsPerPage={rowsPerPage}
              page={page}
              showLastButton
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
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
    </MainLayout>
  );
};

export default LoanListing;