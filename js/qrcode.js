export function initQR(app) {
    // Métodos relacionados a QR Code
    app.qr = {
        generate: (data, canvasElement) => {
            return new Promise((resolve) => {
                QRCode.toCanvas(canvasElement, data, {
                    width: 200,
                    margin: 2,
                    color: { dark: '#5A2A3E', light: '#FFF2F5' }
                }, (error) => {
                    if (error) {
                        console.error('Erro ao gerar QR Code:', error);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        },

        scan: (videoElement, callback) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            let scanning = true;

            const scanFrame = () => {
                if (!scanning) return;

                try {
                    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                        canvas.width = videoElement.videoWidth;
                        canvas.height = videoElement.videoHeight;
                        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                        
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: 'dontInvert'
                        });

                        if (code) {
                            try {
                                const qrData = JSON.parse(code.data);
                                if (qrData.app === "BunnyChat") {
                                    scanning = false;
                                    callback(qrData);
                                    return;
                                }
                            } catch (e) {
                                console.error('Erro ao ler QR Code:', e);
                            }
                        }
                    }
                    requestAnimationFrame(scanFrame);
                } catch (e) {
                    console.error('Erro no scanner:', e);
                    scanning = false;
                }
            };
            scanFrame();
            return () => { scanning = false; };
        }
    };
}
