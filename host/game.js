const { Engine, Render, Runner, Bodies, Composite, Body } = Matter;

const CONFIGURACION_MOTOR_FISICO = { ancho: 800, alto: 600, colorFondo: "#1a1a1a" };
const VELOCIDAD_LATERAL_JUGADOR = 5;
const FUERZA_SALTO_JUGADOR = -9;
const COLOR_JUGADOR_PRINCIPAL = "#ff3b30";

const estadoDelJuego = {
  motorFisico: null,
  mundoFisico: null,
  entidadJugador: null,
  esNivelActivo: false,
};
function inicializarMotorDeJuego() {
  try {
    estadoDelJuego.motorFisico = Engine.create();
    estadoDelJuego.mundoFisico = estadoDelJuego.motorFisico.world;

    const renderizadorVisual = Render.create({
      element: document.body,
      engine: estadoDelJuego.motorFisico,
      options: {
        width: CONFIGURACION_MOTOR_FISICO.ancho,
        height: CONFIGURACION_MOTOR_FISICO.alto,
        wireframes: false,
        background: CONFIGURACION_MOTOR_FISICO.colorFondo,
      },
    });

    Render.run(renderizadorVisual);
    Runner.run(Runner.create(), estadoDelJuego.motorFisico);
  } catch (error) {
    console.error("Error crítico: Fallo al inicializar Matter.js", error.message);
  }
}

function inicializarConexionDeRed() {
  try {
    const clienteSocket = io();
    escucharComandosDeControlador(clienteSocket);
  } catch (error) {
    console.error("Error crítico: Fallo de conexión con el servidor", error.message);
  }
}

function escucharComandosDeControlador(clienteSocket) {
  clienteSocket.on("remote_keydown", (direccionDeMovimiento) => {
    if (!estadoDelJuego.esNivelActivo || !estadoDelJuego.entidadJugador) return;
    aplicarMovimientoAlJugador(direccionDeMovimiento);
  });

  clienteSocket.on("remote_start_level", (numeroDeNivel) => {
    prepararEntornoDeNivel(numeroDeNivel);
  });
}

function aplicarMovimientoAlJugador(direccion) {
  const velocidadActualY = estadoDelJuego.entidadJugador.velocity.y;
  const velocidadActualX = estadoDelJuego.entidadJugador.velocity.x;

  switch (direccion) {
    case "left":
      Body.setVelocity(estadoDelJuego.entidadJugador, { x: -VELOCIDAD_LATERAL_JUGADOR, y: velocidadActualY });
      break;
    case "right":
      Body.setVelocity(estadoDelJuego.entidadJugador, { x: VELOCIDAD_LATERAL_JUGADOR, y: velocidadActualY });
      break;
    case "up":
      Body.setVelocity(estadoDelJuego.entidadJugador, { x: velocidadActualX, y: FUERZA_SALTO_JUGADOR });
      break;
  }
}

function prepararEntornoDeNivel(numeroDeNivel) {
  try {
    ocultarInterfazDeInicio();
    Composite.clear(estadoDelJuego.mundoFisico);
    construirEstructurasDelNivel();
    estadoDelJuego.esNivelActivo = true;
    console.log(`Nivel iniciado exitosamente: ${numeroDeNivel}`);
  } catch (error) {
    console.error("Error crítico: Fallo al cargar el nivel", error.message);
  }
}

function ocultarInterfazDeInicio() {
  const capaUI = document.getElementById("ui-layer");
  if (capaUI) {
    capaUI.classList.add("hidden");
    capaUI.style.display = "none";
  }
}

function construirEstructurasDelNivel() {
  const sueloEstatico = Bodies.rectangle(400, 580, 810, 60, { isStatic: true });
  estadoDelJuego.entidadJugador = Bodies.rectangle(100, 100, 40, 40, {
    render: { fillStyle: COLOR_JUGADOR_PRINCIPAL },
  });

  Composite.add(estadoDelJuego.mundoFisico, [sueloEstatico, estadoDelJuego.entidadJugador]);
}

window.onload = () => {
  inicializarMotorDeJuego();
  inicializarConexionDeRed();
};// En tu game.js, inicializa el cliente de socket
const socket = io('http://10.56.2.21:3000'); 

// Escucha los eventos que vienen desde el celular (a través del servidor)
socket.on('remote_keydown', (key) => {
    teclas[key] = true; // Activa el movimiento en tu motor Matter.js
});

socket.on('remote_keyup', (key) => {
    teclas[key] = false; // Detiene el movimiento
});