# 🧪 Guía de Pruebas - Vinyl Store API

## Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar el Servidor
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### 3. Acceder a la Interfaz
Abre tu navegador y visita:
- **Página Principal**: http://localhost:3000/
- **Documentación Swagger**: http://localhost:3000/api-docs
- **Información del Desarrollador**: http://localhost:3000/about
- **Health Check**: http://localhost:3000/ping

## Pruebas de la Interfaz Visual

### Header y Navegación
- [ ] El logo rota continuamente
- [ ] Los enlaces de navegación tienen efecto hover
- [ ] El botón "Documentación" se destaca
- [ ] El header es sticky (se queda en la parte superior al scroll)

### Hero Section
- [ ] El título es visible y legible
- [ ] El vinilo 3D aparece en desktop
- [ ] Los botones son clickeables
- [ ] El efecto parallax funciona al mover el mouse (desktop)

### Features Section
- [ ] Las 6 tarjetas se cargan correctamente
- [ ] Las tarjetas tienen efecto hover (elevación)
- [ ] Las animaciones se ejecutan al hacer scroll
- [ ] Los emojis se muestran correctamente

### Endpoints Section
- [ ] Los 5 grupos de endpoints se muestran
- [ ] Los métodos HTTP tienen colores diferentes:
  - GET: Verde
  - POST: Azul
  - PUT: Naranja
  - DELETE: Rojo
- [ ] Las rutas se pueden copiar al portapapeles (click en la ruta)
- [ ] Aparece notificación al copiar

### Developer Card
- [ ] La tarjeta del desarrollador se muestra con gradiente
- [ ] Se muestran los badges de cédula y sección
- [ ] El email es visible

### Quick Links
- [ ] Las 3 tarjetas de acceso rápido se muestran
- [ ] Los iconos son claros
- [ ] Los enlaces funcionan correctamente

### Footer
- [ ] El footer se muestra al final de la página
- [ ] Los enlaces del footer funcionan
- [ ] El copyright es visible

## Pruebas de Responsividad

### Desktop (1200px+)
```bash
# Abre el navegador en resolución completa
# Verifica que todos los elementos se ven correctamente
```

### Tablet (768px - 1199px)
```bash
# Abre DevTools (F12)
# Selecciona dispositivo: iPad
# Verifica que el layout se adapta correctamente
```

### Mobile (< 480px)
```bash
# Abre DevTools (F12)
# Selecciona dispositivo: iPhone 12
# Verifica que:
# - El menú es accesible
# - Las tarjetas se apilan verticalmente
# - El texto es legible
# - Los botones son clickeables
```

## Pruebas de Funcionalidad

### Navegación
- [ ] Hacer click en "Características" desplaza a esa sección
- [ ] Hacer click en "Endpoints" desplaza a esa sección
- [ ] Hacer click en "Documentación" abre Swagger

### Interactividad
- [ ] Copiar rutas al portapapeles funciona
- [ ] Las notificaciones aparecen correctamente
- [ ] Los efectos hover funcionan en todos los elementos

### Swagger UI
- [ ] La interfaz Swagger tiene tema dark
- [ ] Los botones son visibles y clickeables
- [ ] Los inputs tienen buen contraste
- [ ] Los métodos HTTP tienen colores diferenciados

## Pruebas de Performance

### Tiempo de Carga
```bash
# Abre DevTools (F12)
# Pestaña: Network
# Recarga la página
# Verifica que:
# - Tiempo total < 2 segundos
# - Archivos CSS/JS se cargan rápidamente
```

### Animaciones
```bash
# Verifica que las animaciones son suaves
# No hay lag o stuttering
# Las transiciones son fluidas
```

## Pruebas de Accesibilidad

### Contraste
- [ ] El texto es legible en fondo oscuro
- [ ] Los botones tienen suficiente contraste
- [ ] Los enlaces son distinguibles

### Navegación por Teclado
- [ ] Puedes navegar con Tab
- [ ] Los botones son activables con Enter
- [ ] Los enlaces funcionan con Enter

### Lectores de Pantalla
- [ ] Los elementos tienen etiquetas semánticas
- [ ] Las imágenes tienen alt text (emojis)
- [ ] Los botones tienen texto descriptivo

## Pruebas de Endpoints

### Endpoint /about
```bash
curl http://localhost:3000/about
# Respuesta esperada:
# {
#   "status": "success",
#   "data": {
#     "nombreCompleto": "Jesus Tadelmo",
#     "cedula": "31737569",
#     "seccion": "SECCIÓN 2"
#   }
# }
```

### Endpoint /ping
```bash
curl http://localhost:3000/ping
# Respuesta esperada: 200 OK (sin contenido)
```

### Endpoint /
```bash
curl http://localhost:3000/
# Respuesta esperada: JSON con información de endpoints
```

### Endpoint /api-docs
```bash
curl http://localhost:3000/api-docs
# Respuesta esperada: Página HTML de Swagger UI
```

## Pruebas de Temas

### Tema Oscuro del Sistema
1. Abre Configuración del Sistema
2. Selecciona Tema Oscuro
3. Recarga la página
4. Verifica que el tema se adapta

### Preferencia de Color
```javascript
// En la consola del navegador
window.matchMedia('(prefers-color-scheme: dark)').matches
// Debe retornar: true (en sistema oscuro)
```

## Checklist de Validación

### Visual
- [ ] Colores correctos
- [ ] Tipografía legible
- [ ] Espaciado consistente
- [ ] Alineación correcta
- [ ] Animaciones suaves

### Funcional
- [ ] Todos los enlaces funcionan
- [ ] Los botones son clickeables
- [ ] Las transiciones son suaves
- [ ] No hay errores en consola
- [ ] Las notificaciones aparecen

### Responsivo
- [ ] Desktop: 1920px
- [ ] Tablet: 768px
- [ ] Mobile: 375px
- [ ] Todos los tamaños se ven bien

### Performance
- [ ] Carga < 2 segundos
- [ ] Sin lag en animaciones
- [ ] Transiciones suaves
- [ ] Sin memory leaks

### Accesibilidad
- [ ] Contraste WCAG AA
- [ ] Navegación por teclado
- [ ] Semántica HTML correcta
- [ ] Alt text en imágenes

## Comandos Útiles

### Desarrollo
```bash
npm run dev          # Inicia servidor con hot reload
npm run build        # Compila TypeScript
npm run start        # Inicia servidor compilado
npm run test         # Ejecuta tests
npm run test:watch   # Tests en modo watch
```

### Debugging
```bash
# En DevTools (F12)
# Consola: Ver logs y errores
# Network: Ver solicitudes HTTP
# Performance: Analizar rendimiento
# Accessibility: Verificar accesibilidad
```

## Reportar Problemas

Si encuentras algún problema:

1. **Abre DevTools** (F12)
2. **Verifica la consola** para errores
3. **Toma una captura de pantalla**
4. **Anota los pasos para reproducir**
5. **Reporta con detalles**

## Ejemplo de Reporte

```
Problema: El vinilo 3D no aparece en mobile
Navegador: Chrome 120
Dispositivo: iPhone 12
Pasos:
1. Abre http://localhost:3000/
2. Redimensiona a 375px
3. Scroll a Hero Section
Resultado esperado: Vinilo visible
Resultado actual: Vinilo no aparece
```

---

**Última actualización**: 2024
**Versión**: 1.0
