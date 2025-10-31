import { useEffect, useState } from 'react';
import { Shield, Wrench } from 'lucide-react';
import { frontendContractService } from '../utils/contractIntegration';

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        await frontendContractService.connect();
        const details = await frontendContractService.getSystemInfo();
        setInfo(details);
      } catch (e: any) {
        setError(e?.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => frontendContractService.removeAllListeners();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden w-full max-w-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
      </div>

      {loading && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">Loading...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mb-6">{error}</div>
      )}

      {info && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Wrench className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-800">System Info</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <div className="text-gray-500">Contract Connected</div>
                <div className="font-medium">{info.connection.isConnected ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-gray-500">Contract Address</div>
                <div className="font-mono text-xs break-all">{info.contractAddress || 'Not configured'}</div>
              </div>
              <div>
                <div className="text-gray-500">Provider</div>
                <div className="font-medium">{info.connection.hasProvider ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-gray-500">Signer</div>
                <div className="font-medium">{info.connection.hasSigner ? 'Yes' : 'No'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-gray-500">Supported Currencies</div>
                <div className="font-medium">{info.supportedCurrencies.join(', ')}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;


