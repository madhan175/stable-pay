import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handlers to catch unhandled promise rejections and errors
window.addEventListener('error', (event) => {
  // Filter out known extension-related errors that are not critical
  if (event.message?.includes('Receiving end does not exist') || 
      event.message?.includes('Extension context invalidated')) {
    console.warn('⚠️ [GLOBAL] Suppressed extension-related error:', event.message);
    event.preventDefault();
    return;
  }
  console.error('❌ [GLOBAL] Unhandled error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  // Filter out known extension-related errors
  if (error?.message?.includes('Receiving end does not exist') ||
      error?.message?.includes('Extension context invalidated') ||
      error?.message?.includes('Could not establish connection')) {
    console.warn('⚠️ [GLOBAL] Suppressed extension-related promise rejection:', error.message);
    event.preventDefault();
    return;
  }
  console.error('❌ [GLOBAL] Unhandled promise rejection:', error);
  // Prevent the error from showing in console as unhandled
  event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
