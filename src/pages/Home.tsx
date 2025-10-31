import { Link } from 'react-router-dom';
import { Search, QrCode, Send, Landmark, BatteryCharging, Wallet, History, User } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-xl mx-auto px-4 pt-6 pb-24">
        {/* Search */}
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 px-4 py-3">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                placeholder="Pay by name or phone number"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400" />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Link to="/send" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow">
            <QrCode className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-gray-700">Scan any{String.fromCharCode(10)}QR code</div>
          </Link>
          <Link to="/send" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow">
            <Send className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-gray-700">Pay{String.fromCharCode(10)}anyone</div>
          </Link>
          <Link to="/receive" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow">
            <Landmark className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-gray-700">Bank{String.fromCharCode(10)}transfer</div>
          </Link>
          <Link to="/buy" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow">
            <BatteryCharging className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-gray-700">Mobile{String.fromCharCode(10)}recharge</div>
          </Link>
        </div>

        {/* People */}
        <div className="mt-8">
          <div className="text-lg font-bold text-gray-900 mb-3">People</div>
          <div className="flex items-center space-x-6 overflow-x-auto pb-2">
            {people.map((p) => (
              <Link key={p.name} to={p.route} className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                  {p.initial}
                </div>
                <div className="text-xs text-gray-700 max-w-[72px] truncate">{p.name}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* List items */}
        <div className="mt-8 space-y-3">
          <Link to="/history" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow">
            <div className="text-sm font-medium text-gray-800">See transaction history</div>
            <History className="w-4 h-4 text-gray-400" />
          </Link>
          <Link to="/receive" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow">
            <div className="text-sm font-medium text-gray-800">Check USDT balance</div>
            <Wallet className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Bottom tabs */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200">
        <div className="max-w-xl mx-auto px-8">
          <div className="grid grid-cols-3 py-3 text-center text-sm">
            <Link to="/" className="text-blue-600 font-medium">Home</Link>
            <Link to="/receive" className="text-gray-600 hover:text-gray-800">Money</Link>
            <Link to="/profile" className="text-gray-600 hover:text-gray-800">You</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;


