import { Outlet, Link, useLocation } from 'react-router-dom';
import { Coins, ArrowLeftRight, Wallet, Shield } from 'lucide-react';
import WalletConnect from './WalletConnect';

const Layout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StablePay
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/home"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === '/home'
                    ? 'bg-slate-100 text-slate-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>Home</span>
              </Link>
              
              <Link
                to="/send"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === '/send'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Send</span>
              </Link>
              
              <Link
                to="/receive"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === '/receive'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Receive</span>
              </Link>

              <Link
                to="/buy"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === '/buy'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Buy
              </Link>

              <Link
                to="/history"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === '/history'
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                History
              </Link>

              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === '/profile'
                    ? 'bg-cyan-100 text-cyan-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Profile
              </Link>

              <Link
                to="/kyc"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === '/kyc'
                    ? 'bg-fuchsia-100 text-fuchsia-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                KYC
              </Link>

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