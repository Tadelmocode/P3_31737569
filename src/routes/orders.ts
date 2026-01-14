/**
 * Orders Routes
 * Todas las rutas requieren autenticación JWT
 */

import { Router } from 'express';
import { createOrder, getUserOrders, getOrderById } from '../controllers/orders.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas de orders requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear una nueva orden con pago (Checkout Transaccional)
 *     description: |
 *       Crea una orden procesando el pago de forma transaccional. El proceso incluye:
 *       
 *       **Flujo Transaccional (Facade Pattern):**
 *       1. Verificar stock de todos los productos
 *       2. Calcular total de la orden
 *       3. Procesar pago con FakePayment API (Strategy Pattern)
 *       4. Actualizar stock de productos
 *       5. Crear orden y items
 *       
 *       Si cualquier paso falla, se hace rollback de toda la transacción.
 *       
 *       **Tarjetas de prueba:**
 *       - Visa: 4111111111111111
 *       - Mastercard: 5555555555554444
 *       
 *       **Control de resultado (campo full-name):**
 *       - `APPROVED` - Pago exitoso
 *       - `REJECTED` - Pago rechazado
 *       - `ERROR` - Error en procesamiento
 *       - `INSUFFICIENT` - Fondos insuficientes
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *           example:
 *             items:
 *               - productId: 1
 *                 quantity: 2
 *             paymentMethod: CreditCard
 *             paymentDetails:
 *               card-number: "4111111111111111"
 *               cvv: "123"
 *               expiration-month: "12"
 *               expiration-year: "2025"
 *               full-name: "APPROVED"
 *               currency: "USD"
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       402:
 *         description: Pago rechazado o fallido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *             example:
 *               status: fail
 *               data:
 *                 message: "Pago rechazado: REJECTED"
 */
router.post('/', createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Obtener historial de órdenes del usuario
 *     description: Retorna el historial de órdenes del usuario autenticado con paginación. Solo muestra las órdenes propias del usuario.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de órdenes por página (default 10)
 *     responses:
 *       200:
 *         description: Lista paginada de órdenes
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.get('/', getUserOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obtener detalle de una orden
 *     description: Retorna el detalle completo de una orden específica incluyendo sus items. Solo el propietario de la orden puede verla.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Detalle de la orden con items
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       403:
 *         description: No autorizado para ver esta orden (no es el propietario)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.get('/:id', getOrderById);

export default router;
