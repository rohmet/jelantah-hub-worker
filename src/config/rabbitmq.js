const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME || 'email_notifications';

async function connectRabbitMQ() {
    try {
        const connectionUrl = new URL(RABBITMQ_URL);
        if (!connectionUrl.searchParams.has('heartbeat')) {
            connectionUrl.searchParams.set('heartbeat', '60');
        }

        const connection = await amqp.connect(connectionUrl.toString());

        connection.on('error', (err) => {
            console.error('[!] RabbitMQ Connection Error Event:', err.message);
        });

        connection.on('close', () => {
            console.error('[!] RabbitMQ Connection Closed. Mencoba terhubung kembali dalam 5 detik...');
            setTimeout(connectRabbitMQ, 5000);
        });

        const channel = await connection.createChannel();

        channel.on('error', (err) => {
            console.error('[!] RabbitMQ Channel Error:', err.message);
        });

        channel.on('close', () => {
            console.warn('[!] RabbitMQ Channel Closed');
        });

        await channel.assertQueue(QUEUE_NAME, {
            durable: true
        });

        console.log(`[*] Connected to RabbitMQ at ${connectionUrl.host}`);
        console.log(`[*] Asserted queue: ${QUEUE_NAME}`);

        return { connection, channel };
    } catch (error) {
        console.error('[!] RabbitMQ Connection Catch Error:', error.message);
        console.log('[*] Gagal terhubung di awal. Mencoba kembali dalam 5 detik...');
        setTimeout(connectRabbitMQ, 5000);
    }
}

module.exports = { connectRabbitMQ, QUEUE_NAME };