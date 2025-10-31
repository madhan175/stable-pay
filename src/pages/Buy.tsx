import { useState } from 'react';
import { IndianRupee, QrCode, CreditCard, CheckCircle } from 'lucide-react';

const Buy = () => {
  const [inr, setInr] = useState('');
  const rate = 88;
  const stable = inr ? (parseFloat(inr || '0') / rate).toFixed(6) : '';
  const [done, setDone] = useState(false);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Buy Stablecoins Instantly</h1>

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Enter INR Amount</label>
          <div className="mt-2 relative">
            <span className="absolute left-3 top-3 text-gray-500">₹</span>
            <input
              type="number"
              value={inr}
              onChange={(e) => setInr(e.target.value)}
              className="w-full pl-8 pr-3 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600">Fixed Rate</div>
            <div className="text-xl font-semibold">₹{rate} / coin</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600">You Receive</div>
            <div className="text-xl font-semibold">{stable || '0.000000'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="rounded-xl border-2 border-gray-200 p-4 flex items-center justify-center space-x-2 hover:border-blue-300">
            <QrCode className="w-5 h-5" />
            <span>UPI</span>
          </button>
          <button className="rounded-xl border-2 border-gray-200 p-4 flex items-center justify-center space-x-2 hover:border-blue-300">
            <CreditCard className="w-5 h-5" />
            <span>Card</span>
          </button>
        </div>

        <button
          onClick={() => setDone(true)}
          disabled={!inr}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          Buy Now
        </button>
      </div>

      {done && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span>
              You purchased {stable} stablecoins at ₹{rate} per coin.
            </span>
          </div>
          <div className="mt-3 flex items-center space-x-3 text-sm">
            <button className="text-blue-600">View in Wallet</button>
            <span>•</span>
            <button className="text-blue-600">Download Receipt</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buy;


