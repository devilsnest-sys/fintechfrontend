import React, { useState, useEffect, useRef } from "react";
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
  Avatar,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import { AddCircleOutline } from "@mui/icons-material";
import APIService from "../../../service/API";
import { Dealer, dealerStatusCountsList } from "../../../service/models/Dealer.model";
import { useDealerContext } from '../../../context/DealerContext';
import CommonService from "../../../service/CommonService";
import NgIf from "../../../components/NgIf";

const DealerListing: React.FC = () => {
  const { refreshFlag } = useDealerContext();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [filteredDealers, setFilteredDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDealers();
  }, [refreshFlag]);

const fetchDealers = async () => {
  try {
    setLoading(true);
    const data = await APIService.getAllDealers();

    // Sort with 'Pending' or 'New' status first
    const sortedDealers = [...data].sort((a, b) => {
      const priority = ['Pending', 'New', 'Under Process', 'Active', 'Inactive', 'Rejected'];
      return priority.indexOf(a.status) - priority.indexOf(b.status);
    });

    setDealers(sortedDealers);

    // By default show active dealers
    const filtersActiveDealer = sortedDealers.filter(
      (dealerItem) => dealerItem.status === "Pending"
    );  
    setFilteredDealers(filtersActiveDealer);
    setLoading(false);
  } catch (err) {
    setLoading(false);
  }
};


  useEffect(() => {
const results = dealers.filter(
  (dealer) =>
    dealer.dealershipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.dealerCode.toLowerCase().includes(searchTerm.toLowerCase())
);

// Sort so "New" or "Pending" dealers come first
const sortedResults = [...results].sort((a, b) => {
  const priority = ['New', 'Pending', 'Under Process', 'Active', 'Inactive', 'Rejected'];
  return priority.indexOf(a.status) - priority.indexOf(b.status);
});

setFilteredDealers(sortedResults);

    setPage(0);
  }, [searchTerm]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (id: number) => {
    navigate(`/dealer-details/${btoa(String(id))}`);
  };

  const handleEditDealer = (id: number) => {
    navigate(`/dealer-onboarding/${btoa(String(id))}`);
  };

  const handleOpenAddDealer = () => {
    navigate("/dealer-onboarding");
  };

  const statusBehalfFilterDealersList = (status: string) => {
    let filtersActiveDealer: Dealer[] = [];
    setPage(0);
    if (status) {
      filtersActiveDealer = dealers.filter(
        (dealerItem) => dealerItem?.status == status
      );
      setFilteredDealers(filtersActiveDealer);
    } else setFilteredDealers(dealers);
  };

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

  // Placeholder calculations since the new API doesn't include these fields

  const returnCountBasisOfStatus=(statusName:string)=>{
let statusCounts=0
if(!statusName)
{
  return dealers?.length
}
 statusCounts=dealers.filter((d) => d.status === statusName).length;
 return statusCounts
  }

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
            Dealer Management
          </Typography>
          {/* <Typography variant="subtitle1" color="text.secondary">
            View and manage all registered dealers
          </Typography> */}
        </div>
        <Box justifyContent="right" display="flex">
          <TextField
            placeholder="Search by name or code"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            sx={{ ml: 2 }}
            onClick={handleOpenAddDealer}
            startIcon={<AddCircleOutline />}
          >
            Add Dealer
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {dealerStatusCountsList.map((statusItem) => (
          CommonService.checkPermission(statusItem?.permissionList)&&<Box
            key={statusItem.name}
            onClick={() => statusBehalfFilterDealersList(statusItem.value)}
            sx={{
              borderRadius: 2,
              m: 1,
              bgcolor: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            <Box sx={{ p: 1, display: "flex" }}>
              <Typography
                display="flex"
                alignItems={"center"}
                variant="body2"
                color="text.secondary"
              >
                {statusItem.name}
              </Typography>
              <Typography sx={{ fontWeight: "bold", ml: 1 }}>
                {returnCountBasisOfStatus(statusItem?.value)}
              </Typography>
            </Box>
          </Box>
          
          
        ))}
      </Grid>

      {/* Dealer List */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>S.No</TableCell>
                    <TableCell>Dealer</TableCell>
                    <TableCell>Dealer Code</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Entity Type</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDealers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((dealer, index) => (
                      <TableRow hover key={dealer.id}>
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
                              {dealer.dealershipName.charAt(0)}
                            </Avatar>
                            {dealer.dealershipName}
                          </Box>
                        </TableCell>
                        <TableCell>{dealer.dealerCode}</TableCell>
                        <TableCell>
                          <Chip
                            label={dealer.status}
                            size="small"
                            color={getStatusColor(dealer.status) as any}
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>{dealer.entity}</TableCell>
                        <TableCell>{dealer.contactNo}</TableCell>
                         <TableCell>{dealer.city}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(dealer.id)}
                                sx={{ color: "#1e3a8a" }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <NgIf
                              condition={
                                dealer?.status != "Active" &&
                                 dealer?.status != "Rejected"&&
                                CommonService.checkPermission(["Edit Dealers"])
                              }
                            >
                              <Tooltip title="Edit Dealer">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditDealer(dealer.id)}
                                  sx={{ color: "#2e7d32" }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </NgIf>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredDealers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        No dealers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 50, 100]}
              component="div"
              showFirstButton
              count={filteredDealers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              showLastButton
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </MainLayout>
  );
};

export default DealerListing;
