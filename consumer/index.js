const amqp = require('amqplib/callback_api')

const url = 'amqp://root:root@rabbitmq' // change to localhost if you host your own RabbitMQ service
const queue = 'rmq-node-1'

amqp.connect(url, async function (err, conn) {
  if (!conn) {
    throw new Error(`AMQP connection not available on ${url}`)
  }

  console.log('[log] AMQP connection established!')

  await conn.createChannel(async function (err, channel) {
    await channel.assertQueue(queue, {
      durable: false
    })

    await channel.consume(queue, function (msg) {
      console.log(`Received message: ${msg.content.toString()}`)
    }, {
      noAck: true
    })
  })
})