const { connectRabbitMQ, QUEUE_NAME } = require('./config/rabbitmq');
const mailService = require('./services/mail-service');

async function startWorker() {
    console.log('--- Jelantah Hub Worker Starting ---');
    
    let isConnecting = false;

    async function connectAndListen() {
        if (isConnecting) return;
        isConnecting = true;

        try {
            const { connection, channel } = await connectRabbitMQ();

            connection.on('close', () => {
                console.error('[!] RabbitMQ Connection Closed. Mencoba terhubung kembali dalam 5 detik...');
                isConnecting = false;
                setTimeout(connectAndListen, 5000);
            });

            connection.on('error', (err) => {
                console.error('[!] RabbitMQ Connection Error Event:', err.message);
            });

            console.log(`[*] Waiting for messages in ${QUEUE_NAME}. To exit press CTRL+C`);

            await channel.consume(QUEUE_NAME, async (msg) => {
                if (msg !== null) {
                    let payload;
                    try {
                        payload = JSON.parse(msg.content.toString());
                        console.log(`[ ] Received message:`, payload.type);

                        if (payload.type === 'WITHDRAWAL_SUCCESS_EMAIL') {
                            const { email, amount, disbursementId } = payload.data;
                            
                            await mailService.sendWithdrawalSuccessEmail(email, amount, disbursementId);
                            
                            channel.ack(msg);
                            console.log(`[v] Success Message acknowledged.`);
                        } else if (payload.type === 'WITHDRAWAL_APPROVED_EMAIL') {
                            const { email, amount, disbursementId, metode_pembayaran, nomor_rekening } = payload.data;
                            
                            await mailService.sendWithdrawalApprovedEmail(email, amount, disbursementId, metode_pembayaran, nomor_rekening);
                            
                            channel.ack(msg);
                            console.log(`[v] Approval Message acknowledged.`);
                        } else if (payload.type === 'WITHDRAWAL_FAILED_EMAIL') {
                            const { email, amount, disbursementId, failureCode } = payload.data;
                            
                            await mailService.sendWithdrawalFailedEmail(email, amount, disbursementId, failureCode);
                            
                            channel.ack(msg);
                            console.log(`[v] Failure Message acknowledged.`);
                        } else {
                            console.warn(`[!] Unknown message type: ${payload.type}`);
                            channel.ack(msg);
                        }
                    } catch (error) {
                        console.error(`[x] Error processing message:`, error.message);
                        
                        try {
                            channel.nack(msg, false, false);
                            console.log(`[!] Message nack-ed (discarded).`);
                        } catch (nackError) {
                            console.error(`[!] Failed to nack message:`, nackError.message);
                        }
                    }
                }
            }, {
                noAck: false
            });

            isConnecting = false;
        } catch (error) {
            console.error('[!] RabbitMQ Connection/Initialization Error:', error.message);
            console.log('[*] Gagal terhubung/inisialisasi. Mencoba kembali dalam 5 detik...');
            isConnecting = false;
            setTimeout(connectAndListen, 5000);
        }
    }

    await connectAndListen();
}

startWorker().catch(err => {
    console.error('[!] Worker failed to start:', err);
});
