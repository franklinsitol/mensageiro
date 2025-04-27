export function initWebRTC(app) {
    const peerConnectionConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ]
    };

    app.webrtc = {
        startCall: async (contactId) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                app.state.localStream = stream;
                app.elements.localVideo.srcObject = stream;

                const pc = new RTCPeerConnection(peerConnectionConfig);
                app.state.rtcConnection = pc;

                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        app.gun.get('users').get(contactId).get('iceCandidates').put({
                            candidate: e.candidate,
                            from: app.state.currentUser.id,
                            timestamp: Date.now()
                        });
                    }
                };

                pc.ontrack = (e) => {
                    app.elements.remoteVideo.srcObject = e.streams[0];
                    app.state.remoteStream = e.streams[0];
                };

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                const callId = Gun.text.random(16);
                app.gun.get('users').get(contactId).get('calls').get(callId).put({
                    type: 'offer',
                    offer: offer,
                    from: app.state.currentUser.id,
                    timestamp: Date.now()
                });

                return callId;

            } catch (error) {
                console.error('Erro ao iniciar chamada:', error);
                throw error;
            }
        },

        endCall: () => {
            if (app.state.rtcConnection) {
                app.state.rtcConnection.close();
                app.state.rtcConnection = null;
            }
            // Limpar streams de mídia...
        }
    };
}
