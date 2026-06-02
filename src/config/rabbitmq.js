const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.QUEUE_NAME || 'email_notifications';

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, {
            durable: true
        });

        console.log(`[*] Connected to RabbitMQ at ${new URL(RABBITMQ_URL).host}`);
        console.log(`[*] Asserted queue: ${QUEUE_NAME}`);

        return { connection, channel };
    } catch (error) {
        console.error('[!] RabbitMQ Connection Error:', error.message);
        process.exit(1);
    }
}

module.exports = { connectRabbitMQ, QUEUE_NAME };
