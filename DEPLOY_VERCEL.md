# Deploy en Vercel - Guía Rápida

## Opción 1: Interfaz Web (Recomendada)

1. Ve a https://vercel.com
2. Inicia sesión con GitHub
3. Click en "New Project"
4. Busca: `andresbleck/GarageManager`
5. Selecciona la rama: `main`
6. Click en "Deploy"

## Opción 2: CLI (Si el botón no funciona)

1. Instala Vercel CLI:
```bash
npm i -g vercel
```

2. Inicia sesión:
```bash
vercel login
```

3. Deploy desde el directorio del proyecto:
```bash
cd C:\Users\Usuario\km0
vercel --prod
```

## Configuración Automática Detectada

Vercel detectará automáticamente:
- ✅ Frontend: React + Vite
- ✅ Backend: Node.js + Express
- ✅ Build Command: `cd frontend && npm install && npm run build`
- ✅ Output Directory: `frontend/dist`

## Si tienes problemas

1. **Verifica que el repositorio esté actualizado:**
```bash
git status
git add .
git push origin main
```

2. **Limpia el cache del navegador**
3. **Intenta con otro navegador**
4. **Verifica que el repositorio sea público o tengas acceso**

## URLs de ejemplo

- **GitHub:** https://github.com/andresbleck/GarageManager
- **Vercel:** https://vercel.com/dashboard
- **Deploy:** https://vercel.com/new
