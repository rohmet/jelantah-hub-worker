const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const mailService = {
    async sendWithdrawalSuccessEmail(toEmail, amount, disbursementId) {
        const mailOptions = {
            from: `"Jelantah Hub" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Withdrawal Berhasil - Jelantah Hub',
            text: `Halo, penarikan dana Anda sebesar Rp${amount.toLocaleString('id-ID')} dengan ID Disbursement ${disbursementId} telah berhasil diproses. Terima kasih telah berkontribusi!`,
            html: `
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
            `,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[v] Email sent to ${toEmail}: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error(`[x] Failed to send email to ${toEmail}:`, error.message);
            throw error;
        }
    },

    async sendWithdrawalApprovedEmail(toEmail, amount, disbursementId, metodePembayaran, nomorRekening) {
        const mailOptions = {
            from: `"Jelantah Hub" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Withdrawal Disetujui - Jelantah Hub',
            text: `Halo, penarikan dana Anda sebesar Rp${amount.toLocaleString('id-ID')} dengan ID Disbursement ${disbursementId} telah disetujui dan sedang diproses ke ${metodePembayaran} (${nomorRekening}).`,
            html: `
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
            `,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[v] Approval email sent to ${toEmail}: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error(`[x] Failed to send approval email to ${toEmail}:`, error.message);
            throw error;
        }
    },

    async sendWithdrawalFailedEmail(toEmail, amount, disbursementId, failureCode) {
        const mailOptions = {
            from: `"Jelantah Hub" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Withdrawal Gagal - Jelantah Hub',
            text: `Halo, penarikan dana Anda sebesar Rp${amount.toLocaleString('id-ID')} dengan ID Disbursement ${disbursementId} gagal diproses dengan kode kesalahan: ${failureCode}. Saldo Anda telah dikembalikan ke dompet Jelantah Hub Anda.`,
            html: `
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
            `,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[v] Failure email sent to ${toEmail}: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error(`[x] Failed to send failure email to ${toEmail}:`, error.message);
            throw error;
        }
    }
};

module.exports = mailService;
