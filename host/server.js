const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

app.use(express.static(".")); // Sirve los archivos de la carpeta actual

io.on("connection", (socket) => {
  console.log("📱 Mando vinculado");

  // Recibe comandos del celular y los reenvía al juego
  socket.on("keydown", (key) => io.emit("remote_keydown", key));
  socket.on("keyup", (key) => io.emit("remote_keyup", key));

  // Recibe orden de nivel del celular
  socket.on("start_level", (nivel) => io.emit("remote_start_level", nivel));
});

http.listen(3000, () => {
  console.log("Servidor en http://10.56.2.44:3000");
});
