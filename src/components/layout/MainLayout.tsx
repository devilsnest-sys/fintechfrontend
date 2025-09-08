import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f5ff' }}>
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column' ,
          overflow:"auto"
        }}
      >
        <Header />
        <Box sx={{ p: 3, flex: 1 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;