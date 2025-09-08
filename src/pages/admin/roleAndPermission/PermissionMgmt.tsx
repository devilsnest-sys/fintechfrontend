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
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import APIService from "../../../service/API";
import MainLayout from "../../../components/layout/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
import {
  PermissionsList,
  PermissionWithRoleName,
  UpdatePermissionWithRoleId,
} from "../../../service/models/Permission.model";

const PermissionMgmt: React.FC = () => {
  const [allPermissionList, setAllPermissionList] = useState<PermissionsList[]>(
    []
  );
  const [roleByPermissionList, setRoleByPermissionList] =
    useState<PermissionWithRoleName>({
      id: 0,
      name: "",
      permissions: [],
    });
  const { encodedId } = useParams<{ encodedId: string }>();
  const [filteredPermissionList, setFilteredPermissionList] = useState<
    PermissionsList[]
  >([]);
  const [isListloading, setIsListLoading] = useState<boolean>(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [errorMsg, setError] = useState<string>("");
  const [successMsg, setSuccess] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();
  const [isCheckedAll, setCheckedAll] = useState<boolean>(false);
  const [permissionFormData, setPermissionFormData] =
    useState<UpdatePermissionWithRoleId>({
      id: 0,
      name: "",
      permissions: [],
    });

  useEffect(() => {
    const fetchPermissions = async () => {
      if(!encodedId)
        return
         const decodeId=atob(encodedId)
      try {
        setIsListLoading(true);
        const allPermissionList = await APIService.getAllPermission();
        const roleByPermission = await APIService.getRoleByPermissions(
          Number(decodeId)
        );
        setRoleByPermissionList(roleByPermission);
        const checkedPermissionList:number[]=[];
        allPermissionList.forEach((allPermissionItem)=>{
             allPermissionItem.checkBoxChecked=false
          roleByPermission.permissions.forEach((roleByPermissionItem)=>{
            if(allPermissionItem?.id==roleByPermissionItem?.id){
              allPermissionItem.checkBoxChecked=true
              checkedPermissionList.push(roleByPermissionItem?.id??0)
            }
          })
        })
        setCheckedAll(checkedPermissionList.length==allPermissionList.length)
        setAllPermissionList(allPermissionList);
        setFilteredPermissionList(allPermissionList);
        setIsListLoading(false);
      } catch (err) {
        setIsListLoading(false);
      }
    };

    fetchPermissions();
  }, []);
  useEffect(() => {
    const filtered = allPermissionList.filter((rep) =>
      rep?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPermissionList(filtered);
  }, [searchTerm]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  if(!permissionFormData.permissions?.length){
    setError("Please at least one permission..!")
    return
  }
    setIsFormLoading(true);
    setError("");

    try {
      // if (PermissionFormData?.id)
      //   await APIService.updatePermission(PermissionFormData?.id, PermissionFormData);
      // else await APIService.createPermission(PermissionFormData);
      permissionFormData.id = roleByPermissionList?.id ?? 0;

      // return
      await APIService.updatePermissionsOnRole({id:permissionFormData?.id,permissions:permissionFormData?.permissions});
      setSuccess(`Permission updated successfully..!`);
      setTimeout(() => {
        navigate("/role-listing");
      }, 2000);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to permission updating. Please try again."
      );
    } finally {
      setIsFormLoading(false);
    }
  };

const singleCheckBoxChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  rowIndex: number
) => {
  const updatedList = allPermissionList.map((item, index) =>
    index === rowIndex
      ? { ...item, checkBoxChecked: e.target.checked }
      : item
  );

  const selectedPermissions = updatedList
    .filter((item) => item.checkBoxChecked)
    .map((item) => ({ id: item.id ?? 0 }));
  setCheckedAll(selectedPermissions.length==allPermissionList?.length)
  setAllPermissionList(updatedList);
  setFilteredPermissionList(updatedList); 
  setPermissionFormData({
    ...permissionFormData,
    permissions: selectedPermissions,
})
  
    
  };






  const checkAllCheckBoxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCheckedAll(e.target.checked)
    permissionFormData.permissions = [];
    filteredPermissionList.forEach((permissionItem) => {
      permissionItem.checkBoxChecked=false
      if(e.target.checked){
      permissionItem.checkBoxChecked=true
        permissionFormData.permissions.push({ id: permissionItem?.id ?? 0 });
      }
    });
    setPermissionFormData(permissionFormData)
    setAllPermissionList(filteredPermissionList)
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Permission Management
          </Typography>
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <TextField
            placeholder="Search by Permission name"
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
          <Button
            variant="contained"
            disabled={isFormLoading}
            color="primary"
            onClick={handleSubmit}
          >
            {isFormLoading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>
      <Typography sx={{ mb: 2 }} variant="subtitle1" color="text.secondary">
        Role: {roleByPermissionList?.name}
      </Typography>

      {/* Permission List */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        {isListloading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 750 }} size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>
                      {filteredPermissionList.length > 1 && <Checkbox   checked={isCheckedAll}
                            onChange={(e) => checkAllCheckBoxChange(e)} />}
                            
                    </TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Desc</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPermissionList
                    .map((rep, index) => (
                      <TableRow hover key={rep.id}>
                        <TableCell>
                          {rep?.checkBoxChecked}
                          <Checkbox 
                          key={rep.id}
                            checked={rep.checkBoxChecked}
                            onChange={(e) => singleCheckBoxChange(e, index)}
                          />
                        </TableCell>
                        <TableCell>{rep?.category}</TableCell>
                        <TableCell>{rep?.name}</TableCell>
                        <TableCell>{rep?.description}</TableCell>
                      </TableRow>
                    ))}
                  {filteredPermissionList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        No Permissions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          
          </>
        )}
      </Paper>

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

export default PermissionMgmt;
