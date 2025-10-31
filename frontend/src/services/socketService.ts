import { io, Socket } from 'socket.io-client';

interface KYCUpdateData {
  userId: string;
  status: 'pending' | 'verified' | 'rejected';
  message?: string;
  timestamp: string;
}

type EventCallback = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(): Socket | null {
    try {
      if (this.socket?.connected) {
        return this.socket;
      }

      // Clean up existing socket if it exists but isn't connected
      if (this.socket) {
        try {
          this.socket.removeAllListeners();
          this.socket.disconnect();
        } catch (e) {
          // Ignore cleanup errors
        }
        this.socket = null;
      }

      // Get server URL from environment variable
      const envApiUrl = import.meta.env.VITE_API_URL;
      const isProduction = import.meta.env.PROD;
      
      // In production, require VITE_API_URL
      if (isProduction) {
        if (!envApiUrl || envApiUrl.trim() === '' || envApiUrl === 'undefined') {
          console.error('❌ [SOCKET] VITE_API_URL is required in production but not set!');
          console.error('❌ [SOCKET] WebSocket connection disabled.');
          console.error('❌ [SOCKET] Set VITE_API_URL in Vercel: Settings → Environment Variables');
          return null;
        }
      }
      
      let serverUrl = envApiUrl || 'http://localhost:5000';
      
      // Check if we're in production and VITE_API_URL is not set
      if (import.meta.env.PROD) {
        if (!envApiUrl || envApiUrl === 'undefined' || envApiUrl.trim() === '') {
          console.warn('⚠️ [SOCKET] VITE_API_URL not set in production! WebSocket will not connect.');
          console.warn('⚠️ [SOCKET] Please set VITE_API_URL in Vercel environment variables.');
          console.warn('⚠️ [SOCKET] Go to: Vercel Dashboard → Your Project → Settings → Environment Variables');
          return null;
        }
        
        // Prevent localhost connections in production
        if (serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1')) {
          console.error('❌ [SOCKET] Cannot use localhost in production. Set VITE_API_URL to your backend URL.');
          console.error('❌ [SOCKET] Current value:', envApiUrl);
          return null;
        }
      }
      
      // Ensure URL doesn't have trailing slash
      serverUrl = serverUrl.replace(/\/+$/, '').trim();
      
      // Validate URL format
      if (!serverUrl || serverUrl === 'undefined' || serverUrl === '') {
        console.error('❌ [SOCKET] Invalid server URL. Check VITE_API_URL environment variable.');
        console.error('❌ [SOCKET] Current value:', envApiUrl);
        return null;
      }
      
      // Convert HTTP to HTTPS for WebSocket (wss://) if needed
      let wsUrl = serverUrl;
      if (serverUrl.startsWith('http://')) {
        wsUrl = serverUrl.replace('http://', 'https://');
        console.warn('⚠️ [SOCKET] HTTP detected, converting to HTTPS for secure WebSocket connection');
      }
      
      // Log the URL being used (helps with debugging)
      console.log('🔌 [SOCKET] Connecting to:', wsUrl);
      console.log('🔌 [SOCKET] Environment variable:', envApiUrl || 'NOT SET (using default localhost:5000)');
      console.log('🔌 [SOCKET] Mode:', import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT');
      
      // Use the WebSocket-ready URL (with https:// if needed)
      const socketUrl = wsUrl.startsWith('https://') ? wsUrl : serverUrl;
      
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        // Force upgrade to secure WebSocket for HTTPS
        upgrade: true,
        rememberUpgrade: true,
        // Auto-detect secure WebSocket based on URL protocol
        secure: socketUrl.startsWith('https://'),
      });

      // Add error handlers to prevent unhandled promise rejections
      this.socket.on('connect', () => {
        console.log('🔗 [SOCKET] Connected to KYC socket server');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 [SOCKET] Disconnected from KYC socket server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.warn('⚠️ [SOCKET] Connection error:', error.message);
        console.warn('⚠️ [SOCKET] Attempted URL:', socketUrl);
        if (import.meta.env.PROD) {
          console.warn('⚠️ [SOCKET] Make sure VITE_API_URL is set in Vercel environment variables');
          console.warn('⚠️ [SOCKET] Current value:', envApiUrl || 'NOT SET');
        } else {
          console.warn('⚠️ [SOCKET] Make sure backend is running on:', serverUrl);
          console.warn('⚠️ [SOCKET] Or set VITE_API_URL in .env file');
        }
        // Don't throw - let it reconnect automatically
      });

      this.socket.on('error', (error) => {
        console.error('❌ [SOCKET] Socket error:', error);
      });

      this.socket.on('kyc_update', (data: KYCUpdateData) => {
        try {
          console.log('🔔 [SOCKET] KYC Update received:', data);
          this.emitToListeners('kyc_update', data);
        } catch (error) {
          console.error('❌ [SOCKET] Error handling KYC update:', error);
        }
      });

      // Payments stream
      this.socket.on('new-payment', (data: any) => {
        try {
          console.log('💸 [SOCKET] New payment received:', data);
          this.emitToListeners('new-payment', data);
        } catch (error) {
          console.error('❌ [SOCKET] Error handling payment update:', error);
        }
      });

      return this.socket;
    } catch (error) {
      console.error('❌ [SOCKET] Failed to connect:', error);
      // Return null instead of throwing
      return null;
    }
  }

  disconnect(): void {
    try {
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
        console.log('🔌 [SOCKET] Disconnected and cleaned up');
      }
    } catch (error) {
      console.error('❌ [SOCKET] Error disconnecting:', error);
      this.socket = null;
    }
  }

  joinKYCRoom(userId: string): void {
    try {
      if (!this.socket) {
        this.connect();
      }
      
      if (this.socket && this.socket.connected) {
        this.socket.emit('join_kyc_room', userId);
        console.log('🏠 [SOCKET] Joined KYC room for user:', userId);
      } else {
        // If not connected, wait for connection and then join
        if (this.socket) {
          const joinAfterConnect = () => {
            if (this.socket?.connected) {
              this.socket.emit('join_kyc_room', userId);
              console.log('🏠 [SOCKET] Joined KYC room for user (after reconnect):', userId);
              this.socket?.off('connect', joinAfterConnect);
            }
          };
          this.socket.on('connect', joinAfterConnect);
        }
      }
    } catch (error) {
      console.error('❌ [SOCKET] Error joining KYC room:', error);
    }
  }

  leaveKYCRoom(userId: string): void {
    try {
      if (this.socket && this.socket.connected) {
        this.socket.emit('leave_kyc_room', userId);
        console.log('🚪 [SOCKET] Left KYC room for user:', userId);
      }
    } catch (error) {
      console.error('❌ [SOCKET] Error leaving KYC room:', error);
    }
  }

  // Event listener management
  addListener(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  removeListener(event: string, callback: EventCallback): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  emitToListeners(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ [SOCKET] Error in socket listener:', error);
        }
      });
    }
  }

  // KYC specific methods
  onKYCUpdate(callback: (data: KYCUpdateData) => void): void {
    this.addListener('kyc_update', callback);
  }

  offKYCUpdate(callback: (data: KYCUpdateData) => void): void {
    this.removeListener('kyc_update', callback);
  }

  // Payments specific methods
  onNewPayment(callback: (data: any) => void): void {
    this.addListener('new-payment', callback);
  }

  offNewPayment(callback: (data: any) => void): void {
    this.removeListener('new-payment', callback);
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Emit custom events
  emit(event: string, data: any): void {
    try {
      if (!this.socket) {
        console.warn('⚠️ [SOCKET] Cannot emit - socket not initialized');
        return;
      }
      
      if (this.socket.connected) {
        this.socket.emit(event, data);
      } else {
        console.warn('⚠️ [SOCKET] Cannot emit - socket not connected. Event:', event);
      }
    } catch (error) {
      console.error('❌ [SOCKET] Error emitting event:', event, error);
    }
  }
}

export default new SocketService();
