
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

let port = process.env.PORT || 8000;
let host = process.env.PORT || '0.0.0.0';

let kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});
const consumer = kafka.consumer({ groupId: "test-group" });





app.get('/', (req, res) => {
  main();
})
let value = null
let json = {}
let registro = {};
let bloqueados_env = '';
let index = '';
let bloqueados = [];
let registrados = [];

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
          let array = []
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
        if(registro[datos].length >= 5 &&  registro[datos].at(-1)-registro[datos][0]<60){
          console.log(`El usuario: ${datos}, esta bloqueado`)
          bloqueados.push(datos);
          bloqueados_env += `<tr><td>${bloqueados.length}</td><td>${datos}</td></tr>`
          console.log(bloqueados)
        }
      }
    },
  })
  .catch(console.error)
};
app.get('/bloqueados',(req, res)=>{
  res.send(
    `<div>
        <table>
          <tr>
            <th>Numero</th>
            <th>Usuario</th>
          </tr>
          ${bloqueados_env}
        </table>
      </div>`)
})
app.listen(port,host,()=>{
    console.log(`Desde Api 2`)
    main();
});