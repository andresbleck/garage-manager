# GarageManager - Instrucciones de Deploy

## 🚀 Deploy en Vercel

### 1. Preparación del Repositorio
Asegúrate que todos los cambios estén en GitHub:
```bash
git add .
git commit -m "Cambios finales para deploy"
git push origin main
```

### 2. Deploy en Vercel
1. Ve a https://vercel.com
2. Inicia sesión con tu cuenta de GitHub
3. Click en "New Project"
4. Importa el repositorio: `garage-manager` (el nuevo nombre)
5. Vercel detectará automáticamente la configuración
6. Click en "Deploy"

### 3. Configuración Automática
Vercel detectará:
- **Backend**: Node.js + Express (en `api/index.js`)
- **Frontend**: React + Vite (en `frontend/`)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`

### 4. Variables de Entorno (si necesitas)
En Vercel, ve a Settings → Environment Variables y agrega:
- `NODE_ENV`: `production`

## 📋 Características Implementadas

### ✅ Autenticación
- **Páginas públicas**: Home y Seguros (cualquiera puede ver)
- **Acciones protegidas**: Agregar, editar, eliminar vehículos requieren login
- **Redirección automática**: Si intenta agregar vehículo sin login → página de login

### ✅ Funcionalidades
- **Gestión de vehículos**: CRUD completo
- **Vencimientos**: Con opción "Otro" y campo personalizado
- **Reparaciones**: Con opción "Otro" y campo personalizado
- **Indicadores visuales**: Vencimientos próximos y vencidos
- **Base de datos**: SQLite con 3 tablas

### ✅ Estructura
```
├── api/
│   ├── index.js              # Backend Express
│   ├── db/
│   │   └── database.js       # SQLite
│   └── routes/
│       ├── vehicles.js
│       ├── expirations.js
│       └── repairs.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
│   └── dist/                  # Build output
├── vercel.json               # Configuración Vercel
└── package.json              # Dependencias principales
```

## 🔧 Solución de Problemas Comunes

### Error: Pantalla en blanco
- Verifica que `vercel.json` esté configurado correctamente
- Asegúrate que el frontend se construya en `frontend/dist`

### Error: npm ENOENT
- El `vercel.json` debe incluir `"includeFiles": "api/**"` para el backend

### Error: Rutas 404
- Las rutas del frontend deben usar `baseURL: '/api'` en producción

## 🎯 URL Final
Una vez deployado, tu aplicación estará disponible en:
`https://tu-proyecto.vercel.app`

## 📱 Experiencia de Usuario

### Sin autenticación:
- Puede ver la página principal
- Puede ver la página de seguros
- Ve mensaje pidiendo login para agregar vehículos

### Con autenticación:
- Acceso completo a todas las funcionalidades
- Panel personalizado con su nombre y familia
- Puede agregar, editar y eliminar vehículos
- Gestión completa de vencimientos y reparaciones

## 🔄 Deploy Automático
Cada vez que hagas `git push origin main`, Vercel automáticamente:
1. Detectará los cambios
2. Reconstruirá la aplicación
3. Actualizará el sitio

¡Listo! Tu GarageManager estará funcionando en producción.
