
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../services/authService';

export default function Registro() {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [matricula, setMatricula] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function handleRegistro() {
    setError('');
    setMensaje('');

    if (!nombre.trim() || !matricula.trim() || !email.trim() ||
        !password || !confirmarPassword) {
      setError('Completa todos los campos.');
      return;
    }

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);

      await register(
        nombre.trim(),
        matricula.trim(),
        email.trim(),
        password
      );

      setMensaje('¡Cuenta creada correctamente! Ahora puedes iniciar sesión.');

      setTimeout(() => {
        router.replace('/login');
      }, 1800);
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.icon}>📚</Text>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>
            Regístrate para utilizar la biblioteca universitaria
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu nombre completo"
            placeholderTextColor="#98A2B3"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Matrícula</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu matrícula"
            placeholderTextColor="#98A2B3"
            value={matricula}
            onChangeText={setMatricula}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#98A2B3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Crea una contraseña"
            placeholderTextColor="#98A2B3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#98A2B3"
            value={confirmarPassword}
            onChangeText={setConfirmarPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {mensaje ? (
            <Text style={styles.success}>{mensaje}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegistro}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}> Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  icon: {
    fontSize: 42,
    marginBottom: 10,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#173B63',
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#202B3C',
    marginBottom: 7,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 14,
    color: '#202B3C',
    marginBottom: 17,
  },
  error: {
    color: '#D92D20',
    fontSize: 13,
    marginBottom: 12,
  },
  success: {
    color: '#16803C',
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    height: 50,
    backgroundColor: '#173B63',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 22,
  },
  loginText: {
    color: '#667085',
    fontSize: 14,
  },
  loginLink: {
    color: '#285B8E',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
