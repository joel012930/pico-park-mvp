const { Engine, Render, Runner, Bodies, Composite, Body, Events } = Matter;

// 1. Configuración del Motor
const engine = Engine.create();
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 800,
        height: 600,
        wireframes: false, // Ponelo en true si querés ver las cajas de colisión
        background: '#f4f4f4'
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// 2. Creación del Suelo y Paredes (Fricción 0 para evitar el Wall Hug)
const ground = Bodies.rectangle(400, 580, 810, 60, { isStatic: true, render: { fillStyle: '#333' } });
const leftWall = Bodies.rectangle(10, 300, 20, 600, { isStatic: true, friction: 0 });
const rightWall = Bodies.rectangle(790, 300, 20, 600, { isStatic: true, friction: 0 });

// 3. Los Jugadores (4 Colores, Inercia Infinita para apilarse)
const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF'];
const players = colors.map((color, i) => {
    return Bodies.rectangle(100 + (i * 50), 500, 40, 40, {
        inertia: Infinity, // CRÍTICO: Evita que el cuadrado rote y se caiga de la torre
        friction: 0.1,
        frictionAir: 0.05,
        render: { fillStyle: color },
        label: `player_${i}`
    });
});

// 4. La Caja Pesada (Suma de fuerzas)
const heavyBox = Bodies.rectangle(400, 500, 80, 80, {
    mass: 10, // Más pesada que un jugador solo
    render: { fillStyle: '#8B4513' }
});

Composite.add(engine.world, [ground, leftWall, rightWall, heavyBox, ...players]);

// 5. Lógica de Control (Teclado temporal para testeo)
const keys = {};
document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Mapeo de controles: P1 (Flechas), P2 (WASD), P3 (IJKL), P4 (TFGH)
const controls = [
    { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp' },
    { left: 'KeyA', right: 'KeyD', jump: 'KeyW' },
    { left: 'KeyJ', right: 'KeyL', jump: 'KeyI' },
    { left: 'KeyF', right: 'KeyH', jump: 'KeyT' }
];

Events.on(engine, 'beforeUpdate', () => {
    players.forEach((player, i) => {
        const control = controls[i];
        let forceX = 0;

        if (keys[control.left]) forceX -= 0.005;
        if (keys[control.right]) forceX += 0.005;

        Body.applyForce(player, player.position, { x: forceX, y: 0 });

        // Salto simple (solo si está cerca del suelo o de otro jugador)
        if (keys[control.jump] && Math.abs(player.velocity.y) < 0.1) {
            Body.applyForce(player, player.position, { x: 0, y: -0.05 });
        }
    });
});