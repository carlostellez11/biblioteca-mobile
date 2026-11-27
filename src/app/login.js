
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');

    if (!email.trim() || !password) {
      setError('Completa tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);

      await login(email.trim(), password);

      router.replace('/catalogo');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
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
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📚</Text>
          </View>

          <Text style={styles.title}>Biblioteca UTR</Text>

          <Text style={styles.subtitle}>
            Tu espacio para aprender y descubrir
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.welcome}>¡Bienvenido!</Text>

          <Text style={styles.description}>
            Inicia sesión para continuar
          </Text>

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

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#98A2B3"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!mostrarPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() => setMostrarPassword(!mostrarPassword)}
            >
              <Text style={styles.showPassword}>
                {mostrarPassword ? 'Ocultar' : 'Ver'}
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              ¿No tienes una cuenta?
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/registro')}
            >
              <Text style={styles.registerLink}> Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          Sistema de Control de Biblioteca Universitaria
        </Text>
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
    marginBottom: 32,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#173B63',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 38,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#173B63',
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202B3C',
  },
  description: {
    fontSize: 14,
    color: '#667085',
    marginTop: 6,
    marginBottom: 26,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#202B3C',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#202B3C',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#202B3C',
  },
  showPassword: {
    color: '#285B8E',
    fontWeight: '600',
  },
  error: {
    color: '#D92D20',
    fontSize: 13,
    marginBottom: 14,
  },
  button: {
    height: 52,
    backgroundColor: '#173B63',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  registerText: {
    color: '#667085',
    fontSize: 14,
  },
  registerLink: {
    color: '#285B8E',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    textAlign: 'center',
    color: '#98A2B3',
    fontSize: 12,
    marginTop: 28,
  },
});
