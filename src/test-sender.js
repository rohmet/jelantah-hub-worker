const { connectRabbitMQ, QUEUE_NAME } = require('./config/rabbitmq');

async function sendTest() {
    const { channel, connection } = await connectRabbitMQ();
    const payload = {
        type: 'WITHDRAWAL_SUCCESS_EMAIL',
        data: {
            email: 'harahmanabdarib@gmail.com',
            amount: 50000,
            disbursementId: 'TRX-12345'
        }
    };

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log(" [x] Sent Test Message");
    
    setTimeout(() => { connection.close(); process.exit(0); }, 500);
}
sendTest();