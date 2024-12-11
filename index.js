const express = require("express");
const path = require("path");
const app = express();
const portApp = 4000;
const cors = require("cors");
app.use(cors());
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/dist")));

const nodes = {};

const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
client.on("connect", () => {
  console.log("Conectado a broker MQTT");
});
client.on("message", (topic, message) => {
  console.log(`MQTT recibido: ${topic}: ${message.toString()}`);
});

/*const { SerialPort } = require("serialport");
const { DelimiterParser } = require("@serialport/parser-delimiter");
const portSerial = new SerialPort({
  path: "/dev/tty.usbserial-A50285BI",
  baudRate: 9600,
  autoOpen: true,
});
const parser = portSerial.pipe(new DelimiterParser({ delimiter: "\n" }));
parser.on("data", function (data) {
  data = data.toString();
  //console.log("serialport:", data);
  try {
    console.log(data);
    const info = JSON.parse(data);
    info.PublishTime = Date.now();

    const topic = "Devices/Telemetry";
    const payload = {
      Device: [info],
    };
    client.publish(topic, JSON.stringify(payload));
    const devid = info.name;
    delete info.name;
    nodes[devid] = info;
    portSerial.write(JSON.stringify({ d: devid, s: 1 }));
  } catch (e) {
    console.log(e);
  }
});
*/
app.get("/data", (req, res) => {
  res.send(nodes);
});

app.post("/config", (req, res) => {
  const datos = req.body;
  console.log(JSON.stringify(datos));
  portSerial.write(JSON.stringify(datos));
  res.send("Solicitud POST recibida");
});

// Iniciar el servidor
app.listen(portApp, () => {
  console.log(`La aplicación está escuchando en http://localhost:${portApp}`);
});
