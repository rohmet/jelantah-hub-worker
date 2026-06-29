require('dotenv').config();

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.SMTP_PASS;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'hubjelantah@gmail.com';
const MOCK_EMAIL = process.env.MOCK_EMAIL === 'true';

const mailService = {
    async sendEmailViaBrevo(payload) {
        if (MOCK_EMAIL) {
            console.log(`[MOCK] Email would be sent to: ${payload.to.map(t => t.email).join(', ')}`);
            console.log(`[MOCK] Subject: ${payload.subject}`);
            return { messageId: 'mock-id-' + Date.now() };
        }

        try {
            const response = await fetch(BREVO_API_URL, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': BREVO_API_KEY,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Brevo API error: ${response.status}`);
            }

            const data = await response.json();
            console.log(`[v] Email sent successfully via Brevo API:`, data.messageId || data);
            return data;
        } catch (error) {
            console.error(`[x] Failed to send email via Brevo API:`, error.message);
            throw error;
        }
    },

    async sendWithdrawalSuccessEmail(toEmail, amount, disbursementId) {
        const payload = {
            sender: { name: 'Jelantah Hub', email: SENDER_EMAIL },
            to: [{ email: toEmail }],
            subject: 'Withdrawal Berhasil - Jelantah Hub',
            htmlContent: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #2e7d32;">Withdrawal Berhasil!</h2>
                    <p>Halo,</p>
                    <p>Penarikan dana Anda telah berhasil diproses dengan rincian sebagai berikut:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Jumlah:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">Rp${amount.toLocaleString('id-ID')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>ID Disbursement:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><code>${disbursementId}</code></td>
                        </tr>
                    </table>
                    <p style="margin-top: 20px;">Dana akan segera masuk ke rekening Anda. Terima kasih telah menggunakan layanan Jelantah Hub.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
                </div>
            `
        };
        return this.sendEmailViaBrevo(payload);
    },

    async sendWithdrawalApprovedEmail(toEmail, amount, disbursementId, metodePembayaran, nomorRekening) {
        const payload = {
            sender: { name: 'Jelantah Hub', email: SENDER_EMAIL },
            to: [{ email: toEmail }],
            subject: 'Withdrawal Disetujui - Jelantah Hub',
            htmlContent: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #0288d1;">Withdrawal Disetujui & Diproses</h2>
                    <p>Halo,</p>
                    <p>Penarikan dana Anda telah disetujui oleh admin dan sedang diproses dengan rincian berikut:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Jumlah:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">Rp${amount.toLocaleString('id-ID')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Metode:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${metodePembayaran.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>No. Rekening/Tujuan:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><code>${nomorRekening}</code></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>ID Disbursement:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><code>${disbursementId}</code></td>
                        </tr>
                    </table>
                    <p style="margin-top: 20px;">Kami akan mengirimkan notifikasi kembali segera setelah transfer berhasil diselesaikan oleh bank/penyedia jasa pembayaran.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
                </div>
            `
        };
        return this.sendEmailViaBrevo(payload);
    },

    async sendWithdrawalFailedEmail(toEmail, amount, disbursementId, failureCode) {
        const payload = {
            sender: { name: 'Jelantah Hub', email: SENDER_EMAIL },
            to: [{ email: toEmail }],
            subject: 'Withdrawal Gagal - Jelantah Hub',
            htmlContent: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #d32f2f;">Withdrawal Gagal</h2>
                    <p>Halo,</p>
                    <p>Mohon maaf, penarikan dana Anda gagal diproses:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Jumlah:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">Rp${amount.toLocaleString('id-ID')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>ID Disbursement:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;"><code>${disbursementId}</code></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Kode Kegagalan:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; color: #d32f2f;"><strong>${failureCode}</strong></td>
                        </tr>
                    </table>
                    <p style="margin-top: 20px;">Jangan khawatir, <strong>saldo Anda telah dikembalikan sepenuhnya</strong> ke dompet Jelantah Hub Anda. Silakan periksa kembali informasi rekening/tujuan Anda atau hubungi layanan pelanggan kami jika masalah berlanjut.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
                </div>
            `
        };
        return this.sendEmailViaBrevo(payload);
    }
};

module.exports = mailService;
