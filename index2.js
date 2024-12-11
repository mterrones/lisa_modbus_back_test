const { SerialPort, ReadlineParser } = require('serialport');
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const mqtt = require("mqtt");

const app = express();
const portApp = 4000;

// Configuración del middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/dist")));

const nodes = {};

// Conexión MQTT
const client = mqtt.connect("mqtt://localhost:1883");
client.on("connect", () => {
  console.log("Conectado a broker MQTT");
});
client.on("message", (topic, message) => {
  console.log(`MQTT recibido: ${topic}: ${message.toString()}`);
});

// Variable global para almacenar datos
let serialData = {};

// Configuración del puerto serial
const port = new SerialPort({
  path: '/dev/tty.usbserial-A506R90W', // Ruta del puerto serial
  baudRate: 9600,                     // Velocidad en baudios
});

// Agregar parser para leer líneas completas
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Evento al abrir el puerto serial
port.on('open', () => {
  console.log('Puerto serial abierto en /dev/tty.usbserial-A506R90W');
});

// Leer datos desde el puerto serial
parser.on('data', (rawData) => {
  try {
    // Analizar el JSON recibido desde el puerto serial
    const parsedData = JSON.parse(rawData.trim()); // Quita espacios y analiza JSON
    console.log("Datos recibidos del puerto serial:", parsedData);

    // Actualizar la variable global con los datos recibidos
    serialData = parsedData;
  } catch (error) {
    console.error("Error al analizar los datos del puerto serial:", error.message);
  }
});

// Manejo de errores del puerto serial
port.on('error', (err) => {
  console.error('Error en el puerto serial:', err.message);
});

// Ruta para obtener los datos
app.get("/data", (req, res) => {
  // Verificar que serialData sea un objeto válido antes de enviarlo
  if (Object.keys(serialData).length === 0) {
    return res.status(204).send(); // Sin contenido
  }
  res.json(serialData);
});

// Iniciar el servidor
app.listen(portApp, () => {
  console.log(`La aplicación está escuchando en http://localhost:${portApp}`);
});