import { Wallet, Smartphone, ArrowRight } from 'lucide-react';
import WalletConnect from '../components/WalletConnect';
import { Link } from 'react-router-dom';

const UserLogin = () => {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">StablePay</h1>
        <p className="text-gray-600 mt-2">Pay Smart. Stay Stable.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-5 h-5 text-blue-600" />
              <div className="font-semibold text-gray-900">Connect Wallet</div>
            </div>
            <WalletConnect />
          </div>
        </div>

        <button className="w-full bg-white rounded-2xl shadow p-6 border border-gray-100 text-left flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-purple-600" />
            <div className="font-semibold text-gray-900">Login with UPI or Card</div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center text-sm text-gray-600">Your exchange rate is fixed for life once you buy stablecoins.</div>

        <div className="text-center text-sm">
          <button className="text-blue-600 hover:text-blue-700">Proceed as Guest (View-Only)</button>
        </div>
      </div>

      {/* Guided workflow: Next step */}
      <div className="fixed bottom-6 right-6">
        <Link
          to="/kyc"
          className="px-5 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
        >
          Next: KYC
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;


