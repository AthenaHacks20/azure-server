const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const CosmosClient = require('@azure/cosmos').CosmosClient;
require('dotenv').config();

const PORT = process.env.PORT || 3000;

let logs = '';
const localdb = {
    sockets: {},
    map: {}
};

const cosmosdb = new CosmosClient({
    endpoint: process.env.DB_ENDPOINT,
    key: process.env.DB_KEY
});

const log = (...msg) => {
    let newLog = '<p>';
    for (m of msg) {
        if (typeof m === 'object') {
            newLog += JSON.stringify(m) + ' ';
        } else {
            newLog += m.toString() + ' ';
        }
    }
    newLog += '</p>';
    logs += newLog;
    console.log(...msg);
};

const app = express();
app.use(express.json());
const server = http.Server(app);
const wss = new WebSocket.Server({ server });
server.listen(PORT, () => {
    log(`Server running on port ${PORT}!`);
});

app.get('/', (req, res) => {
    res.send(logs);
});

app.get('/db', (req, res) => {
    res.send(db);
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'map.html'));
});

app.get('/nearbypets', async (req, res) => {
    const { resources }  = await cosmosdb.database('mydb').container('pets').items.query({
        query: 'SELECT * FROM c'
    }).fetchAll();
    res.send(resources);
});

app.post('/mapclickpet', (req, res) => {
    const data = req.body;
    log(`Got data from map:`, data)
    localdb.maps[data.user].send(JSON.stringify({
        event: 'clickingotherpet',
        otherUser: data.clickedUser
    }))
    res.send(true);
});

wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substr(2, 9);
    localdb.sockets[id] = ws;
    log(`${id}: Connected!`);

    ws.on('message', (data) => {
        try {
            data = JSON.parse(data.toString());
            log(`${id}:`, data);

            if (data.event === 'connectmap') {
                localdb.map[data.user] = ws;
                ws.send('ping');
            }
        } catch {
            log(`${id}: Data parse error!`)
        }
    });

    ws.on('close', () => {
        delete localdb.sockets[id];
        log(`${id}: Disconnected!`);
    });
});
