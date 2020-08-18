'use strict';

const express = require('express');
const kafka = require('kafka-node');
const postgress = require('pg-promise');

const pgp = postgress({});
const db = pgp(`postgres://postgres:${process.env.password}@10.125.2.69:5432/`);

const PORT = 8080;
const HOST = '0.0.0.0';

const client = new kafka.KafkaClient({kafkaHost: 'kafka-0.kafka-hs.default.svc.cluster.local:9093,kafka-1.kafka-hs.default.svc.cluster.local:9093,kafka-2.kafka-hs.default.svc.cluster.local:9093'});
const consumer = new kafka.Consumer(client,[{topic: 'test', partition: 0 }],
    {
        autoCommit: true,
        fetchMaxWaitMs: 1000,
        fetchMaxBytes: 1024 * 1024,
        encoding: 'utf8',
        fromOffset: false
    });


consumer.on('message', function (message) {
    db.none(`INSERT INTO EVENT(MESSAGE) VALUES('${message.value}')`)
});

consumer.on('error', function(err) {
    console.log('error', err);
});

// App
const app = express();
app.get('/', (req, res) => {
    try {
        db.one('SELECT MESSAGE FROM EVENT ORDER BY ID DESC LIMIT 1')
            .then(msg => {
                return res.send('Hello ' + msg.message)
            })
            .catch(e => {
                console.log("ERROR", e);
                res.send("FAAAAAAAILED!!!!");
            })
    } catch (e) {
        // ignore
    }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);