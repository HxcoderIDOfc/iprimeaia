// Tambahkan di paling atas untuk lokal testing (install: npm install dotenv)
require('dotenv').config();

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fetch = require('node-fetch');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        if (update.connection === 'close') startBot();
        if (update.connection === 'open') console.log('IprimeAI Bot Terhubung ke WhatsApp!');
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        // Auto-Read: Menandai pesan sebagai sudah dibaca (centang biru)
        await sock.readMessages([msg.key]);

        if (text) {
            try {
                // Memanggil API IprimeAI menggunakan API Key dari environment variables
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
                }
            } catch (err) {
                console.error("Gagal menghubungi API IprimeAI:", err);
            }
        }
    });
}

startBot();
