const http = require('http');
const express = require('express');

const PORT = process.env.PORT || 3000;

const db = {};

const app = express();
const server = http.Server(app);
server.listen(PORT, () => {
    console.log(`Server running in port ${PORT}!`);
});

app.get('/', (req, res) => {
    res.send(db);
});
