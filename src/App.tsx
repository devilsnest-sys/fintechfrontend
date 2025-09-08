import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DealerRegister from './pages/auth/DealerRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import DealerListing from './pages/admin/dealer/DealerListing';
import DealerDetails from './pages/admin/dealer/DealerDetails';
import { DealerProvider } from './context/DealerContext';
import LoanListing from './pages/admin/loan/LoanListing';
import RepresentativeListing from './pages/admin/RepresentativeListing';
import LoanDetails from './pages/admin/loan/LoanDetails';
import DealerOnboardingPage from './pages/admin/dealer/AddOrUpdateDealer';
import DdrListing from './pages/admin/ddr/DdrListing';
import DdrDetails from './pages/admin/ddr/DdrDetails';
import AddOrUpdateDdrForm from './pages/admin/ddr/AddOrUpdateDdrForm';
import RolesListing from './pages/admin/roleAndPermission/RolesListing';
import PermissionMgmt from './pages/admin/roleAndPermission/PermissionMgmt';
import PaymentsListing from './pages/admin/payments/PaymentsList';
import Masters from './pages/admin/masters/Masters';
import Reports from './pages/admin/reports/Reports';
// Create a theme instance for your application
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // You can customize these colors
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalizes browser styles */}
      <AuthProvider>
        <Router>
          <DealerProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin/register" element={<Register />} />
              <Route path="/dealer/register" element={<DealerRegister />} />
              <Route path="/admin/dashboard" element={
                  <AdminDashboard />
              } />

              <Route path="/dealer-listing" element={<DealerListing />} />
              <Route path="/dealer-details/:encodedId" element={<DealerDetails />} />
              <Route path="/dealer-onboarding/:encodedId" element={<DealerOnboardingPage />} />
              <Route path="/dealer-onboarding/" element={<DealerOnboardingPage />} />

              <Route path="/loan-listing/:dealerId?" element={<LoanListing />} />
              <Route path="/loan-details/:encodedId" element={<LoanDetails />} />

              <Route path="/user-listing" element={<RepresentativeListing />} />

              <Route path="/ddr-listing" element={<DdrListing />} />
              <Route path="/ddr-onAction/:encodedId?" element={<AddOrUpdateDdrForm />} />
              <Route path="/ddr-details/:encodedId" element={<DdrDetails />} />

              <Route path="/" element={<Navigate to="/login" replace />} />

              <Route
                path="/role-listing"
                element={
                  <PrivateRoute allowedPermission={['Manage Roles']}>
                    <RolesListing />
                  </PrivateRoute>
                }
              />
              <Route
                path="/modify-permission/:encodedId"
                element={
                  <PrivateRoute allowedPermission={['Manage Roles']}>
                    <PermissionMgmt />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payments-listing"
                element={
                  <PaymentsListing />
                }
              />
              <Route
                path="/masters"
                element={
                  <Masters />
                }
              />
              <Route
                path="/reports"
                element={
                  <Reports />
                }
              />
            </Routes>
          </DealerProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;