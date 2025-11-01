import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { userAPI } from '../services/api';
import { isMobileDevice, isMetaMaskInstalled, openMetaMaskMobile } from '../utils/mobileWallet';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isMobile: boolean;
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
  const [isMobile] = useState<boolean>(isMobileDevice());

  const connect = async () => {
    const mobile = isMobileDevice();
    
    // For mobile devices without MetaMask browser extension
    if (mobile && !isMetaMaskInstalled()) {
      try {
        console.log('📱 [METAMASK] Opening MetaMask mobile app...');
        
        // Store connection attempt in localStorage
        localStorage.setItem('metamask_connection_attempt', Date.now().toString());
        
        await openMetaMaskMobile();
        
        // Set up focus listener to check for connection when user returns
        const handleFocus = async () => {
          console.log('👀 [METAMASK] Page regained focus, checking for connection...');
          
          // Wait a moment for any injection to complete
          setTimeout(async () => {
            if (typeof window.ethereum !== 'undefined') {
              try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                  await handleConnection(accounts);
                  window.removeEventListener('focus', handleFocus);
                  localStorage.removeItem('metamask_connection_attempt');
                }
              } catch (error) {
                console.error('❌ [METAMASK] Error checking connection after focus:', error);
              }
            }
          }, 1000);
        };
        
        window.addEventListener('focus', handleFocus);
        
        // Also check periodically (in case focus event doesn't fire)
        const checkInterval = setInterval(async () => {
          if (typeof window.ethereum !== 'undefined') {
            try {
              const accounts = await window.ethereum.request({ method: 'eth_accounts' });
              if (accounts.length > 0) {
                await handleConnection(accounts);
                clearInterval(checkInterval);
                window.removeEventListener('focus', handleFocus);
                localStorage.removeItem('metamask_connection_attempt');
              }
            } catch (error) {
              // Silent fail
            }
          }
          
          // Stop checking after 30 seconds
          const attemptTime = localStorage.getItem('metamask_connection_attempt');
          if (attemptTime && Date.now() - parseInt(attemptTime) > 30000) {
            clearInterval(checkInterval);
            window.removeEventListener('focus', handleFocus);
          }
        }, 2000);
        
        return;
      } catch (error) {
        console.error('❌ [METAMASK] Failed to open MetaMask mobile app:', error);
        alert('Please install MetaMask app from the App Store (iOS) or Google Play Store (Android)');
        return;
      }
    }
    
    // Standard connection flow for desktop or mobile with extension
    if (typeof window.ethereum !== 'undefined') {
      try {
        console.log('🔗 [METAMASK] Connecting to MetaMask...');
        
        // Request account access (this will show MetaMask popup)
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }
        
        await handleConnection(accounts);
        
      } catch (error: any) {
        console.error('❌ [METAMASK] Failed to connect wallet:', error);
        if (error.code === 4001) {
          alert('Please connect your MetaMask wallet to continue');
        } else if (error.code === 4902) {
          alert('Please add Sepolia testnet to your MetaMask');
        } else {
          if (mobile) {
            alert('Failed to connect. Make sure MetaMask app is installed and try again.');
          } else {
            alert('Failed to connect wallet. Please try again.');
          }
        }
      }
    } else {
      if (mobile) {
        alert('Please install MetaMask app from the App Store (iOS) or Google Play Store (Android)');
      } else {
        alert('Please install MetaMask extension to continue!');
      }
    }
  };

  const handleConnection = async (accounts: string[]) => {
    console.log('✅ [METAMASK] Account connected:', accounts[0]);
    
    // Create provider
    const provider = new ethers.BrowserProvider(window.ethereum!);
    
    // Check current network
    const network = await provider.getNetwork();
    console.log('🌐 [METAMASK] Current network:', network.name, network.chainId);
    
    // Switch to Sepolia if not already on it (where contracts are deployed)
    if (network.chainId !== 11155111n) {
      console.log('🔄 [METAMASK] Switching to Sepolia testnet...');
      try {
        await window.ethereum!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID (11155111)
        });
        console.log('✅ [METAMASK] Switched to Sepolia testnet');
      } catch (switchError: any) {
        // If Sepolia is not added, add it
        if (switchError.code === 4902) {
          console.log('➕ [METAMASK] Adding Sepolia testnet...');
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7', // 11155111 in hex
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sepolia.org'],
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
      if (!savedUser) {
        console.log('ℹ️ [WALLET] No user logged in, skipping wallet link');
        return;
      }

      const user = JSON.parse(savedUser);
      if (!user?.id) {
        console.warn('⚠️ [WALLET] User ID not found in localStorage');
        return;
      }

      if (!walletAddress) {
        console.warn('⚠️ [WALLET] Wallet address is empty');
        return;
      }

      try {
        // Pass phone number if available (helps resolve mock users to real users)
        const phone = user.phone || null;
        const response = await userAPI.linkWallet(user.id, walletAddress, phone);
        
        if (response.data?.success) {
          console.log('✅ [WALLET] Linked wallet address to user:', walletAddress.substring(0, 10) + '...');
        } else if (response.data?.skipped) {
          // Wallet linking was skipped (mock user) - that's okay
          console.log('ℹ️ [WALLET] Wallet linking skipped:', response.data.message);
        } else {
          console.warn('⚠️ [WALLET] Wallet link returned unsuccessful:', response.data);
        }
      } catch (linkError: any) {
        // Check error type and log appropriately
        const errorResponse = linkError?.response?.data;
        const errorMessage = errorResponse?.message || errorResponse?.error || linkError?.message;
        
        // If user not found or skipped (mock user), that's okay
        if (linkError?.response?.status === 404 || 
            errorMessage?.includes('not found') ||
            linkError?.response?.data?.skipped) {
          console.log('ℹ️ [WALLET] Wallet linking skipped or user not found:', errorMessage || linkError?.response?.data?.message);
          return;
        }
        
        // If it's a validation error, log it but don't show to user
        if (linkError?.response?.status === 400) {
          console.warn('⚠️ [WALLET] Validation error:', errorMessage);
          return;
        }
        
        // If it's a UUID format error (mock user), log info message
        if (errorMessage?.includes('invalid input syntax for type uuid') || 
            errorMessage?.includes('UUID')) {
          console.log('ℹ️ [WALLET] Mock user detected - complete phone verification to link wallet');
          return;
        }
        
        // For other errors, log but don't block wallet connection
        console.warn('⚠️ [WALLET] Could not link wallet to user:', {
          status: linkError?.response?.status,
          message: errorMessage,
          details: errorResponse?.details
        });
      }
    } catch (error: any) {
      // Silently fail - not critical
      console.warn('⚠️ [WALLET] Error in linkWalletToUser:', error?.message || error);
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
        isMobile,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};