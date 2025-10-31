import { Lock, Wallet, CreditCard, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import BiometricAuth from '../components/BiometricAuth';

const Profile = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <Wallet className="w-5 h-5 text-blue-600" />
          <div className="font-semibold">Wallet</div>
        </div>
        <div className="text-sm text-gray-700 font-mono break-all">Connect to view wallet address</div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="w-5 h-5 text-purple-600" />
          <div className="font-semibold">Linked Payment Methods</div>
        </div>
        <div className="text-sm text-gray-700">UPI, Card</div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <Lock className="w-5 h-5 text-green-600" />
          <div className="font-semibold">Security</div>
        </div>
        <div className="flex items-center justify-between py-2 mb-4">
          <span className="text-sm text-gray-700">Two-Step Verification</span>
          <input type="checkbox" className="h-4 w-4" />
        </div>
        <div className="border-t border-gray-200 pt-4">
          <BiometricAuth 
            onAuthenticated={() => {
              console.log('Biometric authentication completed from Profile');
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <Sun className="w-5 h-5 text-amber-500" />
          <div className="font-semibold">Appearance</div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-3 py-2 rounded-lg border border-gray-200">Light</button>
          <button className="px-3 py-2 rounded-lg border border-gray-200">Dark</button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="px-4 py-2 rounded-lg border border-gray-200">Disconnect Wallet</button>
        <button className="px-4 py-2 rounded-lg border border-gray-200">Logout</button>
      </div>
      {/* Guided workflow: Next step */}
      <div className="fixed bottom-6 right-6">
        <Link
          to="/home"
          className="px-5 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
        >
          Next: Home
        </Link>
      </div>
    </div>
  );
};

export default Profile;


