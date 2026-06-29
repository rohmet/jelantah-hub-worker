const { connectRabbitMQ, QUEUE_NAME } = require('./config/rabbitmq');
const mailService = require('./services/mail-service');

async function startWorker() {
    console.log('--- Jelantah Hub Worker Starting ---');
    
    const { channel } = await connectRabbitMQ();

    console.log(`[*] Waiting for messages in ${QUEUE_NAME}. To exit press CTRL+C`);

    channel.consume(QUEUE_NAME, async (msg) => {
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
                
                channel.nack(msg, false, false);
                console.log(`[!] Message nack-ed (discarded).`);
            }
        }
    }, {
        noAck: false
    });
}

startWorker().catch(err => {
    console.error('[!] Worker failed to start:', err);
});
