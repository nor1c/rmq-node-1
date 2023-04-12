import amqp from 'amqplib/callback_api'
import bodyParser from 'body-parser'
import express, { Express, json, Request, Response, urlencoded } from 'express'

class Server {
  private app: Express
  private queue: string
  private channel: amqp.Channel | null = null

  constructor() {
    this.app = express()
    this.queue = 'rmq-node-1'
  }

  initApp() {
    this.app.use(json())
    this.app.use(urlencoded({
      extended: true
    }))
  }

  async initMQ(): Promise<void> {
    const url = 'amqp://root:root@localhost'

    await amqp.connect(url, async (err, conn) => {
      if (!conn) {
        throw new Error(`AMQP connection not available on ${url}`)
      }

      await conn.createChannel((err, ch) => {
        this.channel = ch
      })
    })
  }

  async router(): Promise<void> {
    this.app.post('/new', (req: Request, res: Response) => {
      this.channel?.assertQueue(this.queue, {
        durable: false
      })
      this.channel?.sendToQueue(this.queue, Buffer.from(req.body.message))

      res.json({
        message: `Message sent to queue: ${req.body.message}`
      })
    })
  }

  // MQ consumer
  async consumer(): Promise<void> {
    this.channel?.consume(this.queue, (msg) => {
      console.log(`Received %s`, msg?.content.toString());
    }, {
      noAck: true
    })
  }

  async bootstrap(host: string, port: number): Promise<void> {
    this.initApp()
    await this.initMQ()
    this.router()
    this.consumer()

    this.app.listen(3000, () => console.log(`Producer running on http://${host}:${port}`))
  }
}

;(() => {
  new Server().bootstrap("0.0.0.0", 3000)
})()