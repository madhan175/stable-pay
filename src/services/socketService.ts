import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to KYC socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from KYC socket server');
    });

    this.socket.on('kyc_update', (data) => {
      console.log('KYC Update received:', data);
      this.emitToListeners('kyc_update', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinKYCRoom(userId) {
    if (this.socket) {
      this.socket.emit('join_kyc_room', userId);
    }
  }

  leaveKYCRoom(userId) {
    if (this.socket) {
      this.socket.emit('leave_kyc_room', userId);
    }
  }

  // Event listener management
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emitToListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket listener:', error);
        }
      });
    }
  }

  // KYC specific methods
  onKYCUpdate(callback) {
    this.addListener('kyc_update', callback);
  }

  offKYCUpdate(callback) {
    this.removeListener('kyc_update', callback);
  }
}

export default new SocketService();
