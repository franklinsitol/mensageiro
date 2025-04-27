// Configuração do Gun.js
const gun = Gun({
    peers: ['https://gun-manhattan.herokuapp.com/gun'],
    localStorage: false,
    radisk: false
});

// Estado da aplicação
const state = {
    currentUser: null,
    currentContact: null,
    contacts: {},
    messages: {},
    currentScreen: 'auth',
    processedMessages: new Set(),
    rtcConnection: null,
    localStream: null,
    remoteStream: null
};

// Elementos DOM
const elements = {
    screens: {
        auth: document.getElementById('authScreen'),
        main: document.getElementById('mainScreen'),
        chat: document.getElementById('chatScreen')
    },
    sections: {
        contacts: document.getElementById('contactsSection'),
        qr: document.getElementById('qrSection'),
        scan: document.getElementById('scanSection')
    },
    buttons: {
        newUser: document.getElementById('newUserBtn'),
        existingUser: document.getElementById('existingUserBtn'),
        backToMain: document.getElementById('backToMainBtn'),
        sendMessage: document.getElementById('sendMessageBtn'),
        copyId: document.getElementById('copyIdBtn'),
        floatContacts: document.getElementById('floatContactsBtn'),
        floatQR: document.getElementById('floatQRBtn'),
        floatScan: document.getElementById('floatScanBtn'),
        call: document.getElementById('callBtn'),
        endCall: document.getElementById('endCallBtn'),
        toggleMute: document.getElementById('toggleMuteBtn')
    },
    inputs: {
        message: document.getElementById('messageInput')
    },
    displays: {
        userName: document.getElementById('userNameDisplay'),
        userId: document.getElementById('userIdDisplay'),
        chatAvatar: document.getElementById('chatAvatar'),
        chatContactName: document.getElementById('chatContactName'),
        chatMessages: document.getElementById('chatMessages'),
        qrVideo: document.getElementById('qrVideo'),
        qrCanvas: document.getElementById('qrCodeCanvas'),
        callContactName: document.getElementById('callContactName'),
        callStatus: document.getElementById('callStatus'),
        remoteVideo: document.getElementById('remoteVideo'),
        localVideo: document.getElementById('localVideo')
    }
};

// Inicialização
function init() {
    setupEventListeners();
    checkExistingUser();
}

// Verifica se há usuário salvo
function checkExistingUser() {
    const savedUser = localStorage.getItem('bunnyChatUser');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        showScreen('main');
        loadContacts();
    }
}

// Configura os listeners
function setupEventListeners() {
    // Navegação
    elements.buttons.newUser.addEventListener('click', showNewUserScreen);
    elements.buttons.existingUser.addEventListener('click', showExistingUserScreen);
    elements.buttons.backToMain.addEventListener('click', () => showScreen('main'));
    
    // Botões flutuantes
    elements.buttons.floatContacts.addEventListener('click', () => showSection('contacts'));
    elements.buttons.floatQR.addEventListener('click', showQRCodeSection);
    elements.buttons.floatScan.addEventListener('click', showScannerSection);
    
    // Chat
    elements.buttons.sendMessage.addEventListener('click', sendMessage);
    elements.inputs.message.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Chamadas
    elements.buttons.call.addEventListener('click', startCall);
    elements.buttons.endCall.addEventListener('click', endCall);
    elements.buttons.toggleMute.addEventListener('click', toggleMute);
    
    // Utilitários
    elements.buttons.copyId.addEventListener('click', copyUserId);
}

// Mostra uma tela específica
function showScreen(screenName) {
    Object.values(elements.screens).forEach(screen => {
        screen.classList.remove('active');
    });
    state.currentScreen = screenName;
    elements.screens[screenName].classList.add('active');
}

// Mostra uma seção específica
function showSection(sectionName) {
    Object.values(elements.sections).forEach(section => {
        section.classList.add('hidden');
    });
    elements.sections[sectionName].classList.remove('hidden');
}

// Tela de novo usuário
function showNewUserScreen() {
    const userName = prompt("Digite seu nome:");
    if (userName) {
        const userId = Gun.text.random(16);
        const user = { id: userId, name: userName };
        
        gun.get('users').get(userId).put(user, ack => {
            if (!ack.err) {
                state.currentUser = user;
                localStorage.setItem('bunnyChatUser', JSON.stringify(user));
                showScreen('main');
            }
        });
    }
}

// Tela de usuário existente
function showExistingUserScreen() {
    const userId = prompt("Digite seu ID de usuário:");
    if (userId) {
        gun.get('users').get(userId).once(user => {
            if (user) {
                state.currentUser = user;
                localStorage.setItem('bunnyChatUser', JSON.stringify(user));
                showScreen('main');
                loadContacts();
            } else {
                alert("Usuário não encontrado");
            }
        });
    }
}

// Seção de QR Code
function showQRCodeSection() {
    showSection('qr');
    elements.displays.userName.textContent = state.currentUser.name;
    elements.displays.userId.textContent = state.currentUser.id;
    
    QRCode.toCanvas(elements.displays.qrCanvas, JSON.stringify({
        userId: state.currentUser.id,
        name: state.currentUser.name
    }), { width: 200 }, error => {
        if (error) console.error(error);
    });
}

