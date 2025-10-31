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

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <KYCProvider>
          <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Onboarding />} />
                <Route path="send" element={<Send />} />
                <Route path="login" element={<UserLogin />} />
                <Route path="home" element={<UserDashboard />} />
                <Route path="buy" element={<Buy />} />
                <Route path="history" element={<History />} />
                <Route path="profile" element={<Profile />} />
                <Route path="receive" element={<Receive />} />
                <Route path="kyc" element={<KYC />} />
                <Route path="onboarding" element={<Onboarding />} />
              <Route path="admin" element={<Admin />} />
              <Route path="intro" element={<Intro />} />
                {/* Admin routes */}
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