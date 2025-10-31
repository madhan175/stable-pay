import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Coins, Download } from 'lucide-react';

type Tab = 'all' | 'sent' | 'received' | 'purchased';

const History = () => {
  const [tab, setTab] = useState<Tab>('all');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'sent', label: 'Sent' },
    { key: 'received', label: 'Received' },
    { key: 'purchased', label: 'Purchased' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Transaction History</h1>

      <div className="flex items-center space-x-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${tab === t.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {[1,2,3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {i % 3 === 0 ? (
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              ) : i % 2 === 0 ? (
                <ArrowDownLeft className="w-5 h-5 text-green-600" />
              ) : (
                <Coins className="w-5 h-5 text-purple-600" />
              )}
              <div>
                <div className="font-semibold text-gray-900">{i % 3 === 0 ? 'Sent' : i % 2 === 0 ? 'Received' : 'Purchased'}</div>
                <div className="text-xs text-gray-500">10:35 AM • Confirmed</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{i % 3 === 0 ? '-' : '+'}10.000000</div>
              <div className="text-xs text-gray-500">0xabc...123</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300">
          <Download className="w-4 h-4" />
          <span>Download Report (PDF)</span>
        </button>
      </div>
      {/* Guided workflow: Next step */}
      <div className="fixed bottom-6 right-6">
        <Link
          to="/profile"
          className="px-5 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
        >
          Next: Profile
        </Link>
      </div>
    </div>
  );
};

export default History;


