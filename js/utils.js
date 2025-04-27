export function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
}

export function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 3000);
}

export function debounce(func, delay) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(func, delay);
    };
}
