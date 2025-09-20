import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        console.log('🔗 [METAMASK] Connecting to MetaMask...');
        
        // Request account access (this will show MetaMask popup)
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        console.log('✅ [METAMASK] Account connected:', accounts[0]);
        
        // Create provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Check current network
        const network = await provider.getNetwork();
        console.log('🌐 [METAMASK] Current network:', network.name, network.chainId);
        
        // Switch to Sepolia if not already on it
        if (network.chainId !== 11155111n) {
          console.log('🔄 [METAMASK] Switching to Sepolia testnet...');
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
            });
            console.log('✅ [METAMASK] Switched to Sepolia testnet');
          } catch (switchError: any) {
            // If Sepolia is not added, add it
            if (switchError.code === 4902) {
              console.log('➕ [METAMASK] Adding Sepolia testnet...');
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                }],
              });
              console.log('✅ [METAMASK] Sepolia testnet added and switched');
            } else {
              console.error('❌ [METAMASK] Failed to switch to Sepolia:', switchError);
              throw switchError;
            }
          }
        }
        
        setProvider(provider);
        setAccount(accounts[0]);
        
        console.log('🎉 [METAMASK] Successfully connected to Sepolia testnet');
      } catch (error: any) {
        console.error('❌ [METAMASK] Failed to connect wallet:', error);
        if (error.code === 4001) {
          alert('Please connect your MetaMask wallet to continue');
        } else if (error.code === 4902) {
          alert('Please add Sepolia testnet to your MetaMask');
        } else {
          alert('Failed to connect wallet. Please try again.');
        }
      }
    } else {
      alert('Please install MetaMask extension to continue!');
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
  };

  useEffect(() => {
    // Check if already connected
    if (typeof window.ethereum !== 'undefined') {
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            
            console.log('🔍 [METAMASK] Checking existing connection...');
            console.log('🌐 [METAMASK] Current network:', network.name, network.chainId);
            
            // Check if on Sepolia
            if (network.chainId === 11155111n) {
              setProvider(provider);
              setAccount(accounts[0]);
              console.log('✅ [METAMASK] Already connected to Sepolia');
            } else {
              console.log('⚠️ [METAMASK] Not on Sepolia network, user needs to switch');
            }
          }
        } catch (error) {
          console.error('❌ [METAMASK] Error checking connection:', error);
        }
      };

      checkConnection();

      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('🔄 [METAMASK] Accounts changed:', accounts);
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      };

      // Listen for network changes
      const handleChainChanged = (chainId: string) => {
        console.log('🔄 [METAMASK] Network changed to:', chainId);
        if (chainId === '0xaa36a7') { // Sepolia chain ID
          console.log('✅ [METAMASK] Switched to Sepolia testnet');
        } else {
          console.log('⚠️ [METAMASK] Not on Sepolia network');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected: !!account,
        provider,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};