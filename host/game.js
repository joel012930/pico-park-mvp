const { Engine, Render, Runner, Bodies, Composite, Body, Events } = Matter;
const engine = Engine.create();
const world = engine.world;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false,
    background: "#1a1a1a",
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

const socket = io(); // Conexión al servidor
let jugador1, puerta, llave, cajaPesada;

// Escuchar comandos del control remoto
socket.on("remote_keydown", (key) => {
  if (key === "left")
    Body.setVelocity(jugador1, { x: -5, y: jugador1.velocity.y });
  if (key === "right")
    Body.setVelocity(jugador1, { x: 5, y: jugador1.velocity.y });
  if (key === "up")
    Body.setVelocity(jugador1, { x: jugador1.velocity.x, y: -9 });
});

socket.on("remote_start_level", (nivel) => iniciarNivel(nivel));

window.iniciarNivel = function (nivel) {
  document.getElementById("ui-layer").classList.add("hidden");
  Composite.clear(world);

  // Crear elementos básicos
  const suelo = Bodies.rectangle(400, 580, 810, 60, { isStatic: true });
  jugador1 = Bodies.rectangle(100, 100, 40, 40, {
    render: { fillStyle: "#ff3b30" },
  });

  Composite.add(world, [suelo, jugador1]);
  console.log("Nivel iniciado: " + nivel);
};
