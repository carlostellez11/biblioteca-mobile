# Sistema de Control de Biblioteca Universitaria – Mobile

## Descripción
Aplicación móvil desarrollada para gestionar las operaciones de una biblioteca universitaria. Permite a los usuarios consultar el catálogo de libros, solicitar préstamos y revisar sus préstamos registrados.

## Tecnologías utilizadas
- React Native
- Expo SDK 58
- JavaScript
- Expo Router
- React Navigation (mediante Expo Router)
- Expo SecureStore
- API REST

## Funcionalidades
- Registro e inicio de sesión de usuarios.
- Validación de formularios.
- Consulta del catálogo de libros.
- Visualización de información y disponibilidad de libros.
- Solicitud de préstamos.
- Consulta de préstamos del usuario.
- Actualización de información mediante la API.
- Almacenamiento seguro del token de sesión.
- Cierre de sesión.

## Requisitos previos
- Node.js
- npm
- Expo CLI (se puede utilizar mediante `npx expo`)
- Expo Go o un emulador Android para ejecutar la aplicación.

## Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/carlostellez11/biblioteca-mobile.git
   ```

2. Entrar al directorio:

   ```bash
   cd biblioteca-mobile
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

4. Crear un archivo `.env` en la raíz del proyecto, tomando como referencia `.env.example`.

5. Configurar las variables de entorno:

   ```env
   EXPO_PUBLIC_API_BASE_URL=https://proyecto-idgs9-v1.onrender.com
   EXPO_PUBLIC_API_APP_TOKEN=TU_TOKEN_DE_API
   ```

   Sustituir `TU_TOKEN_DE_API` por el token proporcionado para consumir la API. No compartir ni subir el archivo `.env` al repositorio.

## Ejecución

Iniciar el servidor de desarrollo:

```bash
npx expo start
```

Después, abrir la aplicación desde Expo Go o desde un emulador compatible.

## Estructura del proyecto

```text
biblioteca-mobile/
├── src/
│   ├── app/
│   │   ├── _layout.js
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── registro.js
│   │   ├── catalogo.js
│   │   ├── solicitud-prestamo.js
│   │   └── mis-prestamos.js
│   ├── components/
│   ├── constants/
│   ├── context/
│   │   └── AuthContext.js
│   ├── services/
│   │   ├── api.js
│   │   └── authService.js
│   └── utils/
├── .env.example
├── app.json
├── package.json
└── README.md
```

## API
La aplicación consume una API REST compartida con la versión web del sistema.

Documentación de los endpoints:

https://proyecto-idgs9-v1.onrender.com/api/docs/

Las peticiones utilizan el encabezado `x-api-token` y, para operaciones autenticadas, el token JWT del usuario.

## Seguridad
- Las credenciales de sesión se almacenan mediante Expo SecureStore.
- El registro asigna el rol USER por defecto.
- Las rutas de la aplicación dependen del estado de autenticación.
- El token de acceso a la API se configura mediante variables de entorno.

## Repositorio
https://github.com/carlostellez11/biblioteca-mobile