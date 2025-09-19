import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Coins, ArrowLeftRight, Wallet } from 'lucide-react';

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