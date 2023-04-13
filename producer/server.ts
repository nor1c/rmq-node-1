import amqp, { Connection, Message } from 'amqplib/callback_api'
import express, { Express, json, Request, Response, urlencoded } from 'express'

class Server {
  private app: Express
  private queue: string
  private channel: amqp.Channel | null = null

  constructor() {
    this.app = express()
    this.queue = 'rmq-node-1'
  }

  initApp(): void {
    this.app.use(json())
    this.app.use(urlencoded({
      extended: true
    }))
  }

  async initMQ(): Promise<void> {
    const url = 'amqp://root:root@rabbitmq' // change to localhost if you host your own RabbitMQ service

    await amqp.connect(url, async (err, conn: Connection) => {
      if (!conn) {
        throw new Error(`AMQP connection not available on ${url}`)
      }

      await conn.createChannel((err, ch) => {
        this.channel = ch
      })
    })
  }

  // make sure that the queue exists
  async assertQueue(): Promise<void> {
    await this.channel?.assertQueue(this.queue, {
      durable: false
    })
  }

  async sendMessage(message: any): Promise<void> {
    await this.assertQueue()
    await this.channel?.sendToQueue(this.queue, message)
  }

  async router(): Promise<void> {
    this.app.post('/new', async (req: Request, res: Response) => {
      const loop = req.body.loop
      
      const sendMsgFunction = () => this.sendMessage(Buffer.from(req.body.message))

      const msgInt = setInterval(sendMsgFunction, 1000)

      setTimeout(() => {
        clearInterval(msgInt)
      }, loop*1000);

      res.json({
        message: `Message sent to queue: ${req.body.message}`
      })
    })
  }

  async bootstrap(host: string, port: number): Promise<void> {
    this.initApp()
    await this.initMQ()
    await this.router()

    this.app.listen(port, () => console.log(`Producer running on http://${host}:${port}`))
  }
}

;(() => {
  new Server().bootstrap("0.0.0.0", 3000)
})()