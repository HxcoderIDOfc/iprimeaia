const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let sock = null;
let isConnected = false;
let qrCode = null;

app.use(express.static('public'));
app.use(express.json());

// Route untuk halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API untuk mengecek status koneksi
app.get('/api/status', (req, res) => {
    res.json({
        connected: isConnected,
        qrCode: qrCode
    });
});

// Socket.io untuk real-time updates
io.on('connection', (socket) => {
    console.log('Client terhubung:', socket.id);
    
    // Kirim status awal
    socket.emit('status', {
        connected: isConnected,
        qrCode: qrCode
    });
    
    socket.on('disconnect', () => {
        console.log('Client terputus:', socket.id);
    });
});

async function startBot() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('session');
        
        sock = makeWASocket({
            logger: pino({ level: 'silent' }),
            auth: state,
            browser: Browsers.ubuntu('Chrome'),
            printQRInTerminal: false,
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            if (update.connection === 'close') {
                isConnected = false;
                qrCode = null;
                io.emit('status', { connected: false, qrCode: null });
                console.log('Koneksi ditutup, mencoba menghubung kembali...');
                startBot();
            }
            if (update.connection === 'open') {
                isConnected = true;
                qrCode = null;
                io.emit('status', { connected: true, qrCode: null });
                console.log('IprimeAI Bot Terhubung ke WhatsApp! ✅');
            }
            if (update.qr) {
                const qr = update.qr.toString();
                qrCode = qr;
                io.emit('qrCode', qr);
                console.log('QR Code di-update');
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const sender = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

            // Auto-Read: Menandai pesan sebagai sudah dibaca
            await sock.readMessages([msg.key]);

            if (text) {
                try {
                    // Broadcast pesan masuk ke web interface
                    io.emit('incomingMessage', {
                        from: sender,
                        text: text,
                        timestamp: new Date()
                    });

                    // Memanggil API IprimeAI
                    const response = await fetch('https://api.iprimeai.my.id', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'x-api-key': process.env.IPRIME_API_KEY 
                        },
                        body: JSON.stringify({ message: text })
                    });

                    const result = await response.json();
                    
                    // Mengirim jawaban AI ke WhatsApp
                    if (result.pesan) {
                        await sock.sendMessage(sender, { text: result.pesan });
                        
                        // Broadcast pesan keluar ke web interface
                        io.emit('outgoingMessage', {
                            to: sender,
                            text: result.pesan,
                            timestamp: new Date()
                        });
                    }
                } catch (err) {
                    console.error("Gagal menghubungi API IprimeAI:", err);
                }
            }
        });
    } catch (err) {
        console.error('Error starting bot:', err);
        setTimeout(startBot, 5000);
    }
}

// Start bot
startBot();

// Port dari environment atau default 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
