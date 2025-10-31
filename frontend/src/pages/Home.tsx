import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, QrCode, Send, Landmark, BatteryCharging, Wallet, History, User, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { getUSDTBalance } from '../utils/blockchain';
import CurrencyRateDisplay from '../components/CurrencyRateDisplay';
import { usePWAInstall } from '../hooks/usePWAInstall';

const people = [
  { name: 'THIRUVAS...', route: '/send', initial: 'T' },
  { name: 'Dinesh', route: '/send', initial: 'D' },
  { name: 'Khathir R.V', route: '/send', initial: 'K' },
  { name: 'S.Praveen', route: '/send', initial: 'S' },
  { name: 'Mano', route: '/send', initial: 'M' },
  { name: 'Sreedharan', route: '/send', initial: 'S' },
  { name: 'Jaswanth', route: '/send', initial: 'J' },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { account, isConnected } = useWallet();
  const { canInstall, isIOS, isStandalone, installApp, deferredPrompt } = usePWAInstall();
  const [balance, setBalance] = useState('0.000000');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Debug: Log install status
  useEffect(() => {
    const status = {
      canInstall,
      isIOS,
      isStandalone,
      hasDeferredPrompt: !!deferredPrompt,
      hasServiceWorker: 'serviceWorker' in navigator,
      userAgent: navigator.userAgent,
    };
    console.log('Home Page - Install Status:', status);
    // Force show button if service worker is supported and not standalone
    if ('serviceWorker' in navigator && !isStandalone) {
      console.log('✅ Button should be visible - Service worker supported and not in standalone mode');
    } else {
      console.warn('⚠️ Button hidden - Check reasons above');
    }
  }, [canInstall, isIOS, isStandalone, deferredPrompt]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && account) {
        setIsLoadingBalance(true);
        try {
          const bal = await getUSDTBalance(account);
          setBalance(bal.toFixed(6));
        } catch (error) {
          console.error('Error fetching balance:', error);
        } finally {
          setIsLoadingBalance(false);
        }
      }
    };
    fetchBalance();
  }, [isConnected, account]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/send?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleDownloadClick = async () => {
    console.log('Download button clicked', { isIOS, canInstall });
    if (isIOS) {
      setShowIOSInstructions(!showIOSInstructions);
    } else {
      try {
        await installApp();
      } catch (error) {
        console.error('Install error:', error);
        // Show fallback instructions for desktop
        if (window.confirm('Install prompt not available. Would you like to see manual installation instructions?')) {
          alert('To install:\n\nChrome/Edge: Look for the install icon (⊕) in the address bar\nFirefox: Menu → Install\nOr check browser settings for "Install App" option');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-20 sm:pb-24">
        {/* Download/Install App Button - Always visible when can install */}
        {!isStandalone && (
          <div className="mb-4">
            <button
              onClick={handleDownloadClick}
              type="button"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg p-4 sm:p-5 flex items-center justify-center gap-3 hover:opacity-90 active:opacity-80 transition-all touch-manipulation cursor-pointer"
              aria-label={isIOS ? 'Show installation instructions' : 'Install StablePay app'}
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base font-semibold">
                {isIOS ? 'Install App' : 'Download App'}
              </span>
            </button>
            {showIOSInstructions && isIOS && (
              <div className="mt-3 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">How to Install on iOS:</div>
                <ol className="text-xs sm:text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Tap the <strong>Share</strong> button <span className="text-blue-600">(□↑)</span> at the bottom of your Safari browser</li>
                  <li>Scroll down and select <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong> in the top right corner</li>
                </ol>
              </div>
            )}
          </div>
        )}
        {/* User Status Banner */}
        {user && (
          <div className="mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.phone}</div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs text-gray-600">
                    {user.phone_verified ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                        <span>Not Verified</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Link 
                to="/profile" 
                className="text-blue-600 hover:text-blue-700 active:text-blue-800 text-xs sm:text-sm font-medium whitespace-nowrap touch-manipulation"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}

        {/* Wallet Balance Card */}
        {isConnected && account && (
          <div className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium opacity-90">USDT Balance</span>
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 opacity-90" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {isLoadingBalance ? '...' : `$${balance}`}
            </div>
            <div className="text-xs opacity-75 break-all sm:break-normal">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3">
              <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pay by name or phone number"
                className="w-full outline-none text-xs sm:text-sm"
              />
            </div>
          </div>
          <Link
            to="/profile"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0 touch-manipulation active:scale-95"
          >
            {user ? user.phone.slice(-1) : 'U'}
          </Link>
        </form>

        {/* Currency Rates */}
        <div className="mt-6">
          <CurrencyRateDisplay />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
          <Link to="/send" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center hover:shadow active:bg-gray-50 transition-all touch-manipulation">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-[10px] sm:text-xs text-gray-700 whitespace-pre-line">Scan any{'\n'}QR code</div>
          </Link>
          <Link to="/send" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center hover:shadow active:bg-gray-50 transition-all touch-manipulation">
            <Send className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-[10px] sm:text-xs text-gray-700 whitespace-pre-line">Pay{'\n'}anyone</div>
          </Link>
          <Link to="/receive" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center hover:shadow active:bg-gray-50 transition-all touch-manipulation">
            <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-[10px] sm:text-xs text-gray-700 whitespace-pre-line">Wallet{'\n'}Balance</div>
          </Link>
          <Link to="/buy" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center hover:shadow active:bg-gray-50 transition-all touch-manipulation">
            <BatteryCharging className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-[10px] sm:text-xs text-gray-700 whitespace-pre-line">Buy{'\n'}USDT</div>
          </Link>
        </div>

        {/* People */}
        <div className="mt-6 sm:mt-8">
          <div className="text-base sm:text-lg font-bold text-gray-900 mb-3">Recent Contacts</div>
          <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto pb-2 -mx-3 sm:-mx-0 px-3 sm:px-0 scrollbar-hide">
            {people.map((p) => (
              <Link 
                key={p.name} 
                to={p.route} 
                className="flex flex-col items-center space-y-1 flex-shrink-0 hover:opacity-80 active:opacity-70 transition-opacity touch-manipulation"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold shadow-sm text-sm sm:text-base">
                  {p.initial}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-700 max-w-[64px] sm:max-w-[72px] truncate">{p.name}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions List */}
        <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
          <Link to="/history" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center justify-between hover:shadow active:bg-gray-50 transition-all touch-manipulation">
            <div className="text-xs sm:text-sm font-medium text-gray-800">See transaction history</div>
            <History className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
          </Link>
          <Link to="/receive" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center justify-between hover:shadow active:bg-gray-50 transition-all touch-manipulation">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Check USDT balance</div>
            <Wallet className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
          </Link>
          {!user && (
            <Link to="/login" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center justify-between hover:shadow active:bg-gray-50 transition-all touch-manipulation">
              <div className="text-xs sm:text-sm font-medium text-gray-800">Login to access all features</div>
              <User className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            </Link>
          )}
          {user && user.kyc_status === 'none' && (
            <Link to="/kyc" className="bg-yellow-50 rounded-2xl shadow-sm border border-yellow-200 p-3 sm:p-4 flex items-center justify-between hover:shadow active:bg-yellow-100 transition-all touch-manipulation">
              <div className="text-xs sm:text-sm font-medium text-yellow-800">Complete KYC verification</div>
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 ml-2" />
            </Link>
          )}
        </div>
      </div>

      {/* Bottom tabs */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg safe-area-pb">
        <div className="max-w-xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-3 py-3 text-center text-xs sm:text-sm">
            <Link to="/home" className="text-blue-600 font-medium flex flex-col items-center touch-manipulation active:opacity-70">
              <span>Home</span>
            </Link>
            <Link to="/receive" className="text-gray-600 hover:text-gray-800 active:text-gray-900 flex flex-col items-center touch-manipulation active:opacity-70">
              <span>Money</span>
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-gray-800 active:text-gray-900 flex flex-col items-center touch-manipulation active:opacity-70">
              <span>You</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;


