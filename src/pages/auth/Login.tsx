import React, {useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
   const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP related state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpMethod, setOtpMethod] = useState('email');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpVerificationStep, setOtpVerificationStep] = useState(1); // 1 = choose method, 2 = enter OTP

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMsg('All fields are required');
      return;
    }


      openOtpDialog();
 
  };

  const openOtpDialog = () => {
    setOtpDialogOpen(true);
    setOtpVerificationStep(1);
    setOtp('');
    setOtpMethod('email');
  };

  const handleSendOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    
    setOtpVerificationStep(2);
    setOtp(randomOtp);
  };

  const handleVerifyOtp = async () => {
       if (!otp.trim()) {
      setErrorMsg("Please enter OTP ..!");
      return;
    }
    if (otp != generatedOtp) {
      setErrorMsg("Invalid OTP ..!");
      return;
    }
      
      try {
      
      setIsLoading(true);
        await login(email, password);
      localStorage.setItem('sessionExpiredTime', new Date().toISOString());
        setOtpDialogOpen(false);
      } catch (err:any) {
          setErrorMsg(
          err?.response?.data?.message ?? "Invalid login credentials"
        );
        setIsLoading(false);
      }
    
  };

  const handleCloseOtpDialog = () => {
    setOtpDialogOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9', // optional background
      }}
    >
      <Container component="main" maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            borderRadius: '8px 90px',
            overflow: 'hidden',
          }}
        >
          {/* Left Section */}
          <Box
            sx={{
              width: '40%',
              backgroundColor: 'primary.main',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              borderRadius: '0px 90px',
            }}
          >
            <Typography variant="h5" fontWeight="bold" align="center">
              Welcome Back!
            </Typography>
            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              Enter your details to sign in to your account.
            </Typography>
          </Box>
  
          {/* Right Section - Login Form */}
          <Box sx={{ width: '60%', p: 4 }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              Sign In
            </Typography>
  
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <TextField
                margin="dense"
                required
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                autoFocus
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="dense"
                required
                fullWidth
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
  
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign in
              </Button>
  
              <Typography variant="body2" align="right">
                <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#1e3a8a' }}>
                  Forgot Password?
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
  
        {/* OTP Verification Dialog */}
        <Dialog open={otpDialogOpen} onClose={handleCloseOtpDialog}>
          <DialogTitle>OTP Verification</DialogTitle>
          <DialogContent>
            {otpVerificationStep === 1 && (
              <>
                <Typography variant="body1" gutterBottom>
                  Please select how you want to receive the OTP:
                </Typography>
                <FormControl component="fieldset" sx={{ mt: 2 }}>
                  <RadioGroup row value={otpMethod} onChange={(e) => setOtpMethod(e.target.value)}>
                    <FormControlLabel value="mobile" control={<Radio />} label="Mobile" />
                    <FormControlLabel value="email" control={<Radio />} label="Email" />
                  </RadioGroup>
                </FormControl>
              </>
            )}
  
            {otpVerificationStep === 2 && (
              <>
                <Typography variant="body1" gutterBottom>
                  Enter the OTP sent to your {otpMethod}:
                </Typography>
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  id="otp"
                  label="OTP"
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOtpDialog}>Cancel</Button>
            {otpVerificationStep === 1 && <Button onClick={handleSendOtp}>Send OTP</Button>}
            {otpVerificationStep === 2 && (
            <Button
              onClick={handleVerifyOtp}
              startIcon={isLoading ? <CircularProgress size={18} /> : null}
              disabled={isLoading}
            >
              {isLoading ? "Verifying ..." : "Verify"}
            </Button>
          )}
          </DialogActions>
        </Dialog>
      </Container>
       <Snackbar
        open={!!errorMsg}
        autoHideDuration={3000}
        onClose={() => setErrorMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {errorMsg}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );  
};

export default Login;