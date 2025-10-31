import { Link } from 'react-router-dom';
import { Wallet, IndianRupee, Coins, Send, History } from 'lucide-react';

const UserDashboard = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden w-full max-w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Home</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <Coins className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-gray-600">Wallet Balance</div>
          </div>
          <div className="text-3xl font-bold">0.000000</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <IndianRupee className="w-5 h-5 text-green-600" />
            <div className="text-sm text-gray-600">INR Equivalent</div>
          </div>
          <div className="text-3xl font-bold">₹0.00</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            <div className="text-sm text-gray-600">Wallet</div>
          </div>
          <div className="text-sm text-gray-800 font-mono break-all">Connect to view</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/buy" className="bg-white rounded-2xl shadow p-6 border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center space-x-3 mb-2">
            <Coins className="w-5 h-5 text-blue-600" />
            <div className="font-semibold">Buy Stablecoin</div>
          </div>
          <div className="text-sm text-gray-600">Purchase instantly via UPI/Card</div>
        </Link>
        <Link to="/send" className="bg-white rounded-2xl shadow p-6 border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center space-x-3 mb-2">
            <Send className="w-5 h-5 text-purple-600" />
            <div className="font-semibold">Send Payment</div>
          </div>
          <div className="text-sm text-gray-600">Transfer stablecoins to a wallet</div>
        </Link>
        <Link to="/history" className="bg-white rounded-2xl shadow p-6 border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center space-x-3 mb-2">
            <History className="w-5 h-5 text-green-600" />
            <div className="font-semibold">Transaction History</div>
          </div>
          <div className="text-sm text-gray-600">View all activity</div>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;


