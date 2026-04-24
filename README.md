# GarageManager

Aplicación web full-stack para gestión de vehículos doméstica con autenticación familiar.

## 🚀 Sobre la Aplicación

GarageManager es un sistema completo para la gestión de vehículos familiares que permite:

- **Gestión de vehículos**: Registro, edición y eliminación de vehículos familiares
- **Control de vencimientos**: Seguro, VTV, Matafuegos, y otros personalizados
- **Historial de reparaciones**: Registro detallado con tipos predefinidos y opción "Otro"
- **Indicadores visuales**: Alertas automáticas para vencimientos próximos y vencidos
- **Autenticación familiar**: Sistema de login con cuentas familiares compartidas
- **Acceso controlado**: Público para ver, privado para gestionar

## 🛠️ Stack Tecnológico

### Frontend
- **React 18**: Framework principal con componentes funcionales
- **Vite**: Build tool ultra-rápido para desarrollo
- **React Router**: Navegación SPA con rutas protegidas
- **Axios**: Cliente HTTP para comunicación con API
- **Tailwind CSS**: Framework CSS para diseño moderno
- **React Toastify**: Notificaciones elegantes
- **React Context**: Manejo de estado de autenticación

### Backend
- **Node.js**: Runtime JavaScript del lado del servidor
- **Express.js**: Framework HTTP robusto y flexible
- **better-sqlite3**: Base de datos SQLite rápida y síncrona
- **JWT**: Tokens de autenticación JSON Web Tokens
- **CORS**: Middleware para compartir recursos entre orígenes

### Base de Datos
- **SQLite**: Base de datos relacional ligera
- **3 tablas principales**: vehicles, expirations, repairs
- **Índices optimizados**: Patentes únicas por familia
- **Migraciones automáticas**: Estructura inicializada al iniciar

### Deploy
- **Render**: Backend Node.js con persistencia de datos
- **Vercel**: Frontend estático con build optimizado
- **Arquitectura separada**: Backend y frontend independientes

## 📁 Estructura del Proyecto

```
garage-manager/
├── backend/                    # Backend Express.js
│   ├── index.js               # Servidor principal
│   ├── package.json           # Dependencias del backend
│   ├── db/
│   │   └── database.js        # Configuración SQLite
│   └── routes/
│       ├── vehicles.js        # Rutas CRUD vehículos
│       ├── expirations.js     # Rutas CRUD vencimientos
│       ├── repairs.js         # Rutas CRUD reparaciones
│       └── auth.js            # Rutas de autenticación
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── pages/             # Páginas principales
│   │   │   ├── Home.jsx       # Dashboard principal
│   │   │   ├── Login.jsx      # Login de usuarios
│   │   │   ├── Register.jsx   # Registro de usuarios
│   │   │   ├── AddVehicle.jsx # Formulario vehículos
│   │   │   ├── VehicleDetail.jsx # Detalles vehículo
│   │   │   └── Insurance.jsx  # Gestión de seguros
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── VehicleCard.jsx
│   │   │   ├── ExpirationSection.jsx
│   │   │   ├── RepairSection.jsx
│   │   │   └── RequireAuth.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Contexto de autenticación
│   │   ├── api.js            # Configuración Axios
│   │   └── App.jsx           # App principal
│   ├── package.json          # Dependencias del frontend
│   ├── vercel.json           # Configuración Vercel
│   └── vite.config.js        # Configuración Vite
├── DEPLOY_SEPARADO.md         # Instrucciones de deploy
├── INSTRUCCIONES_DEPLOY.md    # Guía de deploy
└── package.json               # Scripts raíz
```

## 💻 Desarrollo Local

### Prerrequisitos
- **Node.js 18+**: Runtime JavaScript
- **npm**: Gestor de paquetes
- **Git**: Control de versiones

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/andresbleck/garage-manager.git
cd garage-manager

# Instalar dependencias del backend
cd backend && npm install

# Instalar dependencias del frontend
cd ../frontend && npm install
```

### Ejecutar en Desarrollo
```bash
# Iniciar backend (desde carpeta backend)
npm run dev
# Backend corriendo en http://localhost:3001

# Iniciar frontend (desde carpeta frontend)
npm run dev
# Frontend corriendo en http://localhost:5173
```

### Credenciales de Prueba
- **Email**: `admingarage@gmail.com`
- **Contraseña**: `GarageManager`

## 🚀 Deploy en Producción

### Arquitectura de Deploy
```
Frontend (Vercel) → API Calls → Backend (Render) → SQLite Database
```

### Paso 1: Deploy Backend en Render
1. Ve a [render.com](https://render.com)
2. Crea cuenta o inicia sesión
3. **New Web Service** → Conecta GitHub repo
4. **Name**: `garage-manager-api`
5. **Root Directory**: `backend`
6. **Runtime**: `Node`
7. **Build Command**: `npm install`
8. **Start Command**: `npm start`
9. **Variables de entorno**:
   - `NODE_ENV`: `production`

### Paso 2: Deploy Frontend en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. **New Project** → Importa `garage-manager`
4. **Framework Preset**: Vite
5. **Root Directory**: `frontend`
6. **Build Command**: `npm install && npm run build`
7. **Output Directory**: `dist`

### Paso 3: Configuración CORS
El backend está configurado para aceptar peticiones de:
- `https://tu-dominio-vercel.app`
- `http://localhost:5173`

