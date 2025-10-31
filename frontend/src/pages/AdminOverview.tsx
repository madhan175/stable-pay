import { Users, Coins, Repeat, IndianRupee } from 'lucide-react';

const AdminOverview = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 overflow-x-hidden w-full max-w-full">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2"><Users className="w-5 h-5 text-blue-600" /><div className="text-sm text-gray-600">Total Users</div></div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2"><Coins className="w-5 h-5 text-purple-600" /><div className="text-sm text-gray-600">Stablecoins Circulation</div></div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2"><Repeat className="w-5 h-5 text-green-600" /><div className="text-sm text-gray-600">Transactions</div></div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-2"><IndianRupee className="w-5 h-5 text-amber-600" /><div className="text-sm text-gray-600">INR Processed</div></div>
          <div className="text-2xl font-bold">₹0</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="font-semibold mb-4">Latest Transactions</div>
        <div className="text-sm text-gray-500">No data</div>
      </div>
    </div>
  );
};

export default AdminOverview;


