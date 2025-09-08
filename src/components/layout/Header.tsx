import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Badge, 
  Avatar, 
  Box 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook

const Header: React.FC = () => {
  const { currentUser } = useAuth(); // Get the current user from AuthContext

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#1e3a8a', fontWeight: 'bold' }}>
          Welcome, {currentUser?.name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              alt={currentUser?.name || "User"} 
              src="/avatar-placeholder.jpg" 
              sx={{ width: 36, height: 36, bgcolor: '#1e3a8a' }}
            />
            <Box sx={{ ml: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {currentUser?.name || "John Smith"}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {currentUser?.email || "john@gmail.com"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;