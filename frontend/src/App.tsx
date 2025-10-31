import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Admin from './pages/Admin';
import Intro from './pages/Intro';
import UserLogin from './pages/UserLogin';
import UserDashboard from './pages/UserDashboard';
import Buy from './pages/Buy';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminOverview from './pages/AdminOverview';
import AdminUsers from './pages/AdminUsers';
import AdminVerify from './pages/AdminVerify';
import AdminMerchants from './pages/AdminMerchants';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';
import AdminSecurity from './pages/AdminSecurity';
import KYC from './pages/KYC';
import Onboarding from './pages/Onboarding';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { KYCProvider } from './context/KYCContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <KYCProvider>
          <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public routes - redirect to dashboard if logged in */}
                <Route index element={<PublicRoute><Intro /></PublicRoute>} />
                <Route path="intro" element={<PublicRoute><Intro /></PublicRoute>} />
                <Route path="landing" element={<PublicRoute><Landing /></PublicRoute>} />
                <Route path="onboarding" element={<PublicRoute><Onboarding /></PublicRoute>} />
                <Route path="login" element={<PublicRoute><UserLogin /></PublicRoute>} />
                
                {/* Protected routes - require authentication */}
                <Route path="send" element={<ProtectedRoute><Send /></ProtectedRoute>} />
                <Route path="home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="buy" element={<ProtectedRoute><Buy /></ProtectedRoute>} />
                <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="receive" element={<ProtectedRoute><Receive /></ProtectedRoute>} />
                
                {/* KYC route - accessible during onboarding but protected after login */}
                <Route path="kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
                
                {/* Admin routes */}
                <Route path="admin" element={<Admin />} />
                <Route path="admin-login" element={<AdminLogin />} />
                <Route path="admin/overview" element={<AdminOverview />} />
                <Route path="admin/users" element={<AdminUsers />} />
                <Route path="admin/verify" element={<AdminVerify />} />
                <Route path="admin/merchants" element={<AdminMerchants />} />
                <Route path="admin/analytics" element={<AdminAnalytics />} />
                <Route path="admin/settings" element={<AdminSettings />} />
                <Route path="admin/security" element={<AdminSecurity />} />
              </Route>
            </Routes>
          </div>
          </Router>
        </KYCProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;