import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';
// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes, { selfHealingRouter } from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import tagRoutes from './routes/tags.js';

import sequelize from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API RESTful - Tienda de Vinilos',
      version: '1.0.0',
      description: `
# API RESTful para Tienda de Vinilos
API desarrollada con Node.js, Express, TypeScript y Sequelize.

## 🔐 Autenticación
Para probar los endpoints protegidos:
1. Registra un usuario en \`/auth/register\` o inicia sesión en \`/auth/login\`
2. Copia el token JWT de la respuesta
3. Haz clic en el botón **Authorize** 🔓 (arriba a la derecha)
4. Ingresa el token en el formato: \`Bearer <tu-token>\`

## 📚 Características
- **Autenticación JWT**: Registro y login de usuarios
- **Gestión de Productos**: CRUD completo de vinilos con atributos personalizados
- **Categorías y Tags**: Organización y clasificación de productos
- **Búsqueda Avanzada**: Filtros múltiples, paginación y ordenamiento
- **Self-Healing URLs**: URLs amigables con redirección automática
- **Formato JSend**: Respuestas estandarizadas

## 👤 Desarrollado por
**Jesus Tadelmo** - Cédula: 31737569 - Sección 2
      `,
      contact: {
        name: 'Jesus Tadelmo',
        email: 'jesustadelmo1700@gmail.com',
      },
    },
    tags: [
      { 
        name: 'Auth', 
        description: '🔐 Autenticación y registro de usuarios' 
      },
      { 
        name: 'Users', 
        description: '👥 Gestión de usuarios (requiere autenticación)' 
      },
      { 
        name: 'Products - Público', 
        description: '🎵 Endpoints públicos de vinilos - Listado, búsqueda y detalle (sin autenticación)' 
      },
      { 
        name: 'Products - Gestión', 
        description: '🔒 Gestión de vinilos - Crear, actualizar y eliminar (requiere autenticación)' 
      },
      { 
        name: 'Categories', 
        description: '📁 Gestión de categorías de vinilos (requiere autenticación)' 
      },
      { 
        name: 'Tags', 
        description: '🏷️ Gestión de etiquetas para vinilos (requiere autenticación)' 
      },
      { 
        name: 'System', 
        description: '⚙️ Endpoints del sistema' 
      },
    ],
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Autenticación mediante token JWT. Formato: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombreCompleto: { type: 'string', example: 'Jesus Tadelmo' },
            email: { type: 'string', format: 'email', example: 'jesustadelmo1700@gmail.com' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Rock' },
            description: { type: 'string', example: 'Música rock de todas las épocas' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Vintage' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Dark Side of the Moon' },
            slug: { type: 'string', example: 'dark-side-of-the-moon-a1b2c3d4' },
            description: { type: 'string', example: 'Álbum icónico de Pink Floyd de 1973' },
            price: { type: 'number', format: 'float', example: 45.99 },
            stock: { type: 'integer', example: 5 },
            artist: { type: 'string', example: 'Pink Floyd' },
            label: { type: 'string', example: 'Harvest Records' },
            releaseYear: { type: 'integer', example: 1973 },
            format: { type: 'string', enum: ['LP', 'EP', 'Single', '7"', '10"', '12"'], example: 'LP' },
            condition: { type: 'string', enum: ['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good'], example: 'Near Mint' },
            sku: { type: 'string', example: 'PF-DSOTM-1973' },
            isActive: { type: 'boolean', example: true },
            userId: { type: 'integer', example: 1 },
            categoryId: { type: 'integer', example: 1 },
            category: { $ref: '#/components/schemas/Category' },
            tags: {
              type: 'array',
              items: { $ref: '#/components/schemas/Tag' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name', 'price', 'categoryId'],
          properties: {
            name: { type: 'string', example: 'Dark Side of the Moon' },
            description: { type: 'string', example: 'Álbum icónico de Pink Floyd de 1973' },
            price: { type: 'number', format: 'float', example: 45.99 },
            stock: { type: 'integer', example: 5, default: 0 },
            categoryId: { type: 'integer', example: 1 },
            artist: { type: 'string', example: 'Pink Floyd' },
            label: { type: 'string', example: 'Harvest Records' },
            releaseYear: { type: 'integer', example: 1973 },
            format: { type: 'string', example: 'LP' },
            condition: { type: 'string', example: 'Near Mint' },
            sku: { type: 'string', example: 'PF-DSOTM-1973' },
            isActive: { type: 'boolean', example: true, default: true },
            tagIds: {
              type: 'array',
              items: { type: 'integer' },
              example: [1, 2],
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            itemsPerPage: { type: 'integer', example: 10 },
            totalItems: { type: 'integer', example: 50 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        JSendSuccess: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            data: { type: 'object' },
          },
        },
        JSendFail: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Descripción del error' },
              },
            },
          },
        },
        JSendError: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Error interno del servidor' },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/app.ts', './src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Tema dark personalizado para Swagger UI
