# Task: Inisialisasi Project Worker & Implementasi RabbitMQ Consumer (Jelantah-Hub Worker)

## Latar Belakang
Repostori ini (`jelantah-hub-worker`) beroperasi sebagai *microservice* yang bertugas murni memproses pekerjaan berat di latar belakang (*background jobs*), terpisah dari aplikasi REST API utama (`jelantah-hub`).
Tugas utama dan pertama untuk repositori ini adalah menjadi **Consumer** dari RabbitMQ untuk memproses antrean pengiriman email notifikasi (misalnya: saat penyetujuan *disbursement* sukses).

## Spesifikasi Tugas

### 1. Inisialisasi Proyek Baru
- Lakukan inisialisasi proyek Node.js: `npm init -y`
- Install dependencies utama:
  - `amqplib` (Klien RabbitMQ)
  - `dotenv` (Manajemen environment variable)
  - `nodemailer` atau SDK email lainnya seperti `@sendgrid/mail` (Untuk pengiriman email)
- Buat file `.env` yang berisikan environment variables:
  ```env
  RABBITMQ_URL=amqp://localhost # Sesuaikan dengan server RabbitMQ
  SMTP_HOST=smtp.example.com
  SMTP_PORT=587
  SMTP_USER=your_email@example.com
  SMTP_PASS=your_password
  ```

### 2. Konfigurasi Koneksi RabbitMQ
- Buat modul koneksi (misal di `src/config/rabbitmq.js`).
- Modul ini bertugas:
  1. Terhubung ke server RabbitMQ menggunakan `RABBITMQ_URL`.
  2. Membuka sebuah *Channel*.
  3. Memastikan antrean (queue) bernama `email_notifications` tersedia dengan `channel.assertQueue('email_notifications', { durable: true })`.

### 3. Implementasi Layanan Email (Mail Service)
- Buat file layanan (misal di `src/services/mail-service.js`).
- Konfigurasikan *transporter* (menggunakan `nodemailer` atau penyedia lain).
- Buat method `sendWithdrawalSuccessEmail(toEmail, amount, disbursementId)` yang akan merender dan mengirim template email ke *user*. (Gunakan format teks/HTML yang rapi).

### 4. Implementasi Consumer Utama
- Buat entri poin (misal `src/index.js` atau `src/worker.js`).
- Panggil koneksi dari RabbitMQ dan jalankan `channel.consume('email_notifications', async (msg) => { ... })`.
- **Alur Pemrosesan Pesan (Message Processing):**
  1. Ubah `msg.content.toString()` menjadi JSON.
  2. Periksa tipe pesan (contoh: `if (payload.type === 'WITHDRAWAL_SUCCESS_EMAIL')`).
  3. Ambil data payload (`email`, `amount`, `disbursementId`).
  4. Panggil `mailService.sendWithdrawalSuccessEmail(...)` untuk mengirim email beneran.
  5. Jika **berhasil**, panggil `channel.ack(msg)` agar pesan dihapus dari antrean RabbitMQ.
  6. Jika **gagal** (error), tangkap menggunakan `try-catch`, log error-nya, lalu kembalikan pesan ke antrean dengan `channel.nack(msg, false, true)` agar bisa dicoba lagi (*requeue*).

## Kriteria Penerimaan (Acceptance Criteria)
- [ ] Proyek Node.js berhasil berjalan sebaga aplikasi *standalone*.
- [ ] Berhasil *connect & listen* ke RabbitMQ.
- [ ] Sanggup menerima pesan, melakukan *parsing* JSON dengan aman, dan menerjemahkannya ke aksi pengiriman email.
- [ ] Email benar-benar terkirim (bisa dites ke inbox pribadi/Mailtrap/MailHog).
- [ ] Menyediakan penanganan kegagalan (*error handling* / *nack* / *ack* logis) pada status pengiriman email.

## Referensi
- Dokumentasi `amqplib`: [amqplib GitHub](https://github.com/amqp-node/amqplib)
- Dokumentasi NodeMailer: [Nodemailer](https://nodemailer.com/about/)