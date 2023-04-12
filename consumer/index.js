const amqp = require('amqplib/callback_api')

const url = 'amqp://root:root@localhost'
const queue = 'rmq-node-1'

amqp.connect(url, function (err, conn) {
  if (!conn) {
    throw new Error(`AMQP connection not available on ${url}`)
  }

  console.log('AMQP connection establised!');

  conn.createChannel(function (err, channel) {
    channel.assertQueue(queue, {
      durable: false
    })

    channel.consume(queue, function (msg) {
      console.log(`Received queue: ${msg.content.toString()}`)
    }, {
      noAck: true
    })
  })
})