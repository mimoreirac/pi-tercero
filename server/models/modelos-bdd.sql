CREATE TABLE usuarios (
	id_usuario SERIAL PRIMARY KEY,
	firebase_uid VARCHAR(128) UNIQUE NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	numero_telefono VARCHAR(10) UNIQUE NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE viajes (
	id_viaje SERIAL PRIMARY KEY,
	id_conductor INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
	origen TEXT NOT NULL,
	destino TEXT NOT NULL,
	hora_salida TIMESTAMP NOT NULL,
	asientos_disponibles INT NOT NULL CHECK (asientos_disponibles >= 0),
	descripcion TEXT,
	estado TEXT NOT NULL CHECK (
		estado IN ('activo', 'iniciado', 'cancelado', 'completado')
	) DEFAULT 'activo',
	etiquetas_area TEXT[],
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reservas (
	id_reserva SERIAL PRIMARY KEY,
	id_viaje INT NOT NULL REFERENCES viajes(id_viaje) ON DELETE RESTRICT,
	id_pasajero INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
	estado TEXT NOT NULL CHECK (
		estado IN ('pendiente', 'confirmada', 'rechazada', 'cancelada')
	) DEFAULT 'pendiente',
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE incidentes (
	id_incidente SERIAL PRIMARY KEY,
	id_viaje INT NOT NULL REFERENCES viajes(id_viaje) ON DELETE RESTRICT,
	id_reportador INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
	tipo_incidente TEXT NOT NULL CHECK (
		tipo_incidente IN ('accidente', 'retraso', 'cancelacion', 'comportamiento', 'otro')
	),
	descripcion TEXT NOT NULL,
	estado TEXT NOT NULL CHECK (
		estado IN ('abierto', 'en_revision', 'resuelto', 'cerrado')
	) DEFAULT 'abierto',
	created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE registro_auditoria (
	id_registro SERIAL PRIMARY KEY,
	id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
	accion TEXT NOT NULL,
	tipo_recurso TEXT NOT NULL CHECK (
		tipo_recurso IN ('viaje', 'reserva', 'incidente', 'usuario')
	),
	id_recurso INT NOT NULL, -- No usamos Foreign Key porque puede referenciar diferentes tablas dependiendo en el tipo recurso
	detalles JSONB,
	created_at TIMESTAMP DEFAULT NOW()
);