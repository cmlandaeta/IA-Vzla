import { io } from 'socket.io-client';

class ProxyService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.callbacks = {
      onCallStarted: null,
      onCallConnected: null,
      onCallTerminated: null,
      onCallRejected: null,
      onCallProgress: null,
      onError: null,
      onServerLog: null
    };
  }
  
  connect(serverUrl) {
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5
      });
      
      this.socket.on('connect', () => {
        console.log('Connected to proxy server');
        this.isConnected = true;
        resolve();
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
      
      // Event listeners
      this.socket.on('call-started', (data) => {
        this.callbacks.onCallStarted?.(data);
      });
      
      this.socket.on('call-connected', (data) => {
        this.callbacks.onCallConnected?.(data);
      });
      
      this.socket.on('call-terminated', () => {
        this.callbacks.onCallTerminated?.();
      });
      
      this.socket.on('call-rejected', (data) => {
        this.callbacks.onCallRejected?.(data);
      });
      
      this.socket.on('call-progress', () => {
        this.callbacks.onCallProgress?.();
      });
      
      this.socket.on('call-error', (data) => {
        this.callbacks.onError?.(data);
      });
      
      this.socket.on('server-log', (data) => {
        this.callbacks.onServerLog?.(data);
      });
    });
  }
  
  makeCall(type, targetExtension) {
    if (!this.isConnected) {
      throw new Error('Not connected to proxy');
    }
    this.socket.emit('make-call', { type, targetExtension });
  }
  
  hangup() {
    if (!this.isConnected) return;
    this.socket.emit('hangup');
  }
  
  waitForCall(targetExtension) {
    if (!this.isConnected) return;
    this.socket.emit('wait-for-call', { targetExtension });
  }
  
  cancelWait() {
    if (!this.isConnected) return;
    this.socket.emit('cancel-wait');
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }
  
  on(event, callback) {
    this.callbacks[event] = callback;
  }
}

export const proxyService = new ProxyService();