const customCss = `
    :root {
      --bg-primary: #0f1419;
      --bg-secondary: #1a1f2e;
      --text-primary: #e8eef5;
      --accent-primary: #6366f1;
    }
    
    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
    }
    
    .topbar {
      background-color: var(--bg-secondary);
      border-bottom: 1px solid #2d3748;
    }
    
    .topbar-wrapper {
      padding: 20px;
    }
    
    .topbar h1 {
      color: var(--text-primary);
    }
    
    .swagger-ui .topbar .download-url-wrapper input[type="text"] {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      border: 1px solid #2d3748;
    }
    
    .swagger-ui .topbar .download-url-wrapper .download-url-button {
      background-color: var(--accent-primary);
      color: white;
    }
    
    .swagger-ui .info {
      margin: 20px 0;
    }
    
    .swagger-ui .info .title {
      color: var(--text-primary);
    }
    
    .swagger-ui .info .description {
      color: #ffffff;
    }
    
    .swagger-ui .info .description h1,
    .swagger-ui .info .description h2,
    .swagger-ui .info .description h3,
    .swagger-ui .info .description p {
      color: #ffffff;
    }
    
    .swagger-ui .scheme-container {
      background-color: var(--bg-secondary);
      border: 1px solid #2d3748;
    }
    
    .swagger-ui .btn {
      background-color: var(--accent-primary);
      color: white;
      border: none;
    }
    
    .swagger-ui .btn:hover {
      background-color: #5558e3;
    }
    
    .swagger-ui .model-container {
      background-color: var(--bg-secondary);
      border: 1px solid #2d3748;
    }
    
    .swagger-ui .model-box {
      background-color: var(--bg-primary);
      border: 1px solid #2d3748;
    }
    
    .swagger-ui section.models {
      border: 1px solid #2d3748;
    }
    
    .swagger-ui .model-title {
      color: var(--text-primary);
    }
    
    .swagger-ui table {
      background-color: var(--bg-secondary);
    }
    
    .swagger-ui table thead tr {
      background-color: var(--bg-tertiary);
      border-bottom: 1px solid #2d3748;
    }
    
    .swagger-ui table thead tr th {
      color: var(--text-primary);
    }
    
    .swagger-ui table tbody tr {
      border-bottom: 1px solid #2d3748;
    }
    
    .swagger-ui table tbody tr td {
      color: #ffffff;
    }
    
    .swagger-ui .opblock {
      background-color: var(--bg-secondary);
      border: 1px solid #2d3748;
      margin: 10px 0;
    }
    
    .swagger-ui .opblock.opblock-get {
      background-color: rgba(16, 185, 129, 0.05);
      border-left: 4px solid #10b981;
    }
    
    .swagger-ui .opblock.opblock-post {
      background-color: rgba(59, 130, 246, 0.05);
      border-left: 4px solid #3b82f6;
    }
    
    .swagger-ui .opblock.opblock-put {
      background-color: rgba(245, 158, 11, 0.05);
      border-left: 4px solid #f59e0b;
    }
    
    .swagger-ui .opblock.opblock-delete {
      background-color: rgba(239, 68, 68, 0.05);
      border-left: 4px solid #ef4444;
    }
    
    .swagger-ui .opblock-summary {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-method {
      background-color: var(--accent-primary);
      color: white !important;
    }
    
    .swagger-ui .opblock-summary-path {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-description {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-get {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-post {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-put {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-delete {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-patch {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-options {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-head {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-trace {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-section-header {
      background-color: var(--bg-tertiary);
      border-bottom: 1px solid #2d3748;
    }
    
    .swagger-ui .opblock-section-header h4 {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary * {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-description,
    .swagger-ui .opblock-summary-description * {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-summary-operation-id,
    .swagger-ui .opblock-summary-operation-id * {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-tag {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock-tag * {
      color: #ffffff !important;
    }
    
    .swagger-ui input[type="text"],
    .swagger-ui input[type="password"],
    .swagger-ui input[type="search"],
    .swagger-ui input[type="email"],
    .swagger-ui input[type="number"],
    .swagger-ui textarea,
    .swagger-ui select {
      background-color: var(--bg-primary);
      color: #ffffff;
      border: 1px solid #2d3748;
    }
    
    .swagger-ui input[type="text"]:focus,
    .swagger-ui input[type="password"]:focus,
    .swagger-ui input[type="search"]:focus,
    .swagger-ui input[type="email"]:focus,
    .swagger-ui input[type="number"]:focus,
    .swagger-ui textarea:focus,
    .swagger-ui select:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .swagger-ui .response-col_description {
      color: #ffffff;
    }
    
    .swagger-ui .response-col_status {
      color: #ffffff;
    }
    
    .swagger-ui .response-col_links {
      color: #ffffff;
    }
    
    .swagger-ui .model {
      color: #ffffff;
    }
    
    .swagger-ui .model-box {
      background-color: var(--bg-primary);
    }
    
    .swagger-ui .model-box-control {
      color: var(--accent-primary);
    }
    
    .swagger-ui .auth-container {
      background-color: var(--bg-secondary);
      border: 1px solid #2d3748;
    }
    
    .swagger-ui .auth-container .auth-btn {
      background-color: var(--accent-primary);
      color: white;
    }
    
    .swagger-ui .auth-container .auth-btn:hover {
      background-color: #5558e3;
    }
    
    .swagger-ui .authorization__btn {
      background-color: var(--accent-primary);
      color: white;
    }
    
    .swagger-ui .authorization__btn:hover {
      background-color: #5558e3;
    }
    
    .swagger-ui .model-toggle::after {
      background-color: var(--accent-primary);
    }
    
    .swagger-ui .try-out__btn {
      background-color: var(--accent-primary);
      color: white;
    }
    
    .swagger-ui .try-out__btn:hover {
      background-color: #5558e3;
    }
    
    .swagger-ui .execute__btn {
      background-color: #10b981;
      color: white;
    }
    
    .swagger-ui .execute__btn:hover {
      background-color: #059669;
    }
    
    .swagger-ui .response-control-media-type {
      color: var(--text-primary);
    }
    
    .swagger-ui .response-control-media-type-control {
      background-color: var(--bg-secondary);
      border: 1px solid #2d3748;
    }
    
    .swagger-ui .response-control-media-type-control select {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      border: 1px solid #2d3748;
    }
    
    .swagger-ui .highlight-code {
      background-color: var(--bg-primary);
    }
    
    .swagger-ui .microlight {
      background-color: var(--bg-primary);
      color: #a0aec0;
    }
    
    .swagger-ui .btn.authorize {
      background-color: var(--accent-primary);
      color: white;
    }
    
    .swagger-ui .btn.authorize:hover {
      background-color: #5558e3;
    }
    
    .swagger-ui .dialog-ux .modal-ux-header {
      background-color: var(--bg-secondary);
      border-bottom: 1px solid #2d3748;
    }
    
    .swagger-ui .dialog-ux .modal-ux-header h3 {
      color: var(--text-primary);
    }
    
    .swagger-ui .dialog-ux .modal-ux {
      background-color: var(--bg-secondary);
      border: 1px solid #2d3748;
    }
    
    .swagger-ui .dialog-ux .modal-ux-content {
      background-color: var(--bg-primary);
    }
    
    .swagger-ui .dialog-ux .close-modal {
      color: #ffffff;
    }
    
    .swagger-ui .model-title {
      color: #ffffff;
    }
    
    .swagger-ui .property-row {
      color: #ffffff;
    }
    
    .swagger-ui .property-name {
      color: #ffffff;
    }
    
    .swagger-ui .parameter__name {
      color: #ffffff;
    }
    
    .swagger-ui .parameter__type {
      color: #ffffff;
    }
    
    .swagger-ui .parameter__in {
      color: #ffffff;
    }
    
    .swagger-ui .response-col {
      color: #ffffff;
    }
    
    .swagger-ui .markdown {
      color: #ffffff;
    }
    
    .swagger-ui .markdown p {
      color: #ffffff;
    }
    
    .swagger-ui .markdown h1,
    .swagger-ui .markdown h2,
    .swagger-ui .markdown h3,
    .swagger-ui .markdown h4,
    .swagger-ui .markdown h5,
    .swagger-ui .markdown h6 {
      color: #ffffff;
    }
    
    .swagger-ui .markdown code {
      background-color: rgba(0, 0, 0, 0.3);
      color: #ffffff;
      padding: 2px 6px;
      border-radius: 3px;
    }
    
    .swagger-ui .microlight {
      color: #ffffff;
    }
    
    .swagger-ui .try-out__btn {
      color: white;
    }
    
    .swagger-ui .execute__btn {
      color: white;
    }
    
    .swagger-ui .tab {
      color: #ffffff;
    }
    
    .swagger-ui .tab.active {
      border-bottom: 2px solid var(--accent-primary);
      color: #ffffff;
    }
    
    .swagger-ui .tab:hover {
      color: #ffffff;
    }
    
    .swagger-ui .tab-content {
      background-color: var(--bg-primary);
    }
    
    /* Asegurar que TODO el texto en Swagger sea blanco */
    .swagger-ui {
      color: #ffffff !important;
    }
    
    .swagger-ui * {
      color: #ffffff !important;
    }
    
    .swagger-ui .opblock * {
      color: #ffffff !important;
    }
    
    .swagger-ui .scheme-container * {
      color: #ffffff !important;
    }
    
    .swagger-ui .info * {
      color: #ffffff !important;
    }
    
    .swagger-ui .model * {
      color: #ffffff !important;
    }
    
    .swagger-ui table * {
      color: #ffffff !important;
    }
    
    /* Excepciones para botones y elementos especiales */
    .swagger-ui .btn,
    .swagger-ui .btn * {
      color: white !important;
    }
    
    .swagger-ui .try-out__btn,
    .swagger-ui .try-out__btn * {
      color: white !important;
    }
    
    .swagger-ui .execute__btn,
    .swagger-ui .execute__btn * {
      color: white !important;
    }
  `;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss }));

