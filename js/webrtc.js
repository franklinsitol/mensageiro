export function initWebRTC(app) {
    app.webrtc = {
        startCall: async (contactId) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                // Implementação simplificada da chamada
                console.log('Chamada iniciada para:', contactId);
                return true;
            } catch (error) {
                console.error('Erro na chamada:', error);
                return false;
            }
        }
    };
}
