import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Catalogo() {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { user, logout } = useAuth();
  const router = useRouter();

  async function cargarLibros() {
    setError("");

    try {
      const data = await apiRequest("/api/books");
      setLibros(data);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los libros.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
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

  function renderLibro({ item }) {
    return (
      <View style={styles.libroCard}>
        <Text style={styles.libroTitulo}>{item.titulo}</Text>

        <Text style={styles.libroTexto}>Autor: {item.autor}</Text>

        <Text style={styles.libroTexto}>
          Categoría: {item.categoria || "Sin categoría"}
        </Text>

        <Text style={styles.libroTexto}>
          ISBN: {item.isbn || "No disponible"}
        </Text>

        <View style={styles.stockContainer}>
          <Text style={styles.stockTexto}>
            Disponibles: {item.stockDisponible}
          </Text>

          <Text style={styles.stockTotal}>Total: {item.stockTotal}</Text>
        </View>

        <Text
          style={[
            styles.estado,
            item.stockDisponible > 0 ? styles.disponible : styles.agotado,
          ]}
        >
          {item.stockDisponible > 0 ? "Disponible" : "No disponible"}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#285B8E" />
        <Text style={styles.mensaje}>Cargando catálogo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Biblioteca universitaria</Text>

          <Text style={styles.bienvenida}>
            Bienvenido, {user?.nombre || "Usuario"}
          </Text>
        </View>

        {/* BOTONES */}
        <View style={styles.botonesHeader}>
          <TouchableOpacity
            style={styles.botonPrestamo}
            onPress={() => router.push("/solicitud-prestamo")}
          >
            <Text style={styles.textoBotonPrestamo}>Solicitar préstamo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonMisPrestamos}
            onPress={() => router.push("/mis-prestamos")}
          >
            <Text style={styles.textoBotonMisPrestamos}>Mis préstamos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonCerrar} onPress={cerrarSesion}>
            <Text style={styles.botonCerrarTexto}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CATÁLOGO */}
      <Text style={styles.subtitulo}>Catálogo de libros</Text>

      {error !== "" && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTexto}>{error}</Text>

          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={() => {
              setLoading(true);
              cargarLibros();
            }}
          >
            <Text style={styles.botonCerrarTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && (
        <FlatList
          data={libros}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderLibro}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                cargarLibros();
              }}
              colors={["#285B8E"]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.mensaje}>No hay libros registrados.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
    paddingTop: 55,
  },

  header: {
    backgroundColor: "#173B63",
    padding: 20,
    flexDirection: "column",
    alignItems: "stretch",
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  bienvenida: {
    color: "#DCE6F1",
    marginTop: 6,
  },

  botonesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    gap: 10,
  },

  botonPrestamo: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  textoBotonPrestamo: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },

  botonMisPrestamos: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  textoBotonMisPrestamos: {
    color: "#173B63",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },

  botonCerrar: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  botonCerrarTexto: {
    color: "#173B63",
    fontWeight: "bold",
  },

  subtitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#173B63",
    margin: 20,
  },

  lista: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  libroCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },

  libroTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#173B63",
    marginBottom: 10,
  },

  libroTexto: {
    fontSize: 14,
    color: "#475467",
    marginBottom: 7,
  },

  stockContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  stockTexto: {
    color: "#285B8E",
    fontWeight: "bold",
  },

  stockTotal: {
    color: "#667085",
  },

  estado: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    fontWeight: "bold",
    overflow: "hidden",
  },

  disponible: {
    backgroundColor: "#D1FADF",
    color: "#027A48",
  },

  agotado: {
    backgroundColor: "#FEE4E2",
    color: "#B42318",
  },

  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F9",
  },

  mensaje: {
    textAlign: "center",
    color: "#667085",
    marginTop: 15,
  },

  errorContainer: {
    margin: 20,
    padding: 18,
    backgroundColor: "#FEE4E2",
    borderRadius: 10,
  },

  errorTexto: {
    color: "#B42318",
    textAlign: "center",
    marginBottom: 12,
  },

  botonReintentar: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
  },
});
