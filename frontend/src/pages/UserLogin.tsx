import { Wallet, Smartphone, ArrowRight } from 'lucide-react';
import WalletConnect from '../components/WalletConnect';
import { Link } from 'react-router-dom';

const UserLogin = () => {
  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-16 overflow-x-hidden w-full max-w-full">
      <div className="text-center mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">StablePay</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Pay Smart. Stay Stable.</p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Wallet className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="font-semibold text-sm sm:text-base text-gray-900">Connect Wallet</div>
            </div>
            <WalletConnect />
          </div>
        </div>

        <button className="w-full bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-100 text-left flex items-center justify-between hover:shadow-md active:bg-gray-50 transition-all touch-manipulation">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <Smartphone className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div className="font-semibold text-sm sm:text-base text-gray-900">Login with UPI or Card</div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
        </button>

        <div className="text-center text-xs sm:text-sm text-gray-600 px-2">Your exchange rate is fixed for life once you buy stablecoins.</div>

        <div className="text-center text-xs sm:text-sm">
          <button className="text-blue-600 hover:text-blue-700 active:text-blue-800 touch-manipulation">Proceed as Guest (View-Only)</button>
        </div>
      </div>

      {/* Guided workflow: Next step */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6">
        <Link
          to="/kyc"
          className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:bg-blue-800 transition touch-manipulation text-xs sm:text-sm"
        >
          Next: KYC
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;


