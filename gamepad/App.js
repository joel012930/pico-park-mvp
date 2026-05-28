import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import io from "socket.io-client";
import { useKeepAwake } from "expo-keep-awake";

// IMPORTANTE: Asegúrate de que esta IP sea la misma que la de tu PC
const SERVER_URL = "http://10.56.2.44:3000";

export default function App() {
  useKeepAwake(); // Mantiene la pantalla encendida para el juego
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    // Inicializar conexión
    const s = io(SERVER_URL);

    s.on("connect", () => {
      setConectado(true);
      console.log("Conectado al servidor del juego");
    });

    s.on("disconnect", () => {
      setConectado(false);
    });

    setSocket(s);

    // Limpiar al cerrar
    return () => s.disconnect();
  }, []);

  const enviarInput = (accion, valor) => {
    if (socket) {
      socket.emit(accion, valor);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={conectado ? styles.conectado : styles.desconectado}>
        {conectado ? "🟢 Vinculado" : "🔴 Desconectado"}
      </Text>

      {/* D-Pad */}
      <View style={styles.dpad}>
        <TouchableOpacity
          style={styles.botonDir}
          onPressIn={() => enviarInput("keydown", "left")}
          onPressOut={() => enviarInput("keyup", "left")}
        >
          <Text style={styles.textoBoton}>⬅️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonDir}
          onPressIn={() => enviarInput("keydown", "right")}
          onPressOut={() => enviarInput("keyup", "right")}
        >
          <Text style={styles.textoBoton}>➡️</Text>
        </TouchableOpacity>
      </View>

      {/* Botón Acción (Saltar) */}
      <TouchableOpacity
        style={styles.botonSalto}
        onPressIn={() => enviarInput("keydown", "up")}
        onPressOut={() => enviarInput("keyup", "up")}
      >
        <Text style={styles.textoBoton}>A</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  conectado: { color: "#32d74b", fontSize: 20, marginBottom: 20 },
  desconectado: { color: "#ff453a", fontSize: 20, marginBottom: 20 },
  dpad: { flexDirection: "row", marginBottom: 40 },
  botonDir: {
    backgroundColor: "#555",
    padding: 40,
    borderRadius: 20,
    marginHorizontal: 20,
  },
  botonSalto: { backgroundColor: "#ff3b30", padding: 60, borderRadius: 60 },
  textoBoton: { color: "white", fontSize: 30, fontWeight: "bold" },
});
