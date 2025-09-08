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
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import APIService from "../../../service/API";
import { Close } from "@mui/icons-material";
import MainLayout from "../../../components/layout/MainLayout";
import { AddOrUpdateRole, Roles } from "../../../service/models/Roles.model";
import { useNavigate } from "react-router-dom";
import NgIf from "../../../components/NgIf";
import CommonService from "../../../service/CommonService";
interface FormErrors {
  id?: number;
  name?: string;
  isActive?: boolean;
}
const RolesListing: React.FC = () => {
  const [allRoleList, setAllRoleList] = useState<Roles[]>([]);
  const [filteredRoleList, setFilteredRoleList] = useState<Roles[]>([]);
  const [isListloading, setIsListLoading] = useState<boolean>(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [errorMsg, setError] = useState<string>("");
  const [successMsg, setSuccess] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Dialog states
  const [isAddOrEditDialogOpen, setAddOrEditDialogOpen] =
    useState<boolean>(false);
  const [roleFormData, setRoleFormData] = useState<AddOrUpdateRole>({
    id: 0,
    name: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsListLoading(true);
        const allRoleList = await APIService.getAllRoles();
        setAllRoleList(allRoleList);
        setFilteredRoleList(allRoleList);
        setIsListLoading(false);
      } catch (err) {
        setIsListLoading(false);
      }
    };

    fetchRoles();
  }, []);
  useEffect(() => {
    const filtered = allRoleList.filter((rep) =>
      rep?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoleList(filtered);
    setPage(0);
  }, [searchTerm, allRoleList]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleAddOpen = async () => {
    setRoleFormData({
      id: 0,
      name: "",
    });
    setFormErrors({});
    setAddOrEditDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!roleFormData.name.trim()) errors.name = "Name is required";

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
      // if (roleFormData?.id)
      //   await APIService.updateRole(roleFormData?.id, roleFormData);
      // else await APIService.createRole(roleFormData);

      await APIService.createRole(roleFormData);
      const allRoleList = await APIService.getAllRoles();
      setAllRoleList(allRoleList);
      setFilteredRoleList(allRoleList);
      setSuccess(
        `Role ${roleFormData?.id ? "added" : "updated"} successfully..!`
      );
      setAddOrEditDialogOpen(false);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to add role. Please try again."
      );
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleInputChange = (field: keyof AddOrUpdateRole, value: string) => {
    setRoleFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  return (
    <MainLayout>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Roles Management
        </Typography>
        {/* <Typography variant="subtitle1" color="text.secondary">
          View and manage roles
        </Typography> */}
        <Box display="flex" justifyContent="flex-end">
          <TextField
            placeholder="Search by role name"
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
          <NgIf condition={CommonService.checkPermission(["Create Role"])}>
            <Button variant="contained" color="primary" onClick={handleAddOpen}>
              Add Role
            </Button>
          </NgIf>
        </Box>
      </Box>

      {/* Role List */}
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
                    <TableCell>Name</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRoleList
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((rep) => (
                      <TableRow hover key={rep.id}>
                        <TableCell>{rep?.name}</TableCell>
                        <TableCell>
                          <NgIf condition={CommonService.checkPermission(['Edit Role'])}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              navigate(`/modify-permission/${btoa(String(rep.id))}`)
                            }
                          >
                            Modify Permission
                          </Button>
                          </NgIf>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredRoleList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        No Roles found
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
              count={filteredRoleList.length}
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
        open={isAddOrEditDialogOpen}
        onClose={() => setAddOrEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            // bgcolor: "primary.main",
            // color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            {roleFormData?.id ? "Edit" : "Add"} Role
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
            value={roleFormData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={!!formErrors?.name}
            helperText={formErrors?.name}
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
              : roleFormData?.id
              ? "Edit Role"
              : "Add Role"}
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

export default RolesListing;
