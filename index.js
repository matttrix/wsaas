const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const WebSocket = require('ws')
const http = require('http')
const url = require('url')
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(helmet())

wss.on('connection', (ws, req) => {
  const { query } = url.parse(req.url, true)
  ws._id = query._id || (+new Date())
})

app.post('/', (request, response) => {
  const { api_key } = request.query
  const { client_ids, payload } = request.body

  if (api_key !== process.env.API_KEY) {
    return response.sendStatus(401)
  }

  if (!Array.isArray(client_ids)) {
    return response.sendStatus(403)
  }

  for (let ws of wss.clients) {
    if (client_ids.includes(ws._id)) {
      ws.send(JSON.stringify(payload || {}))
    }
  }

  return response.sendStatus(201)
})

function start({ port }) {
  return server.listen(port, () => {
    console.log(`* Listening on http://localhost:${port}`)
    console.log('* Use Ctrl-C to stop')
  })
}

module.exports = { start }
