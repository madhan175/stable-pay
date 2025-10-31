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

      const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
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
