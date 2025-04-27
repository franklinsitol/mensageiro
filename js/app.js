import { initGun } from './gun.js';
import { initQR } from './qrcode.js';
import { initWebRTC } from './webrtc.js';
import { formatTime, escapeHtml, isMobileDevice } from './utils.js';

class BunnyChat {
    constructor() {
        this.state = {
            currentUser: null,
            currentContact: null,
            contacts: {},
            messages: {},
            currentScreen: 'userSelect',
            processedMessages: new Set()
        };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.checkForExistingUser();
        initGun(this);
        initQR(this);
        initWebRTC(this);
    }
    
    cacheElements() {
        // Cache de elementos DOM
    }
    
    setupEventListeners() {
        // Configuração de event listeners
        document.getElementById('floatContactsBtn').addEventListener('click', () => this.toggleSection('contacts'));
        document.getElementById('floatQRBtn').addEventListener('click', () => {
            this.toggleSection('qr');
            this.showUserQRInfo();
            this.generateQrCode();
        });
        document.getElementById('floatScanBtn').addEventListener('click', () => this.toggleSection('scan'));
    }
    
    // Outros métodos permanecem similares, mas organizados em classes
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const app = new BunnyChat();
    window.app = app; // Para acesso global se necessário
});
