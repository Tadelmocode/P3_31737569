# API RESTful - Jesús Tadelmo (P3_31737569)

API RESTful completa desarrollada con Node.js, Express, TypeScript y Sequelize-TypeScript. Incluye autenticación JWT, gestión de usuarios, y documentación Swagger.

## 🚀 Características

- ✅ **Autenticación JWT** - Sistema completo de registro y login
- ✅ **CRUD de Usuarios** - Gestión completa de usuarios con rutas protegidas
- ✅ **Base de Datos SQLite** - Con ORM Sequelize-TypeScript
- ✅ **Documentación Swagger** - API docs interactiva en `/api-docs`
- ✅ **Tests Automatizados** - 14 tests con Jest y Supertest (72% cobertura)
- ✅ **CI/CD** - Pipeline automatizado con GitHub Actions
- ✅ **TypeScript** - Tipado estático completo
- ✅ **Seguridad** - Contraseñas hasheadas con bcrypt, Helmet, CORS

## 📋 Requisitos Previos

- Node.js 18.x o superior
- npm 9.x o superior

## 🔧 Instalación

```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd P3_31737569

# Instalar dependencias
npm install

# Crear archivo .env (ver ejemplo abajo)
cp .env.example .env
```

### Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
JWT_SECRET=tu_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h
```

## 🎮 Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
# Compilar TypeScript
npm run build

# Iniciar servidor
npm start
```

### Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch
```

## 📚 Documentación de la API

Una vez iniciado el servidor, acceder a:
- **Swagger UI**: http://localhost:3000/api-docs
- **Endpoint About**: http://localhost:3000/about
- **Health Check**: http://localhost:3000/ping

## 🔐 Endpoints

### Públicos (No requieren autenticación)

#### Autenticación

**POST /auth/register**
```json
{
  "nombreCompleto": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**POST /auth/login**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

### Protegidos (Requieren token JWT)

Incluir en el header: `Authorization: Bearer <token>`

#### Usuarios

- **GET /users** - Obtener todos los usuarios
- **GET /users/:id** - Obtener usuario por ID
- **POST /users** - Crear nuevo usuario
- **PUT /users/:id** - Actualizar usuario
- **DELETE /users/:id** - Eliminar usuario

## 🏗️ Estructura del Proyecto

```
P3_31737569/
├── src/
│   ├── __tests__/          # Tests automatizados
│   ├── config/             # Configuración (DB)
│   ├── middlewares/        # Middlewares (auth)
│   ├── models/             # Modelos Sequelize-TypeScript
│   ├── routes/             # Rutas Express
│   ├── utils/              # Utilidades (JWT)
│   ├── app.ts              # Aplicación Express
│   └── server.ts           # Servidor HTTP
├── dist/                   # Código compilado
├── coverage/               # Reportes de cobertura
├── .github/
│   └── workflows/
│       └── ci.yml          # Pipeline CI/CD
├── .env                    # Variables de entorno (no commiteado)
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.cjs
└── README.md
```

## 🧪 Tests

El proyecto incluye tests completos para:
- ✅ Autenticación (registro, login, errores)
- ✅ Rutas protegidas (con/sin token)
- ✅ CRUD de usuarios
- ✅ Endpoints públicos

```bash
Test Suites: 3 passed, 3 total
Tests:       14 passed, 14 total
Coverage:    72.72%
```

## 🔒 Seguridad

- **Contraseñas**: Hasheadas con bcrypt (10 salt rounds)
- **JWT**: Tokens firmados con secret configurable
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para requests cross-origin
- **Validación**: Email único, validación de formato

## 📦 Tecnologías

- **Runtime**: Node.js 18.x
- **Framework**: Express 5.x
- **Lenguaje**: TypeScript 5.x
- **Base de Datos**: SQLite
- **ORM**: Sequelize-TypeScript 2.1.6
- **Autenticación**: JSON Web Tokens (JWT)
- **Hash**: bcryptjs
- **Testing**: Jest + Supertest
- **Documentación**: Swagger (swagger-jsdoc + swagger-ui-express)
- **CI/CD**: GitHub Actions

## 👨‍💻 Autor

**Jesús Tadelmo**
- Cédula: 31737569
- Sección: 02

## 📄 Licencia

ISC

## 🚀 Despliegue

### Render.com

1. Conectar repositorio de GitHub
2. Configurar variables de entorno:
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
3. Build Command: `npm run build`
4. Start Command: `npm start`

## 📝 Notas

- La base de datos SQLite se crea automáticamente al iniciar
- Los tests usan una base de datos en memoria
- El pipeline de CI/CD se ejecuta en cada push a `main` y `setup`
- La documentación Swagger se genera automáticamente desde comentarios JSDoc

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
npm run build
```

### Tests fallan
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
npm test
```

### Puerto en uso
Cambiar `PORT` en archivo `.env`

## 📞 Soporte

Para reportar issues o contribuir, abrir un issue en el repositorio de GitHub.