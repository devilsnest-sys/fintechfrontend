import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Box,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
  TablePagination,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import {Search,Refresh} from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import {
  AccessTime,
  AccountBalanceWallet,
  Assignment,
  Autorenew,
  Block,
  CheckCircle,
  CurrencyRupee,
  Description,
  DoneAll,
  ExitToApp,
  Gavel,
  Group,
  HourglassEmpty,
  Inventory2,
  QueryStats,
  ReceiptLong,
  Savings,
  ShowChart,
  StackedLineChart,
  Straighten,
  Timeline,
  Today,
  TrendingUp,
} from "@mui/icons-material";
import APIService from "../../service/API";
import { DashboardSummaryInterface, LoanInterface } from "../../service/models/Loan.model";
import NgIf from "../../components/NgIf";
import CommonService from "../../service/CommonService";
const maxDate = new Date();
export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  loading?: boolean;
}

interface CustomRange {
  fromDate?: string;
  toDate?: string;
}

interface DashboardMetrics {
  totalSanctionAmount: number;
  totalAvailableLimit: number;
  disbursementPerDay: number;
  amountReceived: number;
  utilizationPercentage: number;
  totalNoOfLoans: number;
  closedLoans: number;
  interestEarned: number;
  delayInterestEarned: number;
  pfEarned: number;
  totalEarnedIncome: number;
  loanPerDay: number;
  totalDisbursement: number;
  totalInterest: number;
  totalDelayInterest: number;
  totalPF: number;
  totalIncome: number;
  totalDealers: number;
  avgSanctionLimit: number;
  activeDealers: number;
  blockHoldDealer: number;
  closedDealers: number;
  outstanding: number;
  principalOutstanding: number;
  activeLoans: number;
  interestAccrued: number;
  delayInterestAccrued: number;
  pfAccrued: number;
  totalAccruedInterest: number;
}

