# GarageManager

Aplicación web full-stack para gestión de vehículos doméstica.

## Características

- Gestión completa de vehículos (CRUD)
- Control de vencimientos (Seguro, VTV, Matafuegos, y otros personalizados)
- Historial de reparaciones con tipos predefinidos y opción "Otro"
- Indicadores visuales de vencimientos próximos y vencidos
- Interfaz moderna y responsiva con Tailwind CSS

## Stack Tecnológico

- **Frontend**: React (Vite) + React Router + Axios + Tailwind CSS
- **Backend**: Node.js + Express
- **Base de datos**: SQLite con better-sqlite3
- **Deploy**: Netlify (Serverless Functions)

## Estructura del Proyecto

```
garage-manager/
  frontend/                 # Aplicación React
    src/
      pages/               # Páginas principales
      components/          # Componentes reutilizables
  api/                     # Backend para Netlify Functions
    db/                   # Base de datos SQLite
    routes/               # Rutas de la API
  netlify.toml            # Configuración de Netlify
  package.json            # Scripts de build
```

## Desarrollo Local

### Prerrequisitos
- Node.js 18+
- npm

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd garage-manager

# Instalar dependencias principales
npm install

# Instalar dependencias del backend
cd api && npm install

# Instalar dependencias del frontend
cd ../frontend && npm install
```

### Ejecutar en Desarrollo
```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- Backend en http://localhost:3001
- Frontend en http://localhost:5173

## Deploy en Netlify

### Paso 1: Preparar el Repositorio
```bash
# Subir el código a GitHub
git add .
git commit -m "Ready for Netlify deploy"
git push origin main
```

### Paso 2: Deploy en Netlify
1. Ve a [netlify.com](https://netlify.com)
2. Conecta tu cuenta de GitHub
3. Importa el repositorio `GarageManager`
4. Netlify detectará automáticamente la configuración desde `netlify.toml`
5. Haz clic en "Deploy site"

### Paso 3: Configuración Adicional
Netlify configurará automáticamente:
- Build command: `cd frontend && npm install && npm run build`
- Publish directory: `frontend/dist`
- Functions directory: `api`

### Paso 4: Variables de Entorno (Opcional)
Si necesitas configurar variables de entorno, agrégas en el dashboard de Netlify:
- `NODE_ENV`: `production`

## Funcionalidades

### Gestión de Vehículos
- Agregar, editar y eliminar vehículos
- Validación de patentes únicas
- Soporte para fotos de vehículos

### Vencimientos
- Tipos predefinidos: Seguro, VTV, Matafuegos
- Opción "Otro" con campo personalizado (ej: "Cédula verde")
- Indicadores visuales de estado (OK/Próximo/Vencido)
- Alertas automáticas para vencimientos próximos (< 30 días)

### Reparaciones
- Tipos predefinidos: Cambio de batería, aceite, ruedas, aire acondicionado
- Opción "Otro" con campo personalizado (ej: "Bujías")
- Registro de costo y kilometraje
- Historial cronológico completo

## API Endpoints

### Vehículos
- `GET /api/vehicles` - Listar todos
- `POST /api/vehicles` - Crear nuevo
- `GET /api/vehicles/:id` - Obtener uno
- `PUT /api/vehicles/:id` - Editar
- `DELETE /api/vehicles/:id` - Eliminar

### Vencimientos
- `GET /api/vehicles/:id/expirations` - Listar por vehículo
- `POST /api/vehicles/:id/expirations` - Agregar
- `PUT /api/expirations/:id` - Editar
- `DELETE /api/expirations/:id` - Eliminar

### Reparaciones
- `GET /api/vehicles/:id/repairs` - Listar por vehículo
- `POST /api/vehicles/:id/repairs` - Agregar
- `PUT /api/repairs/:id` - Editar
- `DELETE /api/repairs/:id` - Eliminar

## Contribuir

1. Fork el proyecto
2. Crea una feature branch (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

## Licencia

MIT License - ver archivo LICENSE para detalles
