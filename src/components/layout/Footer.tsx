import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import SessionManager from "./SessionManager";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleSessionExpired = () => {
    setViewDialogOpen(true);
  };
  const gotoLogin = () => {
    localStorage.clear();
    setViewDialogOpen(false);
    navigate("/login");
  };
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: "center",
        bgcolor: "#f5f5f5",
        borderTop: "1px solid #e0e0e0",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Circle. All rights reserved.
      </Typography>
      {/* View Representative Dialog */}
      <SessionManager
        sessionExpireTime={30}
        openSessionExpiredDialog={handleSessionExpired}
      />
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)}>
        <DialogTitle>
          Your session has expired,
          <br /> please proceed to login.
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => gotoLogin()}>Go to Login</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Footer;
