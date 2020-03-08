const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const PORT = process.env.PORT || 3000;

let logs = '';
const db = {
    sockets: {},
    pets: [
        {
            user: 'nick',
            position: [-118.2873057, 34.0223563]
        },
        {
            user: 'thomas',
            position: [-118.2855462, 34.0214493]
        },
        {
            user: 'karen',
            position: [-118.2887112, 34.0215738]
        }
    ]
};

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

app.get('/nearbypets', (req, res) => {
    res.send(db.pets);
});

app.post('/mapclickpet', (req, res) => {
    // Send data thru websocket here.
    res.send(true);
});

wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substr(2, 9);
    db.sockets[id] = ws;
    log(`${id}: Connected!`);

    ws.on('message', (data) => {
        try {
            data = JSON.parse(data.toString());
            log(`${id}:`, data);
        } catch {
            log(`${id}: Data parse error!`)
        }
    });

    ws.on('close', () => {
        delete db.sockets[id];
        log(`${id}: Disconnected!`);
    });
});
