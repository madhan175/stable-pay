import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Coins, Shield, Download, Menu, X } from 'lucide-react';
import { useState } from 'react';
import WalletConnect from './WalletConnect';
import PhoneWalletNav from './PhoneWalletNav';
import PWAInstallPrompt from './PWAInstallPrompt';
import { usePWAInstall } from '../hooks/usePWAInstall';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { canInstall, installApp } = usePWAInstall();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    // Always go to home page after login
    navigate('/home');
  };
  
  return (
    <div className="min-h-screen overflow-x-hidden w-full max-w-full">
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 w-full shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">
            {/* Logo */}
            <Link 
              to="/home"
              onClick={handleLogoClick} 
              className="flex items-center space-x-2.5 group flex-shrink-0"
            >
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-2.5 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/20">
                <Coins className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
                StablePay
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 flex-shrink-0">
              {canInstall && (
                <button
                  onClick={installApp}
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all duration-200"
                  title="Install App"
                  aria-label="Install StablePay App"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              
              <PhoneWalletNav />
              
              <div className="relative group">
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Admin</span>
                </Link>
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link to="/admin/overview" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">Overview</Link>
                  <Link to="/admin/users" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">Users</Link>
                  <Link to="/admin/verify" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">Verify Payments</Link>
                  <Link to="/admin/merchants" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">Merchants</Link>
                  <Link to="/admin/analytics" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">Analytics</Link>
                  <Link to="/admin/settings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">Settings</Link>
                  <Link to="/admin/security" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">Security</Link>
                </div>
              </div>
              
              <WalletConnect />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
              {canInstall && (
                <button
                  onClick={() => {
                    installApp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Install App</span>
                </button>
              )}
              
              <div className="px-4 py-2">
                <PhoneWalletNav />
              </div>
              
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </div>
              </Link>
              
              <div className="px-4 py-2">
                <WalletConnect />
              </div>
            </div>
          )}
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