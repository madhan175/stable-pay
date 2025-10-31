import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Coins, Shield } from 'lucide-react';
import WalletConnect from './WalletConnect';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogoClick = (e: React.MouseEvent) => {
    // If user is logged in and verified, go to send page instead of home
    if (user && user.phone_verified && user.kyc_status === 'verified') {
      e.preventDefault();
      navigate('/send');
    }
  };
  
  return (
    <div className="min-h-screen">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={user && user.phone_verified && user.kyc_status === 'verified' ? "/send" : "/"} onClick={handleLogoClick} className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StablePay
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-slate-100 text-slate-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
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
      
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;