const socket = io();
let incomingCount = 0;
let outgoingCount = 0;

// QR Code library
const qrLibrary = document.createElement('script');
qrLibrary.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
document.head.appendChild(qrLibrary);

function generateQRCode(text) {
    const qrDisplay = document.getElementById('qrDisplay');
    qrDisplay.innerHTML = ''; // Clear previous QR code
    
    new QRCode(qrDisplay, {
        text: text,
        width: 250,
        height: 250,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

function updateStatus(connected) {
    const badge = document.getElementById('statusBadge');
    const statusDot = badge.querySelector('.status-dot');
    const statusText = badge.textContent;
    const connectionStatus = document.getElementById('connectionStatus');
    
    if (connected) {
        statusDot.classList.add('connected');
        badge.innerHTML = '<span class="status-dot connected"></span>Terhubung';
        connectionStatus.textContent = '✅ Terhubung';
        connectionStatus.style.color = '#4caf50';
        document.getElementById('qrStatus').textContent = 'Bot Aktif - Siap Menerima Pesan';
    } else {
        statusDot.classList.remove('connected');
        badge.innerHTML = '<span class="status-dot"></span>Terputus';
        connectionStatus.textContent = '❌ Terputus';
        connectionStatus.style.color = '#f44236';
        document.getElementById('qrStatus').textContent = 'Menunggu QR Code...';
    }
}

function addMessage(type, from, text, timestamp) {
    const container = document.getElementById('messagesContainer');
    
    // Remove empty message if exists
    const emptyMsg = container.querySelector('.empty-message');
    if (emptyMsg) emptyMsg.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const time = new Date(timestamp).toLocaleTimeString('id-ID');
    const label = type === 'incoming' ? '📥 Masuk' : '📤 Keluar';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-label">${label}</span>
            <span>${from}</span>
            <span>${time}</span>
        </div>
        <div class="message-text">${escapeHtml(text)}</div>
    `;
    
    container.insertBefore(messageDiv, container.firstChild);
    
    // Keep only last 50 messages
    const messages = container.querySelectorAll('.message');
    if (messages.length > 50) {
        messages[messages.length - 1].remove();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Socket events
socket.on('connect', () => {
    console.log('Terhubung ke server');
});

socket.on('status', (data) => {
    console.log('Status:', data);
    updateStatus(data.connected);
    if (data.qrCode) {
        generateQRCode(data.qrCode);
    }
});

socket.on('qrCode', (qrCode) => {
    console.log('QR Code diterima');
    generateQRCode(qrCode);
    document.getElementById('qrStatus').textContent = 'Scan QR Code dengan WhatsApp Anda';
});

socket.on('incomingMessage', (data) => {
    console.log('Pesan masuk:', data);
    incomingCount++;
    document.getElementById('incomingCount').textContent = incomingCount;
    addMessage('incoming', data.from, data.text, data.timestamp);
});

socket.on('outgoingMessage', (data) => {
    console.log('Pesan keluar:', data);
    outgoingCount++;
    document.getElementById('outgoingCount').textContent = outgoingCount;
    addMessage('outgoing', data.to, data.text, data.timestamp);
});

socket.on('disconnect', () => {
    console.log('Terputus dari server');
    updateStatus(false);
});

// Initialize
window.addEventListener('load', () => {
    console.log('Aplikasi dimulai');
});
