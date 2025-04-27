import { initGunDB } from './gun.js';
import { setupQRCode } from './qrcode.js';
import { initWebRTC } from './webrtc.js';
import { formatTime, showAlert, escapeHtml } from './utils.js';

class BunnyChat {
    constructor() {
        this.state = {
            currentUser: null,
            currentContact: null,
            contacts: {},
            messages: new Set(),
            currentScreen: 'auth',
            rtcConnection: null,
            localStream: null
        };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        initGunDB(this);
        setupQRCode(this);
        initWebRTC(this);
        this.checkAuth();
    }
    
    cacheElements() {
        this.elements = {
            container: document.querySelector('.container'),
            floatBtns: document.querySelector('.float-buttons'),
            btnContacts: document.getElementById('btnContacts'),
            btnQRCode: document.getElementById('btnQRCode'),
            btnScan: document.getElementById('btnScan'),
            callContainer: document.getElementById('callContainer')
        };
    }
    
    setupEventListeners() {
        // Botões flutuantes
        this.elements.btnContacts.addEventListener('click', () => this.showSection('contacts'));
        this.elements.btnQRCode.addEventListener('click', () => this.showQRCodeSection());
        this.elements.btnScan.addEventListener('click', () => this.showScannerSection());
        
        // Outros listeners...
    }
    
    showSection(section) {
        // Esconde todas as seções primeiro
        document.querySelectorAll('.main-section').forEach(el => {
            el.classList.add('hidden');
        });
        
        // Mostra a seção solicitada
        document.getElementById(`${section}Section`).classList.remove('hidden');
        
        // Ações específicas
        if (section === 'qr') this.generateQrCode();
        if (section === 'scan') this.startQrScanner();
    }
    
    async generateQrCode() {
        if (!this.state.currentUser) return;
        
        const qrData = JSON.stringify({
            userId: this.state.currentUser.id,
            name: this.state.currentUser.name,
            timestamp: Date.now()
        });
        
        const canvas = document.getElementById('qrCanvas');
        await this.qrcode.generate(canvas, qrData);
    }
    
    startQrScanner() {
        const video = document.getElementById('qrVideo');
        this.qrcode.scan(video, (data) => {
            try {
                const { userId, name } = JSON.parse(data);
                this.addContact(userId, name);
            } catch (e) {
                showAlert('QR inválido', 'error');
            }
        });
    }
    
    // ... outros métodos permanecem similares ao original
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BunnyChat();
class BunnyChat {
    // ... métodos anteriores

    showQRCodeSection() {
        this.showSection('qr');
        if (!this.state.currentUser) return;
        
        document.getElementById('qrUserName').textContent = this.state.currentUser.name;
        document.getElementById('qrUserId').textContent = this.state.currentUser.id;
    }

    addContact(userId, userName) {
        if (!userId || !userName) return;
        
        this.state.contacts[userId] = { id: userId, name: userName };
        this.renderContacts();
        showAlert(`${userName} adicionado!`, 'success');
    }

    renderContacts() {
        const list = document.getElementById('contactsList');
        list.innerHTML = '';
        
        Object.values(this.state.contacts).forEach(contact => {
            const contactEl = document.createElement('div');
            contactEl.className = 'contact-item';
            contactEl.innerHTML = `
                <div class="avatar">${contact.name.charAt(0)}</div>
                <div class="contact-name">${contact.name}</div>
                <button class="chat-btn" data-id="${contact.id}">
                    <i class="fas fa-comment"></i>
                </button>
            `;
            
            contactEl.querySelector('.chat-btn').addEventListener('click', () => {
                this.openChat(contact);
            });
            
            list.appendChild(contactEl);
        });
    }

    openChat(contact) {
        this.state.currentContact = contact;
        this.showSection('chat');
        this.loadMessages();
    }
}
});
