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
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('🔗 [SOCKET] Connected to KYC socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 [SOCKET] Disconnected from KYC socket server');
    });

    this.socket.on('kyc_update', (data: KYCUpdateData) => {
      console.log('🔔 [SOCKET] KYC Update received:', data);
      this.emitToListeners('kyc_update', data);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinKYCRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('join_kyc_room', userId);
      console.log('🏠 [SOCKET] Joined KYC room for user:', userId);
    }
  }

  leaveKYCRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('leave_kyc_room', userId);
      console.log('🚪 [SOCKET] Left KYC room for user:', userId);
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

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();
