import { initGunDB } from './gun.js';
import { setupQRCode } from './qrcode.js';
import { initWebRTC } from './webrtc.js';
import { formatTime, showAlert } from './utils.js';

class BunnyChat {
    constructor() {
        this.state = {
            currentUser: null,
            contacts: []
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
            btnScan: document.getElementById('btnScan')
        };
    }
    
    setupEventListeners() {
        this.elements.btnContacts.addEventListener('click', () => this.showContacts());
        this.elements.btnQRCode.addEventListener('click', () => this.showQRCode());
        this.elements.btnScan.addEventListener('click', () => this.startScanner());
    }
    
    checkAuth() {
        const user = localStorage.getItem('bunnyChatUser');
        if (user) {
            this.state.currentUser = JSON.parse(user);
            this.showMainScreen();
        } else {
            this.showAuthScreen();
        }
    }
    
    showAuthScreen() {
        this.elements.container.innerHTML = `
            <div class="auth-screen">
                <button id="btnNewUser">Novo Usuário</button>
                <button id="btnExistingUser">Usuário Existente</button>
            </div>
        `;
        
        document.getElementById('btnNewUser').addEventListener('click', () => this.createUser());
        document.getElementById('btnExistingUser').addEventListener('click', () => this.loadUser());
    }
    
    showMainScreen() {
        this.elements.container.innerHTML = `
            <div class="main-screen">
                <div id="contactsSection" class="hidden"></div>
                <div id="qrSection" class="hidden"></div>
                <div id="scanSection" class="hidden"></div>
            </div>
        `;
    }
    
    // ... outros métodos principais
}

new BunnyChat();
