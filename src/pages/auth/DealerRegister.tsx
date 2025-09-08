import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material';
import { Google, Facebook, GitHub, LinkedIn } from '@mui/icons-material';

const DealerRegister: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use the updated register function from AuthContext
      await register(name, email, phone, password, 'dealer');
      navigate('/dealer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ display: 'flex', borderRadius: '8px 90px', overflow: 'hidden', mt: 8 }}>
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
            borderRadius: '0px 90px'
          }}
        >
          <Typography variant="h5" fontWeight="bold" align="center">
            Dealer Registration
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2 }}>
            Register as a dealer to access exclusive tools and loan management features.
          </Typography>
        </Box>

        {/* Right Section - Registration Form */}
        <Box sx={{ width: '60%', p: 4 }}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            Create Dealer Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="dense"
              required
              fullWidth
              id="name"
              label="Username"
              autoComplete="name"
              autoFocus
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              id="phone"
              label="Phone Number"
              autoComplete="tel"
              size="small"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              size="small"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} /> : 'Register as Dealer'}
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            {/* Social Login Buttons */}
            <Grid container spacing={1} justifyContent="center">
              {[Google, Facebook, GitHub, LinkedIn].map((Icon, index) => (
                <Grid item key={index}>
                  <Button variant="outlined" sx={{ minWidth: 50, p: 1 }}>
                    <Icon />
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Sign in
                </Typography>
              </Link>
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link to="/admin/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="text.secondary">
                  Register as Admin instead
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default DealerRegister;