'use strict';
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Kafka } = require("kafkajs");

const app = express()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(cors())

var port = process.env.PORT || 8000;
var host = process.env.PORT || '0.0.0.0';

var kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});
const consumer = kafka.consumer({ groupId: "test-group" });





app.get('/', (req, res) => {
  main();
})
var value = null
var json = {}
var registro = {};
var bloqueados = [];
var registrados = [];

const main = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });
  console.log("producer");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      value = message.value
      console.log({
        value: message.value.toString(),
      })
      json = JSON.parse(value)
      
      let datos = json["username"];
      if(bloqueados.includes(datos))
      {
        let word = datos
        
        console.log("Bloqueado")
        
      }else{
        if(!(datos in registro)){
          var array = []
          registro[datos] = []
          console.log('Usuario Registrado');
          registrados[datos] = []
          registrados[datos].push({"password":json["password"]});
        }else{
          if(registrados[datos][0]["password"]===json["password"]){
            registro[datos] = [];
            console.log("Acceso Autorizado");
          }else{
          registro[datos].push(json["tiempo"])
          console.log(`Numero de intentos: ${registro[datos].length}`);
          }
        }
        
        if(registro[datos].length >= 5 && registro[datos][registro[datos].length -1] - registro[datos][registro[datos].length -5] <60){
          console.log("Bloqueado")
          bloqueados.push(datos)
          console.log(bloqueados)
        }
      }
    },
  })
  .catch(console.error)
};

app.get('/blocked', (req, res) => {
  res.send(bloqueados)
})

app.listen(port,host,()=>{
    console.log(`Desde Api 2`)
    main();
});