### URLs de Producción
- **Backend**: `https://garage-manager-1.onrender.com`
- **Frontend**: `https://garage-manager-five.vercel.app`

## 🎯 Funcionalidades Principales

### 🚗 Gestión de Vehículos
- **CRUD completo**: Agregar, editar, ver y eliminar vehículos
- **Validación inteligente**: Patentes únicas por familia
- **Información detallada**: Marca, modelo, año, patente, kilometraje
- **Acceso controlado**: Solo usuarios autenticados pueden gestionar

### 📅 Control de Vencimientos
- **Tipos predefinidos**: Seguro, VTV, Matafuegos
- **Opción "Otro"**: Campo personalizado para cualquier tipo
- **Indicadores visuales**: 
  - 🟢 OK (más de 30 días)
  - 🟡 Próximo (menos de 30 días)
  - 🔴 Vencido
- **Alertas automáticas**: Notificaciones para vencimientos próximos

### 🔧 Historial de Reparaciones
- **Tipos predefinidos**: Cambio de batería, aceite, ruedas, aire acondicionado
- **Opción "Otro"**: Campo personalizado para cualquier reparación
- **Registro completo**: Costo, kilometraje, fecha, descripción
- **Historial cronológico**: Timeline completo de mantenimiento

### 👥 Autenticación Familiar
- **Cuentas compartidas**: Múltiples usuarios por familia
- **Acceso público**: Cualquiera puede ver vehículos existentes
- **Acceso privado**: Solo usuarios logueados pueden gestionar
- **Sesiones seguras**: Tokens JWT con expiración

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil de usuario

### Vehículos
- `GET /api/vehicles` - Listar todos los vehículos
- `POST /api/vehicles` - Crear nuevo vehículo
- `GET /api/vehicles/:id` - Obtener vehículo específico
- `PUT /api/vehicles/:id` - Editar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo

### Vencimientos
- `GET /api/vehicles/:id/expirations` - Listar vencimientos de vehículo
- `POST /api/vehicles/:id/expirations` - Agregar vencimiento
- `PUT /api/expirations/:id` - Editar vencimiento
- `DELETE /api/expirations/:id` - Eliminar vencimiento

### Reparaciones
- `GET /api/vehicles/:id/repairs` - Listar reparaciones de vehículo
- `POST /api/vehicles/:id/repairs` - Agregar reparación
- `PUT /api/repairs/:id` - Editar reparación
- `DELETE /api/repairs/:id` - Eliminar reparación

## 🗄️ Base de Datos

### Estructura SQLite
```sql
-- Tabla de vehículos
CREATE TABLE vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  patente TEXT NOT NULL UNIQUE,
  año INTEGER NOT NULL,
  kilometraje INTEGER DEFAULT 0,
  family_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vencimientos
CREATE TABLE expirations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  tipo_personalizado TEXT,
  fecha_vencimiento DATE NOT NULL,
  recordatorio BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Tabla de reparaciones
CREATE TABLE repairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  tipo_personalizado TEXT,
  descripcion TEXT,
  costo REAL,
  kilometraje INTEGER,
  fecha DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
```

## 🐛 Solución de Problemas

### Errores Comunes
- **CORS**: Verifica que el backend permita tu dominio Vercel
- **404 API**: Confirma que las URLs del frontend apunten al backend correcto
- **Login fallido**: Verifica credenciales y estado del backend

### Debug Tips
- **Backend**: Revisa logs en Render Dashboard
- **Frontend**: Usa Chrome DevTools → Network tab
- **Base de datos**: Los datos persisten en Render automáticamente

## 🤝 Contribuir

1. **Fork** el repositorio
2. **Crear branch**: `git checkout -b feature/amazing-feature`
3. **Commit**: `git commit -m 'Add amazing feature'`
4. **Push**: `git push origin feature/amazing-feature`
5. **Pull Request**: Abrir PR con descripción detallada

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles completos

---

## 📞 Contacto

- **GitHub**: [@andresbleck](https://github.com/andresbleck)
- **Proyecto**: [GarageManager](https://github.com/andresbleck/garage-manager)
- **Demo**: [garage-manager-five.vercel.app](https://garage-manager-five.vercel.app)
