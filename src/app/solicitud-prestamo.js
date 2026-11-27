
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SolicitudPrestamo() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [libros, setLibros] = useState([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [fechaDevolucion, setFechaDevolucion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function cargarLibros() {
      try {
        const data = await apiRequest("/api/books");
        setLibros(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los libros.");
      } finally {
        setLoading(false);
      }
    }

    cargarLibros();
  }, []);

  async function cerrarSesion() {
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      setError("No se pudo cerrar la sesión.");
    }
  }

  function seleccionarLibro(libro) {
    setLibroSeleccionado(libro);
    setFechaDevolucion("");
    setModalVisible(true);
  }

  function cerrarModal() {
    if (enviando) return;

    setModalVisible(false);
    setLibroSeleccionado(null);
    setFechaDevolucion("");
  }

  async function enviarSolicitud() {
    if (!libroSeleccionado) {
      Alert.alert("Atención", "Selecciona un libro.");
      return;
    }

    if (!fechaDevolucion.trim()) {
      Alert.alert("Atención", "Ingresa la fecha de devolución.");
      return;
    }

    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (!formatoFecha.test(fechaDevolucion)) {
      Alert.alert("Fecha incorrecta", "Utiliza el formato AAAA-MM-DD.");
      return;
    }

    const [anio, mes, dia] = fechaDevolucion.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);

    if (
      fecha.getFullYear() !== anio ||
      fecha.getMonth() !== mes - 1 ||
      fecha.getDate() !== dia
    ) {
      Alert.alert("Fecha incorrecta", "Ingresa una fecha válida.");
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fecha <= hoy) {
      Alert.alert(
        "Fecha incorrecta",
        "La fecha de devolución debe ser posterior a hoy."
      );
      return;
    }

    try {
      setEnviando(true);

      await apiRequest("/api/loans/books", {
        method: "POST",
        body: {
          bookId: libroSeleccionado.id,
          userId: user.id,
          fechaDevolucionEstimada: fechaDevolucion,
        },
      });

      setModalVisible(false);

      Alert.alert(
        "¡Solicitud registrada!",
        "Tu préstamo se ha solicitado correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.replace("/catalogo"),
          },
        ]
      );

      setLibroSeleccionado(null);
      setFechaDevolucion("");
    } catch (err) {
      Alert.alert(
        "No se pudo registrar",
        err.message || "Ocurrió un error al solicitar el préstamo."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contenido}
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>Solicitar préstamo</Text>

          <Text style={styles.descripcion}>
            Selecciona el libro que deseas solicitar.
          </Text>

          <View style={styles.botonesHeader}>
            <TouchableOpacity
              style={styles.botonVolver}
              onPress={() => router.replace("/catalogo")}
            >
              <Text style={styles.textoBotonVolver}>
                Volver al catálogo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonSalir}
              onPress={cerrarSesion}
            >
              <Text style={styles.textoBotonSalir}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Selecciona un libro</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#285B8E"
            style={styles.cargando}
          />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : libros.length === 0 ? (
          <Text style={styles.mensajeVacio}>
            No hay libros registrados.
          </Text>
        ) : (
          libros.map((libro) => (
            <TouchableOpacity
              key={libro.id}
              style={[
                styles.libro,
                libro.stockDisponible <= 0 && styles.libroAgotado,
              ]}
              disabled={libro.stockDisponible <= 0}
              onPress={() => seleccionarLibro(libro)}
            >
              <Text style={styles.libroTitulo}>
                {libro.titulo}
              </Text>

              <Text style={styles.libroAutor}>
                Autor: {libro.autor}
              </Text>

              <Text style={styles.stock}>
                Disponibles: {libro.stockDisponible}
              </Text>

              <Text style={styles.estadoSeleccion}>
                {libro.stockDisponible > 0
                  ? "Solicitar este libro"
                  : "No disponible"}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* VENTANA EMERGENTE */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View style={styles.fondoModal}>
          <View style={styles.contenidoModal}>
            <Text style={styles.tituloModal}>
              Solicitar préstamo
            </Text>

            <Text style={styles.descripcionModal}>
              Confirma el libro y establece la fecha de devolución.
            </Text>

            <View style={styles.resumen}>
              <Text style={styles.resumenTitulo}>
                Libro seleccionado:
              </Text>

              <Text style={styles.resumenTexto}>
                {libroSeleccionado?.titulo}
              </Text>

              <Text style={styles.resumenAutor}>
                Autor: {libroSeleccionado?.autor}
              </Text>
            </View>

            <Text style={styles.labelModal}>
              Fecha de devolución
            </Text>

            <Text style={styles.ayuda}>
              Escribe la fecha en formato AAAA-MM-DD.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ej. 2026-12-15"
              placeholderTextColor="#98A2B3"
              value={fechaDevolucion}
              onChangeText={setFechaDevolucion}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />

            <TouchableOpacity
              style={[
                styles.botonEnviar,
                enviando && styles.botonDeshabilitado,
              ]}
              onPress={enviarSolicitud}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.textoBotonEnviar}>
                  Enviar solicitud
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={cerrarModal}
              disabled={enviando}
            >
              <Text style={styles.textoBotonCancelar}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  container: {
    flex: 1,
  },

  contenido: {
    paddingBottom: 30,
  },

  header: {
    backgroundColor: "#173B63",
    padding: 20,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
  },

  descripcion: {
    fontSize: 14,
    color: "#DCE6F1",
    lineHeight: 21,
    marginBottom: 18,
  },

  botonesHeader: {
    flexDirection: "row",
    gap: 10,
  },

  botonVolver: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  textoBotonVolver: {
    color: "#173B63",
    fontWeight: "bold",
    fontSize: 13,
  },

  botonSalir: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },

  textoBotonSalir: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  label: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#173B63",
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },

  cargando: {
    marginVertical: 25,
  },

  libro: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  libroAgotado: {
    opacity: 0.45,
  },

  libroTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#173B63",
  },

  libroAutor: {
    color: "#64748B",
    marginTop: 5,
  },

  stock: {
    color: "#285B8E",
    marginTop: 7,
    fontWeight: "600",
  },

  estadoSeleccion: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 8,
  },

  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  contenidoModal: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 22,
    elevation: 8,
  },

  tituloModal: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#173B63",
    marginBottom: 8,
  },

  descripcionModal: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 15,
  },

  resumen: {
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 18,
  },

  resumenTitulo: {
    color: "#173B63",
    fontWeight: "bold",
    marginBottom: 5,
  },

  resumenTexto: {
    color: "#2563EB",
    fontWeight: "600",
  },

  resumenAutor: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 5,
  },

  labelModal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#173B63",
    marginBottom: 8,
  },

  ayuda: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1E293B",
  },

  botonEnviar: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  botonDeshabilitado: {
    opacity: 0.6,
  },

  textoBotonEnviar: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  botonCancelar: {
    padding: 13,
    alignItems: "center",
    marginTop: 5,
  },

  textoBotonCancelar: {
    color: "#64748B",
    fontWeight: "bold",
    fontSize: 15,
  },

  error: {
    color: "#DC2626",
    marginHorizontal: 20,
    marginBottom: 15,
  },

  mensajeVacio: {
    color: "#64748B",
    marginHorizontal: 20,
  },
});
