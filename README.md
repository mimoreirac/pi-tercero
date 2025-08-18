# Backend de Carros Compartidos PUCE

![](./screenshot.jpg)

Este proyecto es el backend para una aplicación de carros compartidos diseñada exclusivamente para la comunidad de la Pontificia Universidad Católica del Ecuador (PUCE). El objetivo es ofrecer una plataforma segura y eficiente para que estudiantes, profesores y personal puedan organizar viajes compartidos, fomentando el transporte sostenible y ecológico.

## ✨ Características Principales

- **👤 Gestión de Usuarios:**

  - Creación y sincronización de perfiles de usuario a través de Firebase Authentication.
  - Actualización y eliminación de perfiles de usuario.
  - Rutas seguras para gestionar la información personal.

- **🚗 Gestión de Viajes:**

  - Publicación de nuevos viajes por parte de los conductores.
  - Búsqueda y visualización de viajes activos.
  - Actualización y cancelación de viajes por parte del conductor.

- **🎟️ Sistema de Reservas:**

  - Los pasajeros pueden solicitar unirse a un viaje.
  - Los conductores pueden confirmar o rechazar las solicitudes de reserva.
  - Los pasajeros pueden cancelar sus propias reservas.

- **⚠️ Reporte de Incidentes:**
  - Sistema para que tanto conductores como pasajeros puedan reportar incidentes durante un viaje (retrasos, accidentes, comportamiento inadecuado, etc.).
  - Seguimiento de los incidentes reportados.

## 🛠️ Tecnologías Utilizadas

- **Backend:**

  - **Node.js:** Entorno de ejecución de JavaScript del lado del servidor.
  - **Express:** Framework web para la creación de la API REST.
  - **PostgreSQL:** Sistema de gestión de bases de datos relacional.
  - **Firebase Admin SDK:** Para la autenticación de usuarios y la verificación de tokens.

- **Pruebas:**
  - **Vitest:** Framework de testing moderno para JavaScript.
  - **Supertest:** Librería para probar endpoints de la API.

## 📂 Estructura del Proyecto

El backend está organizado de la siguiente manera para mantener un código limpio y escalable:

```
server/
├── config/         # Configuración de servicios externos (Firebase)
├── controllers/    # Lógica de negocio y control de las rutas
├── middleware/     # Middlewares (ej. autenticación)
├── models/         # Clases y funciones para interactuar con la BDD
├── routes/         # Definición de los endpoints de la API
├── tests/          # Pruebas unitarias y de integración
├── db.js           # Configuración de la conexión a la BDD
└── server.js       # Punto de entrada de la aplicación
```

## 🚀 Cómo Empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local:

1.  **Clonar el repositorio:**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd pi-tercero
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:

    ```env
    PORT=3000
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    FIREBASE_SERVICE_ACCOUNT_KEY="{...}"
    ```

4.  **Ejecutar las migraciones:**
    Aplica el esquema de la base de datos que se encuentra en `server/models/modelos-bdd.sql`.

5.  **Iniciar el servidor:**
    ```bash
    npm run dev
    ```

## 🗺️ Endpoints de la API

A continuación se describen los principales endpoints de la API. Todas las rutas protegidas requieren un `Bearer Token` de Firebase en la cabecera `Authorization`.

### Usuarios (`/api/usuarios`)

- `POST /sync`: Sincroniza el usuario de Firebase con la base de datos local. Se crea si no existe.
- `GET /me`: Obtiene el perfil del usuario autenticado.

### Viajes (`/api/viajes`)

- `POST /`: Crea un nuevo viaje.
- `GET /`: Obtiene todos los viajes con estado "activo".
- `GET /:id`: Obtiene los detalles de un viaje específico.
- `PUT /:id`: Actualiza un viaje (solo el conductor).
- `DELETE /:id`: Cancela un viaje (solo el conductor).

### Reservas (`/api/reservas`)

- `POST /`: Crea una nueva solicitud de reserva para un viaje.
- `GET /viaje/:id`: Obtiene todas las reservas de un viaje específico.
- `PUT /:id_reserva/estado`: Actualiza el estado de una reserva (confirmada/rechazada, solo conductor).
- `PUT /:id_reserva/cancelar`: Cancela una reserva (solo el pasajero).

### Incidentes (`/api/incidentes`)

- `POST /`: Reporta un nuevo incidente en un viaje.
- `GET /me`: Obtiene los incidentes reportados por el usuario autenticado.
- `GET /viaje/:id_viaje`: Obtiene todos los incidentes asociados a un viaje.