// Seção do scanner
function showScannerSection() {
    showSection('scan');
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            elements.displays.qrVideo.srcObject = stream;
            elements.displays.qrVideo.play();
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            function scan() {
                if (elements.displays.qrVideo.readyState === elements.displays.qrVideo.HAVE_ENOUGH_DATA) {
                    canvas.width = elements.displays.qrVideo.videoWidth;
                    canvas.height = elements.displays.qrVideo.videoHeight;
                    ctx.drawImage(elements.displays.qrVideo, 0, 0, canvas.width, canvas.height);
                    
                    const code = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
                    if (code) {
                        try {
                            const { userId, name } = JSON.parse(code.data);
                            addContact(userId, name);
                        } catch (e) {
                            console.error("QR inválido", e);
                        }
                    }
                }
                requestAnimationFrame(scan);
            }
            scan();
        })
        .catch(err => {
            console.error("Erro ao acessar câmera", err);
            alert("Não foi possível acessar a câmera");
        });
}

// Adiciona um contato
function addContact(userId, userName) {
    if (!userId || !userName || userId === state.currentUser.id) return;
    
    const contact = { id: userId, name: userName };
    state.contacts[userId] = contact;
    
    // Salva no GunDB
    gun.get('users').get(state.currentUser.id).get('contacts').get(userId).put(contact);
    
    // Atualiza a lista
    renderContacts();
    showSection('contacts');
}

// Renderiza os contatos
function renderContacts() {
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '';
    
    Object.values(state.contacts).forEach(contact => {
        const contactEl = document.createElement('div');
        contactEl.className = 'contact-item';
        contactEl.innerHTML = `
            <div class="avatar">${contact.name.charAt(0)}</div>
            <div>${contact.name}</div>
        `;
        
        contactEl.addEventListener('click', () => {
            openChat(contact);
        });
        
        contactsList.appendChild(contactEl);
    });
}

// Abre o chat com um contato
function openChat(contact) {
    state.currentContact = contact;
    elements.displays.chatAvatar.textContent = contact.name.charAt(0);
    elements.displays.chatContactName.textContent = contact.name;
    showScreen('chat');
    
    // Carrega as mensagens
    loadMessages();
}

// Carrega as mensagens
function loadMessages() {
    elements.displays.chatMessages.innerHTML = '';
    
    gun.get('users').get(state.currentUser.id).get('messages').map().once((msg, id) => {
        if (!msg || state.processedMessages.has(id)) return;
        
        state.processedMessages.add(id);
        
        if ((msg.sender === state.currentContact.id && msg.receiver === state.currentUser.id) || 
            (msg.sender === state.currentUser.id && msg.receiver === state.currentContact.id)) {
            
            renderMessage(msg);
        }
    });
}

// Renderiza uma mensagem
function renderMessage(msg) {
    const isSender = msg.sender === state.currentUser.id;
    const messageEl = document.createElement('div');
    messageEl.className = `message ${isSender ? 'sent' : 'received'}`;
    messageEl.innerHTML = `
        <div class="message-content">${msg.text}</div>
        <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
    `;
    elements.displays.chatMessages.appendChild(messageEl);
    elements.displays.chatMessages.scrollTop = elements.displays.chatMessages.scrollHeight;
}

// Envia uma mensagem
function sendMessage() {
    const text = elements.inputs.message.value.trim();
    if (!text || !state.currentContact) return;
    
    const msg = {
        sender: state.currentUser.id,
        receiver: state.currentContact.id,
        text: text,
        timestamp: Date.now()
    };
    
    const msgId = Gun.text.random(16);
    gun.get('users').get(state.currentUser.id).get('messages').get(msgId).put(msg);
    gun.get('users').get(state.currentContact.id).get('messages').get(msgId).put(msg);
    
    elements.inputs.message.value = '';
    renderMessage(msg);
}

// Chamadas WebRTC
async function startCall() {
    if (!state.currentContact) return;
    
    try {
        state.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        elements.displays.localVideo.srcObject = state.localStream;
        
        state.rtcConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        state.localStream.getTracks().forEach(track => {
            state.rtcConnection.addTrack(track, state.localStream);
        });
        
        state.rtcConnection.onicecandidate = ({ candidate }) => {
            if (candidate) {
                gun.get('users').get(state.currentContact.id).get('ice').put({
                    candidate,
                    from: state.currentUser.id
                });
            }
        };
        
        state.rtcConnection.ontrack = ({ streams }) => {
            state.remoteStream = streams[0];
            elements.displays.remoteVideo.srcObject = streams[0];
        };
        
        const offer = await state.rtcConnection.createOffer();
        await state.rtcConnection.setLocalDescription(offer);
        
        const callId = Gun.text.random(16);
        gun.get('users').get(state.currentContact.id).get('calls').get(callId).put({
            offer,
            from: state.currentUser.id
        });
        
        document.getElementById('callScreen').classList.add('active');
        elements.displays.callContactName.textContent = state.currentContact.name;
        
    } catch (err) {
        console.error("Erro na chamada:", err);
    }
}

function endCall() {
    if (state.rtcConnection) state.rtcConnection.close();
    if (state.localStream) state.localStream.getTracks().forEach(track => track.stop());
    document.getElementById('callScreen').classList.remove('active');
}

function toggleMute() {
    if (state.localStream) {
        const audioTrack = state.localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        elements.buttons.toggleMute.innerHTML = audioTrack.enabled ? 
            '<i class="fas fa-microphone"></i>' : 
            '<i class="fas fa-microphone-slash"></i>';
    }
}

// Utilitários
function copyUserId() {
    navigator.clipboard.writeText(state.currentUser.id);
    alert("ID copiado!");
}

// Inicia o app quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
