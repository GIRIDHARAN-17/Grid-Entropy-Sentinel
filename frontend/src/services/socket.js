import { io } from 'socket.io-client';

const SOCKET_URL = 'ws://localhost:8000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io(SOCKET_URL, {
            path: '/ws',
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to Grid WebSocket');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from Grid WebSocket');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    onTelemetry(callback) {
        if (this.socket) {
            this.socket.on('telemetry', callback);
        }
    }

    onAlert(callback) {
        if (this.socket) {
            this.socket.on('alert', callback);
        }
    }
}

export default new SocketService();
