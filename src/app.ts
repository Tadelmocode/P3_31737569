import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API RESTful - Proyecto 3',
      version: '1.0.0',
      description: 'API desarrollada con Node.js, Express y TypeScript',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./src/app.ts', './dist/app.js'], // Para desarrollo y producción
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /about:
 *   get:
 *     summary: Obtiene información del estudiante
 *     description: Retorna un objeto JSON con el nombre completo, cédula y sección del estudiante
 *     responses:
 *       200:
 *         description: Respuesta exitosa
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
 *                       example: Juan Pérez
 *                     cedula:
 *                       type: string
 *                       example: 12345678
 *                     seccion:
 *                       type: string
 *                       example: A1
 */
app.get('/about', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      nombreCompleto: 'Jesus Tadelmo',
      cedula: '31737569',
      seccion: 'SECCIÓN 02',
    },
  });
});

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Verifica que el servidor está funcionando
 *     description: Retorna un estado 200 OK sin contenido
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 */
app.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success'
  });
});

// Ruta raíz
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API RESTful - Proyecto 3',
    endpoints: {
      about: '/about',
      ping: '/ping',
      docs: '/api-docs',
    },
  });
});

export default app;