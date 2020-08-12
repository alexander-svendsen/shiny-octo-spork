'use strict';

const express = require('express');
const kafka = require('kafka-node');
var pgp = require('pg-promise');

console.log("process.env " + process.env);

var db = pgp(`postgres://admin:${process.env.postgresql-1-secret}@10.125.7.71:5432/database`)


db.one('SELECT $1 AS value', 123)
    .then(function (data) {x
        console.log('DATA:', data.value)
    })
    .catch(function (error) {
        console.log('ERROR:', error)
    })


// Constants
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


var msg = ''
consumer.on('message', function (message) {
    console.log(message);
    msg = message.value
});

consumer.on('error', function(err) {
    console.log('error', err);
});

// App
const app = express();
app.get('/', (req, res) => {
    res.send('Hello ' + msg);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);