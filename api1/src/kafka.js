const {Kafka} = require('kafkajs');

const kafka = new Kafka({
    clientId: "my-app",
    brokers: ["kafka:9092"]
});
