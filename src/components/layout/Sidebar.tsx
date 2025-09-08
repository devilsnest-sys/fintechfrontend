import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ManageHistory, Payment } from '@mui/icons-material';
import CommonService from '../../service/CommonService';

interface SidebarProps {
  open?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open = true }) => {
  const drawerWidth = 230;
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mastersOpen, setMastersOpen] = useState(false);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMastersClick = () => {
    setMastersOpen(!mastersOpen);
  };

  const handleMasterItemClick = (tabIndex: number) => {
    navigate(`/masters?tab=${tabIndex}`);
  };

  // Masters submenu items
  const mastersItems = [
    { text: 'Entity Type', tabIndex: 0 },
    { text: 'Business Category', tabIndex: 1 },
    { text: 'Business Type', tabIndex: 2 },
    { text: 'Address Status', tabIndex: 3 },
    { text: 'Person Type', tabIndex: 4 },
    { text: 'Bank Detail', tabIndex: 5 },
    { text: 'Purchase Source', tabIndex: 6 },
    { text: 'Make', tabIndex: 7 },
    { text: 'Cheque Location', tabIndex: 8 },
    { text: 'Purchase Source Documents', tabIndex: 9 },
   {text:'Designation', tabIndex: 10},
    {text: 'States', tabIndex: 11},
    {text: 'Cities', tabIndex: 12},
  ];

  // Menu for admin
  const adminMenu = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard', permission: true },
    { text: 'Manage Dealer', icon: <PeopleIcon />, path: '/dealer-listing', permission: CommonService.checkPermission(['Manage Dealers']) },
    { text: 'Manage DDR', icon: <AdminPanelSettingsIcon />, path: '/ddr-listing', permission: CommonService.checkPermission(['Manage DDR']) },
    { text: 'Manage Loans', icon: <AccountBalanceIcon />, path: '/loan-listing', permission: CommonService.checkPermission(['Manage Loans']) },
    { text: 'Manage Staff', icon: <SecurityIcon />, path: '/user-listing', permission: CommonService.checkPermission(['Manage Staff']) },
    { text: 'Manage Roles', icon: <ManageHistory />, path: '/role-listing', permission: CommonService.checkPermission(['Manage Roles']) },
    { text: 'Manage Payments', icon: <Payment />, path: '/payments-listing', permission: CommonService.checkPermission(['Manage Loan Payment']) },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports', permission: CommonService.checkPermission(['Manage Reports']) },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#1e3a8a',
          color: 'white',
        },
      }}
    >
      <Box sx={{ py: 2, mr: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/tsc-Logo.png" alt="Logo" style={{ height: '100%' }} />
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ pt: 2 }}>
        {adminMenu.map(
          (item) =>
            item?.permission && (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  sx={{
                    borderRadius: "8px",
                    m: 0.1,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )
        )}

        {/* Masters Menu with Dropdown */}
        {CommonService.checkPermission(['Manage Master']) && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleMastersClick}
                sx={{
                  borderRadius: "8px",
                  m: 0.1,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Masters" />
                {mastersOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={mastersOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {mastersItems.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      sx={{
                        pl: 6,
                        borderRadius: "8px",
                        m: 0.1,
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.1)",
                        },
                        ...(location.pathname === '/masters' && 
                            location.search === `?tab=${item.tabIndex}` && {
                          bgcolor: "rgba(255,255,255,0.2)",
                        }),
                      }}
                      onClick={() => handleMasterItemClick(item.tabIndex)}
                    >
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{
                          fontSize: '0.875rem'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </List>

      <Box sx={{ mt: 'auto', p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Log Out" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default Sidebar;