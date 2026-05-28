# Pico Park MVP - "The Pico Stress Test"

## Arquitectura

El proyecto utiliza una arquitectura cliente-servidor con WebSockets (Socket.io) para baja latencia.

- **Host:** Juego en navegador usando Matter.js para físicas 2D.
- **Gamepad:** Aplicación móvil en React Native (vía Expo) que envía inputs al servidor.
- **Bridge:** Servidor Node.js que sincroniza los estados.

## Instrucciones de Instalación

1. Clonar el repositorio.
2. Instalar dependencias: `npm install express socket.io`
3. Ejecutar servidor: `node server.js`
4. Abrir `http://10.56.2.44:3000` en el navegador de la PC.

## Protocolo de Conectividad

La conexión se establece mediante un handshake de socket tras el escaneo del QR, el cual contiene la IP local del host.