const defaultDateRange: CustomRange = {
  fromDate: new Date().toISOString().split("T")[0],
  toDate: new Date().toISOString().split("T")[0],
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = "#1e3a8a",
  loading = false,
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent sx={{ paddingBottom: "16px !important" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", height: 40 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ mt: 1, fontWeight: "bold" }}
                >
                  {value}
                </Typography>
              </>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}15`, // Light color with 15% opacity
              color: color,
              p: 1,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const getDashboardMetrics = (
  dealers: any[],
  loans: LoanInterface[],
  summaryData: DashboardSummaryInterface
): DashboardMetrics => {
  
  // Initialize metrics object
  const metrics: DashboardMetrics = {
    totalSanctionAmount: summaryData?.totalSanctionLimit || 0,
    totalAvailableLimit: summaryData?.availableLimit || 0,
    disbursementPerDay: 0,
    amountReceived: summaryData?.totalPrincipalPaid || 0,
    utilizationPercentage: summaryData.UtilizationPercent,
    totalNoOfLoans: loans.length,
    closedLoans: 0,
    interestEarned: summaryData.totalInterestEarned,
    delayInterestEarned: 0,
    pfEarned: 0,
    totalEarnedIncome: 0,
    loanPerDay: 0,
    totalDisbursement:  summaryData?.totalLoanAmount || 0,
    totalInterest: 0,
    totalDelayInterest: 0,
    totalPF: 0,
    totalIncome: 0,
    totalDealers: dealers.length,
    avgSanctionLimit: 0,
    activeDealers: 0,
    blockHoldDealer: 0,
    closedDealers: 0,
    outstanding: 0,
    principalOutstanding: summaryData?.totalAmountPending || 0,
    activeLoans: 0,
    interestAccrued: 0,
    delayInterestAccrued: 0,
    pfAccrued: 0,
    totalAccruedInterest: 0,
  };

  // Calculate metrics from dealers data
  dealers.forEach((dealer) => {
    metrics.totalSanctionAmount += dealer.sanctionAmount || 0;
    metrics.totalAvailableLimit += dealer.availableLimit || 0;
    metrics.outstanding += dealer.outstandingAmount || 0;
    metrics.principalOutstanding += dealer.principalOutstanding || 0;

    if (dealer.status === "Active") {
      metrics.activeDealers++;
    } else if (dealer.status === "Blocked" || dealer.status === "Hold") {
      metrics.blockHoldDealer++;
    } else if (dealer.status === "Closed") {
      metrics.closedDealers++;
    }

    // Calculate accrued metrics
    metrics.interestAccrued += dealer.interestAccrued || 0;
    metrics.delayInterestAccrued += dealer.delayInterestAccrued || 0;
    metrics.pfAccrued += dealer.pfAcrued || 0;

    // Calculate received metrics
    metrics.interestEarned += dealer.interestReceived || 0;
    metrics.delayInterestEarned += dealer.delayInterestReceived || 0;
    metrics.pfEarned += dealer.pfReceived || 0;
    metrics.amountReceived += dealer.amountReceived || 0;
  });

  // Calculate metrics from loans data
  loans.forEach((loan) => {
    metrics.totalDisbursement += loan.amount || 0;
    metrics.totalPF += loan.processingFee || 0;

    // Calculate expected interest (simplified)
    const loanAmount = loan.amount || 0;
    const interestRate = loan.interestRate || 0;
    // Assuming average loan term of 30 days for calculation
    const estimatedInterest = (loanAmount * interestRate * 30) / (100 * 365);
    metrics.totalInterest += estimatedInterest;

    if (loan.isActive) {
      metrics.activeLoans++;
    } else {
      metrics.closedLoans++;
    }
  });

  // Calculate derived metrics
  if (metrics.totalDealers > 0) {
    metrics.avgSanctionLimit =
      metrics.totalSanctionAmount / metrics.totalDealers;
  }

  if (metrics.totalSanctionAmount > 0) {
    metrics.utilizationPercentage =
      (metrics.outstanding / metrics.totalSanctionAmount) * 100;
  }

  // Calculate total earned and accrued income
  metrics.totalEarnedIncome =
    metrics.interestEarned + metrics.delayInterestEarned + metrics.pfEarned;
  metrics.totalAccruedInterest =
    metrics.interestAccrued + metrics.delayInterestAccrued + metrics.pfAccrued;
  metrics.totalIncome =
    metrics.totalInterest + metrics.totalDelayInterest + metrics.totalPF;

  // Calculate loans per day (assuming 30-day period for simplicity)
  metrics.loanPerDay = metrics.totalNoOfLoans / 30;
  metrics.disbursementPerDay = metrics.totalDisbursement / 30;

  return metrics;
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState<any[]>([]);
  const [loans, setLoans] = useState<LoanInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [selectedDealerId, setSelectedDealerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDealers, setFilteredDealers] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dashboardCards, setDashboardCards] = useState<StatCardProps[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryInterface[]>([]);


  const [selectedTabIndex, setTabIndex] = useState(0);
  const [fromDateAndToDateObj, setFromDateAndToDateObj] =
    useState(defaultDateRange);

  // Format number for display
  const formatNumber = (value: number): string => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `${(value / 100000).toFixed(2)} L`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} K`;
    }
    return value.toFixed(2).toString();
  };

  // Format percentage for display
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Process dashboard data and create cards
  const processDashboardData = (metrics: DashboardMetrics) => {
    // First section of cards
    const firstSection: StatCardProps[] = [
      {
        title: "Total Sanction Amount",
        value: formatNumber(metrics.totalSanctionAmount),
        icon: <Gavel />,
        color: "#3F51B5",
      },
      {
        title: "Total Available Limit",
        value: formatNumber(metrics.totalAvailableLimit),
        icon: <CurrencyRupee />,
        color: "#4CAF50",
      },
      {
        title: "Disbursement per Day",
        value: formatNumber(metrics.disbursementPerDay),
        icon: <QueryStats />,
        color: "#4CAF50",
      },
      {
        title: "Amount Received",
        value: formatNumber(metrics.amountReceived),
        icon: <DoneAll />,
        color: "#388E3C",
      },
      {
        title: "Utilization %",
        value: formatPercentage(metrics.utilizationPercentage),
        icon: <ShowChart />,
        color: "#673AB7",
      },
      {
        title: "Total No. of Loans",
        value: metrics.totalNoOfLoans.toString(),
        icon: <Description />,
        color: "#607D8B",
      },
      {
        title: "Closed Loans",
        value: metrics.closedLoans.toString(),
        icon: <Autorenew />,
        color: "#009688",
      },
      {
        title: "Interest Earned",
        value: formatNumber(metrics.interestEarned),
        icon: <TrendingUp />,
        color: "#8BC34A",
      },
      {
        title: "Delay Interest Earned",
        value: formatNumber(metrics.delayInterestEarned),
        icon: <AccessTime />,
        color: "#F44336",
      },
      {
        title: "PF Earned",
        value: formatNumber(metrics.pfEarned),
        icon: <ReceiptLong />,
        color: "#9C27B0",
      },
      {
        title: "Total Earned Income",
        value: formatNumber(metrics.totalEarnedIncome),
        icon: <Savings />,
        color: "#2E7D32",
      },
      {
        title: "Loan/Day",
        value: metrics.loanPerDay.toFixed(2),
        icon: <Today />,
        color: "#00BCD4",
      },
      {
        title: "Total Disbursement",
        value: formatNumber(metrics.totalDisbursement),
        icon: <CurrencyRupee />,
        color: "#4CAF50",
      },
      {
        title: "Total Interest",
        value: formatNumber(metrics.totalInterest),
        icon: <Timeline />,
        color: "#03A9F4",
      },
      {
        title: "Total Delay Interest",
        value: formatNumber(metrics.totalDelayInterest),
        icon: <HourglassEmpty />,
        color: "#E91E63",
      },
      {
        title: "Total PF",
        value: formatNumber(metrics.totalPF),
        icon: <Assignment />,
        color: "#9E9E9E",
      },
      {
        title: "Total Income",
        value: formatNumber(metrics.totalIncome),
        icon: <StackedLineChart />,
        color: "#607D8B",
      },
      {
        title: "Total Dealers",
        value: metrics.totalDealers.toString(),
        icon: <Group />,
        color: "#3F51B5",
      },
      {
        title: "Avg. Sanction Limit",
        value: formatNumber(metrics.avgSanctionLimit),
        icon: <Straighten />,
        color: "#00ACC1",
      },
      {
        title: "Active Dealers",
        value: metrics.activeDealers.toString(),
        icon: <Inventory2 />,
        color: "#9E9D24",
      },
      {
        title: "Block/Hold Dealer",
        value: metrics.blockHoldDealer.toString(),
        icon: <Block />,
        color: "#F44336",
      },
      {
        title: "Closed Dealers",
        value: metrics.closedDealers.toString(),
        icon: <ExitToApp />,
        color: "#9E9E9E",
      },
    ];

    // Second section of cards
    const secondSection: StatCardProps[] = [
      {
        title: "Outstanding",
        value: formatNumber(metrics.outstanding),
        icon: <TrendingUp />,
        color: "#FF9800",
      },
      {
        title: "Principal Outstanding",
        value: formatNumber(metrics.principalOutstanding),
        icon: <AccountBalanceWallet />,
        color: "#FF9800",
      },
      {
        title: "Active Loans",
        value: metrics.activeLoans.toString(),
        icon: <CheckCircle />,
        color: "#4CAF50",
      },
      {
        title: "Interest Accrued",
        value: formatNumber(metrics.interestAccrued),
        icon: <TrendingUp />,
        color: "#1E88E5",
      },
      {
        title: "Delay Interest Accrued",
        value: formatNumber(metrics.delayInterestAccrued),
        icon: <AccessTime />,
        color: "#D81B60",
      },
      {
        title: "PF Accrued",
        value: formatNumber(metrics.pfAccrued),
        icon: <ReceiptLong />,
        color: "#7B1FA2",
      },
      {
        title: "Total Accrued Interest",
        value: formatNumber(metrics.totalAccruedInterest),
        icon: <StackedLineChart />,
        color: "#455A64",
      },
    ];

    return [...firstSection, ...secondSection];
  };

  // Fetch dealers and loans
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch dealers
        const dealersData = await APIService.getAllDealers();
        setDealers(dealersData);
        setFilteredDealers(dealersData);

        // Fetch loans
        const loansData = await APIService.getAllLoans();

        // Enrich loans with dealer names
        const enrichedLoans = loansData.map((loan) => {
          const dealer = dealersData.find((d) => d.id === loan.dealerId);
          return {
            ...loan,
            dealerName: dealer?.dealershipName || "Unknown Dealer",
            status: loan.isActive ? "Active" : "Closed",
          };
        });

        setLoans(enrichedLoans);

        const summaryData = await APIService.getDashboardSummary("All"); // pass "All" or specific dealerId
        // setDashboardSummary(summaryData);

        // Calculate dashboard metrics
        const metrics = getDashboardMetrics(dealersData, enrichedLoans,summaryData);

        // Create dashboard cards
        const cards = processDashboardData(metrics);
        setDashboardCards(cards);

        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter dealers when search term changes
  useEffect(() => {
    const results = dealers.filter(
      (dealer) =>
        dealer.dealershipName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        dealer.dealerCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDealers(results);
    setPage(0);
  }, [searchTerm, dealers]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleViewDetails = (id: number) => {
    navigate(`/dealer-details/${id}`);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (buttonIndex: number) => {
    let dateRange = {
      fromDate: new Date().toISOString().split("T")[0],
      toDate: new Date().toISOString().split("T")[0],
    };
    setTabIndex(buttonIndex);
    switch (buttonIndex) {
      case 0:
        // Today
        break;
      case 1:
        // Last 7 days
        const sevenDaysBefore = new Date();
        sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
        dateRange.fromDate = sevenDaysBefore.toISOString().split("T")[0];
        break;
      case 2:
        // From Beginning - set a far past date
        dateRange.fromDate = "2000-01-01";
        break;
      default:
        break;
    }
    setFromDateAndToDateObj(dateRange);
    applyDateFilter(dateRange);
  };

  const applyDateFilter = async (dateRange: CustomRange) => {
    if (!dateRange.fromDate) {
      setErrorMsg("From Date is required");
      return;
    } else if (!dateRange.toDate) {
      setErrorMsg("To Date is required");
      return;
    } else if (new Date(dateRange.fromDate) > new Date(dateRange.toDate)) {
      setErrorMsg("From Date cannot be greater than To Date");
      return;
    }

    setLoading(true);
    try {
      // Fetch all data
      const dealersData = await APIService.getAllDealers();
      const loansData = await APIService.getAllLoans();

      // Filter loans by date range
      const filteredLoans = loansData.filter((loan) => {
        const loanDate = new Date(loan?.dateOfWithdraw ?? "");
        return (
          loanDate >= new Date(dateRange.fromDate!) &&
          loanDate <= new Date(dateRange.toDate!)
        );
      });

      // Enrich loans with dealer names
      const enrichedLoans = filteredLoans.map((loan) => {
        const dealer = dealersData.find((d) => d.id === loan.dealerId);
        return {
          ...loan,
          dealerName: dealer?.dealershipName || "Unknown Dealer",
          status: loan.isActive ? "Active" : "Closed",
        };
      });

      setLoans(enrichedLoans);
      setDealers(dealersData);
      setFilteredDealers(
        dealersData.filter(
          (dealer) =>
            dealer.dealershipName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            dealer.dealerCode?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
  const summaryData = await APIService.getDashboardSummary("All");
      // Calculate dashboard metrics based on filtered data
      const metrics = getDashboardMetrics(dealersData, enrichedLoans,summaryData);

      // Create dashboard cards
      const cards = processDashboardData(metrics);
      setDashboardCards(cards);
    } catch (err) {
      setError("Failed to filter data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyCustomRange = () => {
    applyDateFilter(fromDateAndToDateObj);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      // Refresh dealers
      const dealersData = await APIService.getAllDealers();
      setDealers(dealersData);
      setFilteredDealers(
        dealersData.filter(
          (dealer) =>
            dealer.dealershipName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            dealer.dealerCode?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      // Refresh loans
      const loansData = await APIService.getAllLoans();

      // Enrich loans with dealer names
      const enrichedLoans = loansData.map((loan) => {
        const dealer = dealersData.find((d) => d.id === loan.dealerId);
        return {
          ...loan,
          dealerName: dealer?.dealershipName || "Unknown Dealer",
          status: loan.isActive ? "Active" : "Closed",
        };
      });

      setLoans(enrichedLoans);

      // Calculate dashboard metrics
  const summaryData = await APIService.getDashboardSummary("All");
      // Calculate dashboard metrics based on filtered data
      const metrics = getDashboardMetrics(dealersData, enrichedLoans,summaryData);

      // Create dashboard cards
      const cards = processDashboardData(metrics);
      setDashboardCards(cards);
    } catch (err) {
      setError("Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Split dashboard cards into two sections for UI organization
  const firstSection = dashboardCards.slice(0, 22);
  const secondSection = dashboardCards.slice(22);

  return (
    <MainLayout>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Admin Dashboard
          </Typography>
        </div>
      </Box>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
           <NgIf
          condition={CommonService.checkPermission([
            "View Finacial Info","View Loan & Dealer Summary"
          ])}
        >
          <Button
            variant={selectedTabIndex === 0 ? "contained" : "outlined"}
            sx={{ mr: 2 }}
            onClick={() => handleTabChange(0)}
          >
            Today
          </Button>
          <Button
            variant={selectedTabIndex === 1 ? "contained" : "outlined"}
            sx={{ mr: 2 }}
            onClick={() => handleTabChange(1)}
          >
            Last 7 Days
          </Button>
          <Button
            variant={selectedTabIndex === 2 ? "contained" : "outlined"}
            sx={{ mr: 2 }}
            onClick={() => handleTabChange(2)}
          >
            From Beginning
          </Button>
          <TextField
            name="fromDate"
            type="date"
            variant="outlined"
            size="small"
            value={fromDateAndToDateObj.fromDate}
            onChange={(e) =>
              setFromDateAndToDateObj({
                ...fromDateAndToDateObj,
                fromDate: e.target.value,
              })
            }
            inputProps={{
              max: maxDate.toISOString().split("T")[0],
            }}
            sx={{ mr: 2 }}
          />

          <TextField
            name="toDate"
            type="date"
            variant="outlined"
            size="small"
            sx={{ mr: 2 }}
            value={fromDateAndToDateObj.toDate}
            onChange={(e) =>
              setFromDateAndToDateObj({
                ...fromDateAndToDateObj,
                toDate: e.target.value,
              })
            }
            inputProps={{
              max: maxDate.toISOString().split("T")[0],
            }}
          />
          <Button variant="contained" onClick={applyCustomRange}>
            Search
          </Button>
        </NgIf>
          
        </div>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <NgIf
          condition={CommonService.checkPermission([
            "View Finacial Info",
          ])}
        >
          {firstSection.map((dashboardCount) => (
            <Grid item xs={12} md={3} key={dashboardCount.title}>
              <StatCard
                title={dashboardCount.title}
                value={loading ? "..." : dashboardCount.value}
                icon={dashboardCount.icon}
                loading={loading}
                color={dashboardCount.color}
              />
            </Grid>
          ))}
        </NgIf>

        {/* Divider between sections */}

         <NgIf
          condition={CommonService.checkPermission([
            "View Loan & Dealer Summary",
          ])}
        >
           <Grid item xs={12}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Active Loans And Dealers
            </Typography>
          </Divider>
        </Grid>

        {secondSection.map((dashboardCount) => (
          <Grid item xs={12} md={3} key={dashboardCount.title}>
            <StatCard
              title={dashboardCount.title}
              value={loading ? "..." : dashboardCount.value}
              icon={dashboardCount.icon}
              loading={loading}
              color={dashboardCount.color}
            />
          </Grid>
        ))}
        </NgIf>
       
      </Grid>
      <NgIf condition={CommonService.checkPermission(["View Top 10 Dealers"])}>
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
          <TextField
            placeholder="Search dealers by name or code"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: "50%" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Box>
            <Button
              startIcon={<Refresh />}
              variant="contained"
              onClick={refreshData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        <Paper sx={{ borderRadius: 2, mb: 3, overflow: "hidden" }}>
          <Box
            sx={{ p: 2, bgcolor: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}
          >
            <Typography variant="h6">Top 10 Dealers</Typography>
          </Box>

          {error && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="error">{error}</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={refreshData}>
                Try Again
              </Button>
            </Box>
          )}

          {!error && (
            <Grid container>
              <Grid
                item
                xs={12}
                md={12}
                sx={{ borderRight: { md: "1px solid #e0e0e0" } }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: "medium" }}
                  >
                    Dealers
                  </Typography>

                  {loading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 4 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Dealer Name</TableCell>
                              <TableCell>Dealer Code</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Outstanding Amount</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredDealers
                              .slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage
                              )
                              .map((dealer) => (
                                <TableRow
                                  key={dealer.id}
                                  hover
                                  selected={selectedDealerId === dealer.id}
                                  onClick={() => setSelectedDealerId(dealer.id)}
                                  sx={{
                                    cursor: "pointer",
                                    "&.Mui-selected": {
                                      backgroundColor:
                                        "rgba(30, 58, 138, 0.08)",
                                    },
                                    "&.Mui-selected:hover": {
                                      backgroundColor:
                                        "rgba(30, 58, 138, 0.12)",
                                    },
                                  }}
                                >
                                  <TableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 28,
                                          height: 28,
                                          mr: 1,
                                          bgcolor: "#1e3a8a",
                                        }}
                                      >
                                        {dealer.dealershipName.charAt(0)}
                                      </Avatar>
                                      {dealer.dealershipName}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    {dealer.dealerCode || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={dealer.status}
                                      size="small"
                                      sx={{
                                        bgcolor:
                                          dealer.status === "Active"
                                            ? "success.light"
                                            : dealer.status === "Inactive"
                                            ? "error.light"
                                            : "warning.light",
                                        color:
                                          dealer.status === "Active"
                                            ? "success.dark"
                                            : dealer.status === "Inactive"
                                            ? "error.dark"
                                            : "warning.dark",
                                        fontWeight: 500,
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    ₹
                                    {(
                                      dealer.outstandingAmount || 0
                                    ).toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                      <Tooltip title="View Details">
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleViewDetails(dealer.id)
                                          }
                                          sx={{ color: "#1e3a8a" }}
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            {filteredDealers.length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  align="center"
                                  sx={{ py: 3 }}
                                >
                                  {loading ? "Loading..." : "No dealers found"}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <TablePagination
                        component="div"
                        count={filteredDealers.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                      />
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </Paper>
      </NgIf>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorMsg("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default AdminDashboard;
