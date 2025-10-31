import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, QrCode, Send, Landmark, BatteryCharging, Wallet, History, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { getUSDTBalance } from '../utils/blockchain';
import CurrencyRateDisplay from '../components/CurrencyRateDisplay';

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
  const [balance, setBalance] = useState('0.000000');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-xl mx-auto px-4 pt-6 pb-24">
        {/* User Status Banner */}
        {user && (
          <div className="mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{user.phone}</div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    {user.phone_verified ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-yellow-600" />
                        <span>Not Verified</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Link 
                to="/profile" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}

        {/* Wallet Balance Card */}
        {isConnected && account && (
          <div className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">USDT Balance</span>
              <Wallet className="w-5 h-5 opacity-90" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {isLoadingBalance ? '...' : `$${balance}`}
            </div>
            <div className="text-xs opacity-75">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 px-4 py-3">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pay by name or phone number"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>
          <Link
            to="/profile"
            className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white font-semibold text-sm"
          >
            {user ? user.phone.slice(-1) : 'U'}
          </Link>
        </form>

        {/* Currency Rates */}
        <div className="mt-6">
          <CurrencyRateDisplay />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Link to="/send" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow transition-shadow">
            <QrCode className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-gray-700 whitespace-pre-line">Scan any{'\n'}QR code</div>
          </Link>
          <Link to="/send" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow transition-shadow">
            <Send className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-gray-700 whitespace-pre-line">Pay{'\n'}anyone</div>
          </Link>
          <Link to="/receive" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow transition-shadow">
            <Landmark className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-gray-700 whitespace-pre-line">Wallet{'\n'}Balance</div>
          </Link>
          <Link to="/buy" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow transition-shadow">
            <BatteryCharging className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-gray-700 whitespace-pre-line">Buy{'\n'}USDT</div>
          </Link>
        </div>

        {/* People */}
        <div className="mt-8">
          <div className="text-lg font-bold text-gray-900 mb-3">Recent Contacts</div>
          <div className="flex items-center space-x-6 overflow-x-auto pb-2">
            {people.map((p) => (
              <Link 
                key={p.name} 
                to={p.route} 
                className="flex flex-col items-center space-y-1 flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold shadow-sm">
                  {p.initial}
                </div>
                <div className="text-xs text-gray-700 max-w-[72px] truncate">{p.name}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions List */}
        <div className="mt-8 space-y-3">
          <Link to="/history" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow transition-shadow">
            <div className="text-sm font-medium text-gray-800">See transaction history</div>
            <History className="w-4 h-4 text-gray-400" />
          </Link>
          <Link to="/receive" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow transition-shadow">
            <div className="text-sm font-medium text-gray-800">Check USDT balance</div>
            <Wallet className="w-4 h-4 text-gray-400" />
          </Link>
          {!user && (
            <Link to="/login" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow transition-shadow">
              <div className="text-sm font-medium text-gray-800">Login to access all features</div>
              <User className="w-4 h-4 text-gray-400" />
            </Link>
          )}
          {user && user.kyc_status === 'none' && (
            <Link to="/kyc" className="bg-yellow-50 rounded-2xl shadow-sm border border-yellow-200 p-4 flex items-center justify-between hover:shadow transition-shadow">
              <div className="text-sm font-medium text-yellow-800">Complete KYC verification</div>
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            </Link>
          )}
        </div>
      </div>

      {/* Bottom tabs */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-xl mx-auto px-8">
          <div className="grid grid-cols-3 py-3 text-center text-sm">
            <Link to="/home" className="text-blue-600 font-medium flex flex-col items-center">
              <span>Home</span>
            </Link>
            <Link to="/receive" className="text-gray-600 hover:text-gray-800 flex flex-col items-center">
              <span>Money</span>
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-gray-800 flex flex-col items-center">
              <span>You</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;


