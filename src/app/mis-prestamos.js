import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function MisPrestamos() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const cargarPrestamos = useCallback(async () => {
    try {
      setError("");

      const data = await apiRequest("/api/loans/books");

      const todosLosPrestamos = Array.isArray(data) ? data : [];

      // Mostrar únicamente los préstamos del usuario actual
      const misPrestamos = todosLosPrestamos.filter(
        (prestamo) => Number(prestamo.userId) === Number(user.id),
      );

      setPrestamos(misPrestamos);
    } catch (err) {
      setError(err.message || "No se pudieron cargar tus préstamos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    cargarPrestamos();
  }, [cargarPrestamos]);

  async function actualizarPrestamos() {
    setRefreshing(true);
    await cargarPrestamos();
  }

  async function cerrarSesion() {
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      setError("No se pudo cerrar la sesión.");
    }
  }

  function obtenerEstado(prestamo) {
    if (prestamo.vencido) {
      return "Vencido";
    }

    const estado = String(prestamo.estatus || "Sin estado").toUpperCase();

    if (estado === "ACTIVO") return "Activo";
    if (estado === "DEVUELTO") return "Devuelto";
    if (estado === "VENCIDO") return "Vencido";

    return prestamo.estatus || "Sin estado";
  }

  function obtenerColorEstado(prestamo) {
    const estado = obtenerEstado(prestamo);

    if (estado === "Devuelto") return "#15803D";
    if (estado === "Vencido") return "#DC2626";

    return "#2563EB";
  }

  function obtenerColorFondoEstado(prestamo) {
    const estado = obtenerEstado(prestamo);

    if (estado === "Devuelto") return "#DCFCE7";
    if (estado === "Vencido") return "#FEE2E2";

    return "#DBEAFE";
  }

  function formatearFecha(fecha) {
    if (!fecha) return "No disponible";

    const fechaTexto = String(fecha).substring(0, 10);
    const partes = fechaTexto.split("-");

    if (partes.length !== 3) return fechaTexto;

    const [anio, mes, dia] = partes;

    return `${dia}/${mes}/${anio}`;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contenido}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={actualizarPrestamos}
            colors={["#2563EB"]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>Mis préstamos</Text>

          <Text style={styles.descripcion}>
            Consulta los libros que has solicitado y sus fechas de devolución.
          </Text>

          <View style={styles.botonesHeader}>
            <TouchableOpacity
              style={styles.botonVolver}
              onPress={() => router.replace("/catalogo")}
            >
              <Text style={styles.textoBotonVolver}>Volver al catálogo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botonSalir} onPress={cerrarSesion}>
              <Text style={styles.textoBotonSalir}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#285B8E"
            style={styles.cargando}
          />
        ) : error ? (
          <View style={styles.mensajeContainer}>
            <Text style={styles.error}>{error}</Text>

            <TouchableOpacity
              style={styles.botonReintentar}
              onPress={cargarPrestamos}
            >
              <Text style={styles.textoBotonReintentar}>
                Intentar nuevamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : prestamos.length === 0 ? (
          <View style={styles.vacio}>
            <Text style={styles.vacioTitulo}>
              No tienes préstamos registrados
            </Text>

            <Text style={styles.vacioTexto}>
              Cuando solicites un libro, aparecerá aquí.
            </Text>

            <TouchableOpacity
              style={styles.botonCatalogo}
              onPress={() => router.replace("/catalogo")}
            >
              <Text style={styles.textoBotonCatalogo}>Ir al catálogo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.total}>
              Préstamos registrados: {prestamos.length}
            </Text>

            {prestamos.map((prestamo) => (
              <View key={prestamo.loanId} style={styles.tarjeta}>
                <Text style={styles.libroTitulo}>
                  {prestamo.libro || "Libro sin título"}
                </Text>

                <Text style={styles.autor}>
                  Autor: {prestamo.autor || "No disponible"}
                </Text>

                <View style={styles.divisor} />

                <Text style={styles.dato}>
                  Fecha de préstamo:{" "}
                  <Text style={styles.valor}>
                    {formatearFecha(prestamo.fechaPrestamo)}
                  </Text>
                </Text>

                <Text style={styles.dato}>
                  Fecha estimada de devolución:{" "}
                  <Text style={styles.valor}>
                    {formatearFecha(prestamo.fechaDevolucionEstimada)}
                  </Text>
                </Text>

                {prestamo.fechaDevolucionReal && (
                  <Text style={styles.dato}>
                    Fecha de devolución real:{" "}
                    <Text style={styles.valor}>
                      {formatearFecha(prestamo.fechaDevolucionReal)}
                    </Text>
                  </Text>
                )}

                <View style={styles.estadoContainer}>
                  <Text style={styles.estadoLabel}>Estado:</Text>

                  <View
                    style={[
                      styles.estadoBadge,
                      { backgroundColor: obtenerColorFondoEstado(prestamo) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.estado,
                        { color: obtenerColorEstado(prestamo) },
                      ]}
                    >
                      {obtenerEstado(prestamo)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
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

  cargando: {
    marginVertical: 35,
  },

  total: {
    color: "#173B63",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 18,
    marginTop: 22,
    marginBottom: 12,
  },

  tarjeta: {
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  libroTitulo: {
    color: "#173B63",
    fontSize: 18,
    fontWeight: "bold",
  },

  autor: {
    color: "#64748B",
    marginTop: 6,
  },

  divisor: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },

  dato: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 9,
  },

  valor: {
    color: "#1E293B",
    fontWeight: "600",
  },

  estadoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  estadoLabel: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 7,
  },

  estado: {
    fontSize: 14,
    fontWeight: "bold",
  },

  vacio: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
  },

  vacioTitulo: {
    color: "#173B63",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },

  vacioTexto: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
  },

  botonCatalogo: {
    backgroundColor: "#2563EB",
    padding: 13,
    borderRadius: 9,
    marginTop: 18,
  },

  textoBotonCatalogo: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  mensajeContainer: {
    padding: 20,
    alignItems: "center",
  },

  error: {
    color: "#DC2626",
    textAlign: "center",
  },

  botonReintentar: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },

  textoBotonReintentar: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  estadoBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
});
