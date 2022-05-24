
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Kafka } = require("kafkajs");


const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cors());

let port = process.env.PORT || 3000;
let host = process.env.PORT || '0.0.0.0';

let kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});

app.post("/login", (req, res) => {
  console.log("login");
  (async () => {
      const producer = kafka.producer();
      const admin = kafka.admin();
      await producer.connect();
      const { username, password } = req.body;
      let time = Math.floor(new Date() / 1000);
      let user = {
        username: username,
        password: password,
        tiempo: time.toString()
      }
      await producer.send({
        topic: "test-topic",
        messages: [{ value: JSON.stringify(user) }],
      })
      await producer.disconnect();
      res.json(user);
  })();
});

app.get("/", (req, res) => {
  res.send("ok");
});

app.listen(port,host, () => {
  console.log(`Desde Api 1`);
});
