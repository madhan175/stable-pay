/**
 * Mobile wallet connection utilities
 * Supports MetaMask mobile app via deep linking and WalletConnect
 */

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isIOS = (): boolean => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
};

/**
 * Open MetaMask mobile app via deep link
 * For iOS: metamask://wc?uri=...
 * For Android: metamask://wc?uri=...
 */
export const openMetaMaskMobile = async (): Promise<void> => {
  if (!isMobileDevice()) {
    throw new Error('This function is only for mobile devices');
  }

  // MetaMask Universal Link (works for both iOS and Android)
  const metamaskDeepLink = 'https://metamask.app.link/dapp/' + encodeURIComponent(window.location.href);
  
  // Try MetaMask deep link
  window.location.href = metamaskDeepLink;
  
  // Fallback: Open MetaMask app directly
  setTimeout(() => {
    const appScheme = isIOS() 
      ? 'metamask://wc?uri=' + encodeURIComponent(window.location.href)
      : 'metamask://wc?uri=' + encodeURIComponent(window.location.href);
    
    window.location.href = appScheme;
  }, 500);
};

/**
 * Get instructions for connecting MetaMask on mobile
 */
export const getMobileConnectionInstructions = (): {
  title: string;
  steps: string[];
  actionText: string;
  alternative?: string;
} => {
  if (isIOS()) {
    return {
      title: 'Connect MetaMask on iPhone',
      steps: [
        '1. Make sure MetaMask app is installed on your iPhone',
        '2. Option A: Tap "Connect MetaMask" to open MetaMask app',
        '3. Option B: Open this site in MetaMask\'s in-app browser',
        '4. Approve the connection when prompted',
        '5. Your wallet will be connected automatically'
      ],
      actionText: 'Open MetaMask App',
      alternative: 'Or open this site in MetaMask app\'s built-in browser for better compatibility'
    };
  } else {
    return {
      title: 'Connect MetaMask on Android',
      steps: [
        '1. Make sure MetaMask app is installed on your device',
        '2. Tap "Connect MetaMask" button below',
        '3. The MetaMask app will open automatically',
        '4. Approve the connection in MetaMask',
        '5. Return to this app to complete the connection'
      ],
      actionText: 'Open MetaMask App'
    };
  }
};

/**
 * Install MetaMask mobile app links
 */
export const getMetaMaskInstallLinks = (): {
  ios: string;
  android: string;
} => {
  return {
    ios: 'https://apps.apple.com/app/metamask/id1438144202',
    android: 'https://play.google.com/store/apps/details?id=io.metamask'
  };
};

