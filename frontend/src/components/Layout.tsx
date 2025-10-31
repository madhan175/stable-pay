import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Coins, Shield, Download } from 'lucide-react';
import WalletConnect from './WalletConnect';
import PhoneWalletNav from './PhoneWalletNav';
import PWAInstallPrompt from './PWAInstallPrompt';
import { useAuth } from '../context/AuthContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { canInstall, installApp } = usePWAInstall();
  
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // If user is logged in and verified, go to send page
    if (user && user.phone_verified && user.kyc_status === 'verified') {
      navigate('/send');
    } else {
      // Otherwise go to home page instead of onboarding
      navigate('/home');
    }
  };
  
  return (
    <div className="min-h-screen overflow-x-hidden w-full max-w-full">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16 w-full">
            <Link to={user && user.phone_verified && user.kyc_status === 'verified' ? "/send" : "/home"} onClick={handleLogoClick} className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StablePay
              </span>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {canInstall && (
                <button
                  onClick={installApp}
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Install App"
                  aria-label="Install StablePay App"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              
              {/* Phone Wallet Navigation */}
              <PhoneWalletNav />
              
              <div className="relative group">
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-slate-100 text-slate-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 hidden group-hover:block z-50">
                  <Link to="/admin/overview" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Overview</Link>
                  <Link to="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Users</Link>
                  <Link to="/admin/verify" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Verify Payments</Link>
                  <Link to="/admin/merchants" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Merchants</Link>
                  <Link to="/admin/analytics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Analytics</Link>
                  <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                  <Link to="/admin/security" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Security</Link>
                </div>
              </div>
              
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="overflow-x-hidden w-full max-w-full">
        <Outlet />
      </main>
      
      <PWAInstallPrompt />
    </div>
  );
};

export default Layout;