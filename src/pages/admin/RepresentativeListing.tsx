import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import {
  AddOrUpdateRepresentativeData,
  Representative,
} from "../../service/models/Representative.model";
import APIService from "../../service/API";
import { Close, PersonAdd } from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import { Roles } from "../../service/models/Roles.model";
import NgIf from "../../components/NgIf";
import CommonService from "../../service/CommonService";
let selectedRepresentative: any,
  loadingRoles = false;
interface FormErrors {
  id?: number;
  name?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  userType?: string;
  userStatus?: string;
  isActive?: boolean;
  roleId?: string;
  isRepresentative?:boolean;
}
const RepresentativeListing: React.FC = () => {
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [filteredRepresentatives, setFilteredRepresentatives] = useState<
    Representative[]
  >([]);
  const [isListloading, setIsListLoading] = useState<boolean>(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [errorMsg, setError] = useState<string>("");
  const [successMsg, setSuccess] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [allRolesList, setAllRolesList] = useState<Roles[]>([]);

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [isAddOrEditDialogOpen, setAddOrEditDialogOpen] =
    useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [representativeFormData, setRepresentativeFormData] =
    useState<AddOrUpdateRepresentativeData>({
      id: 0,
      name: "",
      email: "",
      username: "",
      phoneNumber: "",
      isActive: true,
      userStatus: "Active",
      roleId: 0,
      isRepresentative:false,
      designation:""
    });
    const [designationOptions, setDesignationOptions] = useState<Object[]>([]);

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        setIsListLoading(true);
        const allRepresentatives = await APIService.getAllRepresentatives();
        const designationOptions = await APIService.getDesignations();
        setRepresentatives(allRepresentatives);
        setDesignationOptions(designationOptions);
        setFilteredRepresentatives(allRepresentatives);
        setIsListLoading(false);
      } catch (err) {
        setIsListLoading(false);
      }
    };

    fetchRepresentatives();
  }, []);
  useEffect(() => {
    const filtered = representatives.filter(
      (rep) =>
        rep?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep?.phoneNumber?.includes(searchTerm)
    );
    setFilteredRepresentatives(filtered);
    setPage(0);
  }, [searchTerm, representatives]);

  const summaryStats = {
    totalRepresentatives: representatives.length,
    activeRepresentatives: representatives.filter((rep) => rep.isActive).length,
    inactiveRepresentatives: representatives.filter((rep) => !rep.isActive)
      .length,
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = async (id: number) => {
    try {
      const individulaRepresentative = await APIService.getRepresentativeById(
        id
      );
      selectedRepresentative = individulaRepresentative;
      setViewDialogOpen(true);
    } catch (err) {
      setError("Failed to fetch representative details..!");
    }
  };

  const getInitialFormData = (representative?: Representative) => ({
    id: representative?.id ?? 0,
    name: representative?.name ?? "",
    email: representative?.email ?? "",
    username: representative?.username ?? "",
    phoneNumber: representative?.phoneNumber ?? "",
    isActive: representative?.isActive ?? false,
    userStatus: representative?.isActive ? "Active" : "Inactive",
    roleId: representative?.role?.id ?? 0,
    isRepresentative:representative?.isRepresentative ?? false,
  });

  const loadRoles = async () => {
    try {
      let rolesData = await APIService.getAllRoles();
      rolesData = rolesData.filter((rolesItem) => rolesItem?.name);
      setAllRolesList(rolesData);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to load roles. Please try again."
      );
    } finally {
      loadingRoles = false;
    }
  };

  const handleOpen = async (representative?: Representative) => {
    setFormErrors({});
    setRepresentativeFormData(getInitialFormData(representative));
    await loadRoles();
    setAddOrEditDialogOpen(true);
  };

  const handleEditOpen = async (representative: Representative) => {
    await handleOpen(representative);
  };

  const handleAddOpen = async () => {
    await handleOpen();
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!representativeFormData.name.trim()) errors.name = "Name is required";
    if (!representativeFormData?.email.trim())
      errors.email = "Email ID is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(representativeFormData.email))
      errors.email = "Invalid email id";
    if (!representativeFormData?.phoneNumber.trim())
      errors.phoneNumber = "Phone No. is required";
    else if (!/^\d{10}$/.test(representativeFormData.phoneNumber))
      errors.phoneNumber = "Invalid Phone No.";
    if (!representativeFormData.roleId) errors.roleId = "Role is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsFormLoading(true);
    setError("");

    try {
      representativeFormData.username = representativeFormData.email;
      representativeFormData.isActive =
        representativeFormData.userStatus == "Active" ? true : false;
      if (representativeFormData?.id)
        await APIService.updateRepresentative(
          representativeFormData?.id,
          representativeFormData
        );
      else await APIService.createRepresentative(representativeFormData);
      const allRepresentatives = await APIService.getAllRepresentatives();
      setRepresentatives(allRepresentatives);
      setFilteredRepresentatives(allRepresentatives);
      setSuccess(
        `Staff ${
          !representativeFormData?.id ? "added" : "updated"
        } successfully..!`
      );
      setAddOrEditDialogOpen(false);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          `Failed to ${
          !representativeFormData?.id ? "adding" : "updaing"
        } Staff. Please try again.`
      );
    } finally {
      setIsFormLoading(false);
    }
  };
  const statusBehalfFilterDealersList = (status: string) => {
    let filtersActiveDealer: Representative[] = [];
    setPage(0);
    if (status) {
      const updatedStatus = status == "Active" ? true : false;
      filtersActiveDealer = representatives.filter(
        (representiveItem) => representiveItem?.isActive == updatedStatus
      );
      setFilteredRepresentatives(filtersActiveDealer);
    } else setFilteredRepresentatives(representatives);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRepresentative?.id) return;

    try {
      await APIService.deleteRepresentative(selectedRepresentative?.id);

      // Update local state
      const updatedRepresentatives = await APIService.getAllRepresentatives();

      setRepresentatives(updatedRepresentatives);
      setFilteredRepresentatives(updatedRepresentatives);

      setDeleteDialogOpen(false);
      setSuccess("Staff deleted successfully");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to add staff. Please try again."
      );
    }
  };
  const handleInputChange = (
    field: keyof AddOrUpdateRepresentativeData,
    value: string | number|boolean
  ) => {
    setRepresentativeFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Staff Management
        </Typography>
        <Box display="flex" justifyContent="flex-end">
          <TextField
            placeholder="Search by name, email or phone"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <NgIf condition={CommonService.checkPermission(["Create Staff"])}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAdd />}
              onClick={handleAddOpen}
            >
              Add Staff
            </Button>
          </NgIf>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card
            onClick={() => statusBehalfFilterDealersList("")}
            sx={{
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="body2" color="text.secondary">
                  Total Staff
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {summaryStats.totalRepresentatives}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            onClick={() => statusBehalfFilterDealersList("Active")}
            sx={{
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PersonIcon sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="body2" color="text.secondary">
                  Active Staff
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {summaryStats.activeRepresentatives}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            onClick={() => statusBehalfFilterDealersList("Inactive")}
            sx={{
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PersonIcon sx={{ mr: 1, color: "error.main" }} />
                <Typography variant="body2" color="text.secondary">
                  Inactive Staff
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {summaryStats.inactiveRepresentatives}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        {isListloading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRepresentatives
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((rep) => (
                      <TableRow hover key={rep.id}>
                        <TableCell>{rep.id}</TableCell>
                        <TableCell>{rep?.name}</TableCell>
                        <TableCell>{rep?.email}</TableCell>
                        <TableCell>{rep?.phoneNumber}</TableCell>
                        <TableCell>{rep?.role?.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={rep.isActive ? "Active" : "Inactive"}
                            size="small"
                            color={rep.isActive ? "success" : "default"}
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(rep?.id ?? 0)}
                                sx={{ color: "#1e3a8a" }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <NgIf
                              condition={CommonService.checkPermission([
                                "Edit Staff",
                              ])}
                            >
                              <Tooltip title="Edit Staff">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditOpen(rep)}
                                  sx={{ color: "#2e7d32" }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </NgIf>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredRepresentatives.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        No staffs found
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
              count={filteredRepresentatives.length}
              rowsPerPage={rowsPerPage}
              page={page}
              showLastButton
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Staff Details</DialogTitle>
        <DialogContent dividers>
          {selectedRepresentative && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {selectedRepresentative?.name}
                </Typography>
              </Grid>
              
              <Grid
                item
                xs={12}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {selectedRepresentative?.email}
                  </Typography>
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1">
                    {selectedRepresentative?.phoneNumber}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Designation
                </Typography>
                <Typography variant="body1">
                  {selectedRepresentative?.designation}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1">
                  {selectedRepresentative?.role?.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={
                    selectedRepresentative?.isActive ? "Active" : "Inactive"
                  }
                  size="small"
                  color={
                    selectedRepresentative?.isActive ? "success" : "default"
                  }
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAddOrEditDialogOpen}
        onClose={() => setAddOrEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            {representativeFormData?.id ? "Edit" : "Add"} Staff
          </Typography>
          <IconButton
            onClick={() => setAddOrEditDialogOpen(false)}
            sx={{ color: "black" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            margin="dense"
            required
            fullWidth
            label="Name"
            autoComplete="off"
            autoFocus
            size="small"
            value={representativeFormData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={!!formErrors?.name}
            helperText={formErrors?.name}
            sx={{ pb: 2 }}
          />
         
          <TextField
            required
            fullWidth
            label="Email Address"
            autoComplete="email"
            size="small"
            value={representativeFormData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={!!formErrors?.email}
            helperText={formErrors?.email}
            sx={{ pb: 2 }}
          />
          <TextField
            margin="dense"
            required
            fullWidth
            label="Phone Number"
            autoComplete="tel"
            size="small"
            value={representativeFormData.phoneNumber}
            onChange={(e) =>
              handleInputChange(
                "phoneNumber",
                isNaN(Number(e.target.value)) ? "" : String(e.target.value)
              )
            }
            error={!!formErrors?.phoneNumber}
            helperText={formErrors?.phoneNumber}
            inputProps={{ maxLength: 10 }}
            sx={{ pb: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ pb: 2 }}>
            <InputLabel id="User-Status-label">Status</InputLabel>
            <Select
              labelId="User-Status-label"
              value={representativeFormData.userStatus}
              onChange={(e) => handleInputChange("userStatus", e.target.value)}
              label="Status"
            >
              <MenuItem value={"Active"}>Active</MenuItem>
              <MenuItem value={"Inactive"}>Inactive</MenuItem>
            </Select>
          </FormControl>
          {/* <TextField
            margin="dense"
            required
            fullWidth
            label="Designation"
            autoComplete="off"
            autoFocus
            size="small"
            value={representativeFormData.designation}
            onChange={(e) => handleInputChange("designation", e.target.value)}
            error={!!formErrors?.designation}
            helperText={formErrors?.designation}
            sx={{ pb: 2 }}
          /> */}
            <FormControl fullWidth size="small" sx={{ pb: 2 }}>
            <InputLabel id=" Role-Label">Designation</InputLabel>
            <Select
              labelId=" Role-Label"
              name="designation"
              value={representativeFormData.designation}
              onChange={(e) =>
                handleInputChange("designation", e.target.value)
              }
              label="Designation"
            >
              {designationOptions?.map((designationItem) => (
                <MenuItem key={designationItem?.id} value={designationItem?.name}>
                  {designationItem?.name}
                </MenuItem>
              ))}
            </Select>
            {formErrors?.designation && (
              <FormHelperText error>{formErrors?.designation}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth size="small" sx={{ pb: 2 }}>
            <InputLabel id=" Role-Label">Role</InputLabel>
            <Select
              labelId=" Role-Label"
              name="relationshipManager"
              value={representativeFormData.roleId}
              onChange={(e) =>
                handleInputChange("roleId", Number(e.target.value) ?? 0)
              }
              label="Role"
            >
              {allRolesList?.map((roleItem) => (
                <MenuItem key={roleItem?.id} value={roleItem?.id}>
                  {roleItem?.name}
                </MenuItem>
              ))}
            </Select>
            {formErrors?.roleId && (
              <FormHelperText error>{formErrors?.roleId}</FormHelperText>
            )}
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={representativeFormData.isRepresentative}
                onChange={(e) =>
                  handleInputChange("isRepresentative", e.target.checked)
                }
              />
            }
            label="Is Representative"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setAddOrEditDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isFormLoading}
            startIcon={isFormLoading ? <CircularProgress size={20} /> : null}
          >
            {isFormLoading
              ? "Loading ..."
              : representativeFormData?.id
              ? "Edit Staff"
              : "Add Staff"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Representative Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete staff "
            {selectedRepresentative?.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={3000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {errorMsg}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default RepresentativeListing;