// Endpoint para servir el spec de Swagger
app.get('/swagger.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rutas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/tags', tagRoutes);
app.use('/products', productRoutes);
app.use('/p', selfHealingRouter); // Self-healing URL router      

/**
* @swagger
* /about:
*   get:
*     summary: Información del estudiante
*     description: Retorna información del desarrollador de la API (nombre completo, cédula y sección)
*     tags: [System]
*     responses:
*       200:
*         description: Información del estudiante
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 status:
*                   type: string
*                   example: success
*                 data:
*                   type: object
*                   properties:
*                     nombreCompleto:
*                       type: string
*                       example: Jesus Tadelmo
*                     cedula:
*                       type: string
*                       example: 31737569
*                     seccion:
*                       type: string
*                       example: SECCIÓN 2
*/
app.get('/about', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      nombreCompleto: 'Jesus Tadelmo',
      cedula: '31737569',
      seccion: 'SECCIÓN 2',
    },
  });
});

/**
* @swagger
* /ping:
*   get:
*     summary: Health check del servidor
*     description: Verifica que el servidor está funcionando correctamente. Retorna un estado 200 OK sin contenido.
*     tags: [System]
*     responses:
*       200:
*         description: Servidor funcionando correctamente
*/
app.get('/ping', (_req: Request, res: Response) => {
  res.status(200).send();
});

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API RESTful por Jesus Tadelmo - SECCIÓN 2',
    endpoints: {
      about: '/about',
      ping: '/ping',
      docs: '/api-docs',
      auth: {
        register: '/auth/register',
        login: '/auth/login',
      },
      users: '/users',
      products: '/products',
      categories: '/categories',
      tags: '/tags',
    },
  });
});

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ force: false }); // Cambia a true solo en desarrollo para resetear DB
    console.log('✅ Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
};

export {app,syncDatabase};
