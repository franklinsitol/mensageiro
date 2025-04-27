export function setupQRCode(app) {
    app.qrcode = {
        generate: (element, data) => {
            QRCode.toCanvas(element, data, { width: 200 }, (error) => {
                if (error) console.error(error);
            });
        },
        
        scan: (videoElement, callback) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const scanFrame = () => {
                if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    
                    const code = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
                    if (code) callback(code.data);
                }
                requestAnimationFrame(scanFrame);
            };
            scanFrame();
        }
    };
}
