import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { userAPI } from '../services/api';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const WalletContext = createContext<WalletContextType | null>(null);

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
        
        // Switch to Sepolia if not already on it (where contracts are deployed)
        if (network.chainId !== 11155111n) {
          console.log('🔄 [METAMASK] Switching to Sepolia testnet...');
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID (11155111)
            });
            console.log('✅ [METAMASK] Switched to Sepolia testnet');
          } catch (switchError: any) {
            // If Sepolia is not added, add it
            if (switchError.code === 4902) {
              console.log('➕ [METAMASK] Adding Sepolia testnet...');
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7', // 11155111 in hex
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
              console.log('⚠️ [METAMASK] Continuing with current network - contracts may not be available');
            }
          }
        }
        
        setProvider(provider);
        setAccount(accounts[0]);
        
        // Link wallet to user if user is logged in
        linkWalletToUser(accounts[0]);
        
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

  // Helper function to link wallet address to user
  const linkWalletToUser = async (walletAddress: string) => {
    try {
      // Get user from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.id && walletAddress) {
          try {
            await userAPI.linkWallet(user.id, walletAddress);
            console.log('✅ [WALLET] Linked wallet address to user');
          } catch (linkError) {
            // Silently fail - not critical if linking fails
            console.warn('⚠️ [WALLET] Could not link wallet to user:', linkError);
          }
        }
      }
    } catch (error) {
      // Silently fail - not critical
      console.warn('⚠️ [WALLET] Error linking wallet:', error);
    }
  };

  useEffect(() => {
    // Check if already connected
    if (typeof window.ethereum !== 'undefined' && window.ethereum) {
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum!);
            const network = await provider.getNetwork();
            
            console.log('🔍 [METAMASK] Checking existing connection...');
            console.log('🌐 [METAMASK] Current network:', network.name, network.chainId);
            
            // Check if on Sepolia (where contracts are deployed)
            if (network.chainId === 11155111n) {
              setProvider(provider);
              setAccount(accounts[0]);
              // Link wallet to user if user is logged in
              linkWalletToUser(accounts[0]);
              console.log('✅ [METAMASK] Already connected to Sepolia testnet');
            } else {
              console.log('⚠️ [METAMASK] Not on Sepolia testnet, contracts may not be available');
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
          // Try to link wallet to user if user is logged in
          linkWalletToUser(accounts[0]);
        }
      };

      // Listen for network changes
      const handleChainChanged = (chainId: string) => {
        console.log('🔄 [METAMASK] Network changed to:', chainId);
        if (chainId === '0xaa36a7') { // Sepolia chain ID (11155111)
          console.log('✅ [METAMASK] Switched to Sepolia testnet - contracts available');
        } else {
          console.log('⚠️ [METAMASK] Not on Sepolia testnet - contracts may not be available');
        }
      };

      // Add event listeners with proper typing
      (window.ethereum as any).on('accountsChanged', handleAccountsChanged);
      (window.ethereum as any).on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum && (window.ethereum as any).removeListener) {
          (window.ethereum as any).removeListener('accountsChanged', handleAccountsChanged);
          (window.ethereum as any).removeListener('chainChanged', handleChainChanged);
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