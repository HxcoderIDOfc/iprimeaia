# IprimeAI WhatsApp Bot dengan Web Interface

Bot WhatsApp otomatis yang terhubung dengan AI IprimeAI. Memiliki web dashboard untuk monitoring dan session management.

## 🎯 Fitur

✅ **QR Code Web Interface** - Scan sekali, session tersimpan otomatis  
✅ **Web Dashboard** - Monitor bot secara real-time  
✅ **Auto-Reconnect** - Bot otomatis reconnect jika putus  
✅ **Activity Log** - Catat semua pesan masuk/keluar  
✅ **Response Otomatis** - Balas pesan dengan AI IprimeAI  

## 📋 Persyaratan

- Node.js 14+
- npm atau yarn
- API Key IprimeAI

## 🚀 Instalasi Lokal

```bash
# Clone repository
git clone https://github.com/HxcoderIDOfc/iprimeaia.git
cd iprimeaia

# Install dependencies
npm install

# Setup environment variable
echo 'IPRIME_API_KEY=your_api_key_here' > .env

# Jalankan
npm start
```

Buka browser ke `http://localhost:3000`

## 🌐 Deploy ke Koyeb

### Via Koyeb Dashboard:

1. Push code ke GitHub
2. Login ke [Koyeb.com](https://koyeb.com)
3. Klik **Create Service**
4. Pilih **GitHub** as source
5. Pilih repository `iprimeaia`
6. Build command: `npm install`
7. Start command: `npm start`
8. Environment Variables:
   - `IPRIME_API_KEY`: Your API Key
   - `PORT`: 8000
9. Klik **Deploy**

### Via CLI:

```bash
# Install Koyeb CLI
npm install -g @koyeb/cli

# Login
koyeb login

# Deploy
koyeb service create iprimeaia \
  --git github.com/HxcoderIDOfc/iprimeaia \
  --git-branch main \
  --git-builder buildpack \
  --env IPRIME_API_KEY=your_api_key \
  --env PORT=8000 \
  --ports 8000:http
```

## 📱 Cara Menggunakan

1. **Buka Dashboard**: `https://your-app.koyeb.app`
2. **Scan QR Code**: Gunakan WhatsApp untuk scan QR yang ditampilkan
3. **Bot Aktif**: Setelah scan, bot siap menerima pesan
4. **Monitoring**: Lihat semua pesan di Activity Log

## 🔧 Konfigurasi

Buat file `.env`:

```env
IPRIME_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=production
```

## 📁 Struktur Project

```
.
├── server.js              # Backend utama
├── package.json           # Dependencies
├── package-lock.json      # Lock file
├── Procfile              # Koyeb/Heroku configuration
├── public/
│   ├── index.html        # Web interface
│   ├── style.css         # Styling
│   └── script.js         # Frontend logic
└── session/              # Session WhatsApp (auto-created)
```

## 🌍 Environment Variables

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `IPRIME_API_KEY` | API Key IprimeAI | `sk_live_xxx` |
| `PORT` | Port server | `3000` atau `8000` |
| `NODE_ENV` | Environment | `production` |

## ⚙️ Troubleshooting

### QR Code tidak muncul?
- Restart server
- Cek console untuk error
- Pastikan IPRIME_API_KEY benar

### Bot tidak merespon?
- Pastikan WhatsApp terhubung (status Hijau)
- Cek IPRIME_API_KEY
- Lihat Activity Log untuk error

### Deploy gagal?
- Pastikan `package-lock.json` sudah di-commit
- Cek `Procfile` ada di root directory
- Pastikan `npm start` berfungsi lokal

## 📝 License

ISC

## 👤 Author

HxcoderIDOfc

## 💬 Support

Jika ada pertanyaan atau issue, buat issue di repository ini.
