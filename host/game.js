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
        background: '#1a1a1a'
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Variables globales para poder usarlas en cualquier parte
let jugador1, jugador2, llave, puerta;
let tieneLlave = false;

// --- CONTROLES (Se declaran una sola vez) ---
const teclas = {};
window.addEventListener('keydown', (e) => { teclas[e.key] = true; });
window.addEventListener('keyup', (e) => { teclas[e.key] = false; });

// --- CONTROLES Y ARREGLO DEL SALTO ---
Events.on(engine, 'beforeUpdate', () => {
    if (!jugador1 || !jugador2) return;

    const velocidad = 5;
    const fuerzaSalto = -9;

    // --- Función para chequear si está en el piso ---
    // Busca si el jugador está tocando *cualquier* otro cuerpo (suelo, muro, o el otro jugador)
    const tocandoPiso = (jugador) => {
        const colisiones = Matter.Detector.collisions(engine.detector);
        for (let i = 0; i < colisiones.length; i++) {
            const pair = colisiones[i];
            // Si el jugador es parte de la colisión y la colisión es "por abajo" (eje Y)
            if ((pair.bodyA === jugador || pair.bodyB === jugador) && Math.abs(pair.collision.normal.y) > 0.5) {
                return true;
            }
        }
        return false;
    };

    const j1EnPiso = tocandoPiso(jugador1);
    const j2EnPiso = tocandoPiso(jugador2);


    // J1 (Flechas)
    if (teclas['ArrowRight']) Body.setVelocity(jugador1, { x: velocidad, y: jugador1.velocity.y });
    else if (teclas['ArrowLeft']) Body.setVelocity(jugador1, { x: -velocidad, y: jugador1.velocity.y });
    else Body.setVelocity(jugador1, { x: 0, y: jugador1.velocity.y });

    // Solo salta si la tecla está presionada Y la función dice que está en el piso
    if (teclas['ArrowUp'] && j1EnPiso) {
        Body.setVelocity(jugador1, { x: jugador1.velocity.x, y: fuerzaSalto });
        teclas['ArrowUp'] = false; // Falsificamos que soltó para evitar rebotes raros
    }

    // J2 (WASD)
    if (teclas['d']) Body.setVelocity(jugador2, { x: velocidad, y: jugador2.velocity.y });
    else if (teclas['a']) Body.setVelocity(jugador2, { x: -velocidad, y: jugador2.velocity.y });
    else Body.setVelocity(jugador2, { x: 0, y: jugador2.velocity.y });

    if (teclas['w'] && j2EnPiso) {
        Body.setVelocity(jugador2, { x: jugador2.velocity.x, y: fuerzaSalto });
        teclas['w'] = false;
    }
});
// --- LÓGICA DE COLISIONES ---
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
        const cuerpoA = pair.bodyA;
        const cuerpoB = pair.bodyB;

        // Tocar llave
        if ((cuerpoA.label === 'jugador' && cuerpoB.label === 'llave') || 
            (cuerpoB.label === 'jugador' && cuerpoA.label === 'llave')) {
            tieneLlave = true;
            if (cuerpoA.label === 'llave') Composite.remove(world, cuerpoA);
            if (cuerpoB.label === 'llave') Composite.remove(world, cuerpoB);
        }

        // Tocar puerta con llave
        if (tieneLlave) {
            if ((cuerpoA.label === 'jugador' && cuerpoB.label === 'puerta') || 
                (cuerpoB.label === 'jugador' && cuerpoA.label === 'puerta')) {
                
                alert('¡NIVEL COMPLETADO! 🏆');
                tieneLlave = false; 
                
                // Limpiar el mundo y mostrar el menú de nuevo
                Composite.clear(world);
                Engine.clear(engine);
                document.getElementById('ui-layer').classList.remove('hidden');
            }
        }
    });
});

// --- FUNCIÓN PARA CARGAR NIVELES ---
window.iniciarNivel = function(nivel) {
    // 1. Ocultar el menú
    document.getElementById('ui-layer').classList.add('hidden');
    
    // 2. Limpiar cualquier cosa que haya quedado
    Composite.clear(world);
    Engine.clear(engine);
    tieneLlave = false;

    // 3. Crear bordes básicos
    const suelo = Bodies.rectangle(400, 580, 810, 60, { isStatic: true, render: { fillStyle: '#555' } });
    const paredIzquierda = Bodies.rectangle(10, 300, 40, 600, { isStatic: true, render: { fillStyle: '#555' } });
    const paredDerecha = Bodies.rectangle(790, 300, 40, 600, { isStatic: true, render: { fillStyle: '#555' } });

    // 4. Crear Jugadores, Puerta y Llave (Posiciones base)
    jugador1 = Bodies.rectangle(100, 100, 50, 50, { render: { fillStyle: '#ff3b30' }, inertia: Infinity, friction: 0.1, label: 'jugador' });
    jugador2 = Bodies.rectangle(200, 100, 50, 50, { render: { fillStyle: '#0a84ff' }, inertia: Infinity, friction: 0.1, label: 'jugador' });
    
    puerta = Bodies.rectangle(700, 500, 60, 100, { isStatic: true, isSensor: true, render: { fillStyle: '#8b4513' }, label: 'puerta' });
    llave = Bodies.rectangle(400, 500, 30, 30, { isStatic: true, isSensor: true, render: { fillStyle: '#ffd700' }, label: 'llave' });

    // 5. Agregar cosas según el nivel
    let elementosNivel = [suelo, paredIzquierda, paredDerecha, jugador1, jugador2, puerta, llave];

    if (nivel === 2) {
        // Nivel 2: Muro en el medio y llave arriba de una plataforma
        const muro = Bodies.rectangle(400, 450, 40, 200, { isStatic: true, render: { fillStyle: '#ff9500' } }); // Obstáculo naranja
        const plataforma = Bodies.rectangle(600, 350, 150, 20, { isStatic: true, render: { fillStyle: '#8e8e93' } });
        
        // Movemos la llave arriba de la plataforma
        Body.setPosition(llave, { x: 600, y: 300 });
        
        elementosNivel.push(muro, plataforma);
    }

    // 6. Mandar todo al mundo
    Composite.add(world, elementosNivel);
};