const AdminSettings = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 overflow-x-hidden w-full max-w-full">
      <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">INR ↔ Stablecoin Conversion Rate</label>
          <input className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1" placeholder="88" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Payment API Keys (UPI/Card)</label>
          <input className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1" placeholder="••••••" />
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 rounded-lg border border-gray-200">Save</button>
          <button className="px-4 py-2 rounded-lg border border-gray-200">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;


