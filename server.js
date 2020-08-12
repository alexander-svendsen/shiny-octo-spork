'use strict';

const express = require('express');
const kafka = require('kafka-node');
const postgress = require('pg-promise');

const pgp = postgress({});
const db = pgp(`postgres://postgres:${process.env.password}@10.125.2.69:5432/`);

db.one('SELECT $1 AS value', 123)
    .then(function (data) {
        console.log('DATA:', data.value)
    })
    .catch(function (error) {
        console.log('ERROR:', error)
    })

const PORT = 8080;
const HOST = '0.0.0.0';

const client = new kafka.KafkaClient({kafkaHost: '10.166.0.5:9092'});
const consumer = new kafka.Consumer(client,[{topic: 'test', partition: 0 }],
    {
        autoCommit: true,
        fetchMaxWaitMs: 1000,
        fetchMaxBytes: 1024 * 1024,
        encoding: 'utf8',
        fromOffset: false
    });


consumer.on('message', function (message) {
    db.any(`INSERT INTO EVENT(MESSAGE) VALUES(${message})`)
});

consumer.on('error', function(err) {
    console.log('error', err);
});

// App
const app = express();
app.get('/', (req, res) => {
    const msg = db.any('SELECT MESSAGE FROM EVENT ORDER BY ID DESC LIMIT 1')
    res.send('Hello ' + msg);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);