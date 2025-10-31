import { Lock, Wallet, CreditCard, Sun, LogOut, User, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import BiometricAuth from '../components/BiometricAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { account, isConnected, disconnect } = useWallet();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const handleDisconnectWallet = () => {
    if (window.confirm('Are you sure you want to disconnect your wallet?')) {
      disconnect();
      alert('Wallet disconnected successfully');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12 space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile & Settings</h1>

      {/* User Info */}
      {user && (
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="font-semibold text-sm sm:text-base">Account Information</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Phone Number:</span>
              <span className="text-sm font-medium text-gray-900">{user.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Phone Verified:</span>
              {user.phone_verified ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Not Verified</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">KYC Status:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                user.kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
                user.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                user.kyc_status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.kyc_status.charAt(0).toUpperCase() + user.kyc_status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <Wallet className="w-5 h-5 text-blue-600" />
          <div className="font-semibold">Wallet</div>
        </div>
        {isConnected && account ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-700 font-mono break-all">{account}</div>
            <button
              onClick={handleDisconnectWallet}
              className="mt-2 px-4 py-2.5 text-xs sm:text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100 transition touch-manipulation"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs sm:text-sm text-gray-700">No wallet connected</div>
            <Link
              to="/receive"
              className="inline-block mt-2 px-4 py-2.5 text-xs sm:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition touch-manipulation"
            >
              Connect Wallet
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-100">
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        {isConnected && (
          <button 
            onClick={handleDisconnectWallet}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100 transition touch-manipulation text-sm"
          >
            Disconnect Wallet
          </button>
        )}
        <button 
          onClick={handleLogout}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition flex items-center justify-center space-x-2 touch-manipulation text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;


