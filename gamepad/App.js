import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import io from 'socket.io-client';

let socket;

export default function App() {
  const [metodo, setMetodo] = useState(null);
  const [ip, setIp] = useState('10.56.2.21');
  const [conectado, setConectado] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // 1. FORZAR PETICIÓN DE PERMISOS AL INICIAR
  useEffect(() => {
    if (metodo === 'qr' && !permission?.granted) {
      requestPermission();
    }
  }, [metodo]);

  const conectar = (ipFinal) => {
    console.log("Intentando conectar a:", `http://${ipFinal}:3000`);
    socket = io(`http://${ipFinal}:3000`, { timeout: 5000 });
    
    socket.on('connect', () => {
      setConectado(true);
      console.log("¡Conectado!");
    });
    
    socket.on('connect_error', (err) => {
      Alert.alert("Error de conexión", "No se pudo conectar a " + ipFinal);
      console.log(err);
    });
  };

  // PANTALLA DE MENÚ
  if (!metodo) return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.boton} onPress={() => setMetodo('qr')}><Text style={styles.texto}>Escanear QR</Text></TouchableOpacity>
      <TouchableOpacity style={styles.boton} onPress={() => setMetodo('manual')}><Text style={styles.texto}>IP Manual</Text></TouchableOpacity>
    </View>
  );

  // PANTALLA QR
  if (metodo === 'qr' && !conectado) {
    if (!permission?.granted) return (
        <View style={styles.container}>
            <Text style={styles.texto}>Permiso denegado.</Text>
            <TouchableOpacity style={styles.boton} onPress={requestPermission}><Text style={styles.texto}>Solicitar de nuevo</Text></TouchableOpacity>
        </View>
    );
    return <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={({data}) => conectar(data)} />;
  }

  // PANTALLA MANUAL
  if (metodo === 'manual' && !conectado) return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={ip} onChangeText={setIp} keyboardType="numeric"/>
      <TouchableOpacity style={styles.boton} onPress={() => conectar(ip)}><Text style={styles.texto}>Conectar</Text></TouchableOpacity>
    </View>
  );

  // MANDO
  return (
    <View style={styles.gamepad}>
      <TouchableOpacity style={styles.btn} onPressIn={() => socket.emit('keydown', 'left')} onPressOut={() => socket.emit('keyup', 'left')}><Text style={styles.texto}>⬅️</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btnJump} onPressIn={() => socket.emit('keydown', 'up')} onPressOut={() => socket.emit('keyup', 'up')}><Text style={styles.texto}>A</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPressIn={() => socket.emit('keydown', 'right')} onPressOut={() => socket.emit('keyup', 'right')}><Text style={styles.texto}>➡️</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  boton: { backgroundColor: '#0a84ff', padding: 20, margin: 10, borderRadius: 10 },
  input: { backgroundColor: 'white', padding: 15, width: 200, textAlign: 'center', borderRadius: 10, marginBottom: 10 },
  gamepad: { flex: 1, backgroundColor: '#1a1a1a', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  btn: { backgroundColor: '#555', padding: 30, borderRadius: 20 },
  btnJump: { backgroundColor: '#ff3b30', padding: 50, borderRadius: 50 },
  texto: { color: 'white', fontSize: 20 }
});