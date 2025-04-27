export function initGun(app) {
    const gun = Gun({
        peers: ['https://gun-manhattan.herokuapp.com/gun'],
        localStorage: false,
        radisk: false
    });

    // Compartilha a instância Gun com a app
    app.gun = gun;

    // Métodos para manipulação de dados
    app.methods = {
        createUser: async (userData) => {
            return new Promise((resolve) => {
                gun.get('users').get(userData.id).put(userData, ack => {
                    if (ack.err) {
                        console.error('Erro ao criar usuário:', ack.err);
                        resolve(null);
                    } else {
                        resolve(userData);
                    }
                });
            });
        },

        loadUser: async (userId) => {
            return new Promise((resolve) => {
                gun.get('users').get(userId).once(user => {
                    resolve(user || null);
                });
            });
        },

        addContact: (userId, contactData) => {
            gun.get('users').get(userId).get('contacts').get(contactData.id).put(contactData);
        },

        sendMessage: (messageData) => {
            const messageId = Gun.text.random(16);
            // Para o remetente
            gun.get('users').get(messageData.sender).get('messages').get(messageId).put(messageData);
            // Para o destinatário
            gun.get('users').get(messageData.receiver).get('messages').get(messageId).put(messageData);
            return messageId;
        }
    };

    // Monitoramento de chamadas recebidas
    gun.get('users').get(app.state.currentUser?.id).get('calls').map().on(async (data, callId) => {
        if (!data || !data.offer) return;
        app.handleIncomingCall(data, callId);
    });
}
