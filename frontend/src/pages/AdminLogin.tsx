import { Wallet, Shield, Mail } from 'lucide-react';

const AdminLogin = () => {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 overflow-x-hidden w-full max-w-full">
      <div className="text-center">
        <Shield className="w-10 h-10 text-purple-600 mx-auto" />
        <h1 className="text-2xl font-bold mt-2">Admin Panel</h1>
        <p className="text-sm text-gray-600">Admin access restricted to verified accounts.</p>
      </div>

      <button className="w-full bg-white rounded-2xl shadow p-4 border border-gray-100 text-left flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wallet className="w-5 h-5 text-purple-600" />
          <div className="font-semibold text-gray-900">Login via Admin Wallet</div>
        </div>
      </button>

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 space-y-3">
        <div className="flex items-center space-x-2 text-gray-700">
          <Mail className="w-4 h-4" />
          <div className="font-medium">Email + Password</div>
        </div>
        <input className="w-full border-2 border-gray-200 rounded-lg px-3 py-2" placeholder="Email" />
        <input type="password" className="w-full border-2 border-gray-200 rounded-lg px-3 py-2" placeholder="Password" />
        <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold">Login</button>
      </div>

      <div className="text-center text-sm">
        <button className="text-blue-600">Login as Merchant</button>
      </div>
    </div>
  );
};

export default AdminLogin;


