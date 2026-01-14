import request from 'supertest';
import { app } from '../app.js';
import sequelize from '../config/database.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Order from '../models/Order.model.js';
import OrderItem from '../models/OrderItem.model.js';

describe('Orders API', () => {
  let authToken: string;
  let userId: number;
  let categoryId: number;
  let productId: number;
  let productId2: number;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Crear usuario y obtener token
    const userResponse = await request(app)
      .post('/auth/register')
      .send({
        nombreCompleto: 'Test User',
        email: 'ordertest@example.com',
        password: 'password123',
      });

    authToken = userResponse.body.data.token;
    userId = userResponse.body.data.user.id;

    // Crear categoría
    const categoryResponse = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Rock',
        description: 'Rock music',
      });
    categoryId = categoryResponse.body.data.category.id;

    // Crear productos con stock
    const product1Response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Abbey Road',
        price: 29.99,
        stock: 10,
        categoryId,
        artist: 'The Beatles',
      });
    productId = product1Response.body.data.product.id;

    const product2Response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Dark Side of the Moon',
        price: 34.99,
        stock: 5,
        categoryId,
        artist: 'Pink Floyd',
      });
    productId2 = product2Response.body.data.product.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ============================================
  // PRUEBAS DE ACCESO (401 Unauthorized)
  // ============================================
  describe('Access Control Tests (401 Unauthorized)', () => {
    it('POST /orders should deny access without authentication', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          items: [{ productId, quantity: 1 }],
          paymentMethod: 'CreditCard',
          paymentDetails: {
            'card-number': '4111111111111111',
            cvv: '123',
            'expiration-month': '12',
            'expiration-year': '2025',
            'full-name': 'APPROVED',
            currency: 'USD',
          },
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('GET /orders should deny access without authentication', async () => {
      const response = await request(app).get('/orders');
      expect(response.status).toBe(401);
    });

    it('GET /orders/:id should deny access without authentication', async () => {
      const response = await request(app).get('/orders/1');
      expect(response.status).toBe(401);
    });
  });

  // ============================================
  // PRUEBAS DE VALIDACIÓN DE REQUEST
  // ============================================
  describe('Request Validation Tests', () => {
    it('should fail without items array', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentMethod: 'CreditCard',
          paymentDetails: {
            'card-number': '4111111111111111',
            cvv: '123',
            'expiration-month': '12',
            'expiration-year': '2025',
            'full-name': 'APPROVED',
            currency: 'USD',
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.data.message).toContain('Items');
    });

    it('should fail without payment details', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId, quantity: 1 }],
          paymentMethod: 'CreditCard',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should fail with non-existent product', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: 9999, quantity: 1 }],
          paymentMethod: 'CreditCard',
          paymentDetails: {
            'card-number': '4111111111111111',
            cvv: '123',
            'expiration-month': '12',
            'expiration-year': '2025',
            'full-name': 'APPROVED',
            currency: 'USD',
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.data.errorCode).toBe('PRODUCT_NOT_FOUND');
    });
  });

  // ============================================
  // PRUEBA DE FALLO POR STOCK INSUFICIENTE (con Rollback)
  // ============================================
  describe('Insufficient Stock Tests (Rollback Verification)', () => {
    it('should fail with insufficient stock and NOT modify any product stock', async () => {
      // Obtener stock inicial de ambos productos
      const initialProduct1 = await Product.findByPk(productId);
      const initialProduct2 = await Product.findByPk(productId2);
      const initialStock1 = initialProduct1!.stock;
      const initialStock2 = initialProduct2!.stock;
      
      // Contar órdenes antes
      const orderCountBefore = await Order.count();

      // Intentar crear orden con stock insuficiente para el segundo producto
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            { productId, quantity: 1 },           // Este tiene stock suficiente
            { productId: productId2, quantity: 100 }, // Este NO tiene stock suficiente
          ],
          paymentMethod: 'CreditCard',
          paymentDetails: {
            'card-number': '4111111111111111',
            cvv: '123',
            'expiration-month': '12',
            'expiration-year': '2025',
            'full-name': 'APPROVED',
            currency: 'USD',
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.data.errorCode).toBe('INSUFFICIENT_STOCK');

      // VERIFICAR ROLLBACK: El stock de AMBOS productos NO debe haber cambiado
      const afterProduct1 = await Product.findByPk(productId);
      const afterProduct2 = await Product.findByPk(productId2);
      
      expect(afterProduct1!.stock).toBe(initialStock1);
      expect(afterProduct2!.stock).toBe(initialStock2);

      // VERIFICAR ROLLBACK: No se creó ninguna orden
      const orderCountAfter = await Order.count();
      expect(orderCountAfter).toBe(orderCountBefore);
    });
  });

  // ============================================
  // PRUEBA DE FALLO POR PAGO RECHAZADO (con Rollback)
  // ============================================
  describe('Payment Rejected Tests (Rollback Verification)', () => {
    it('should fail when payment is REJECTED and rollback completely', async () => {
      // Obtener stock inicial
      const initialProduct = await Product.findByPk(productId);
      const initialStock = initialProduct!.stock;
      
      // Contar órdenes antes
      const orderCountBefore = await Order.count();

      // Crear orden con full-name = "REJECTED" (simula pago rechazado)
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId, quantity: 1 }],
          paymentMethod: 'CreditCard',
          paymentDetails: {
            'card-number': '4111111111111111',
            cvv: '123',
            'expiration-month': '12',
            'expiration-year': '2025',
            'full-name': 'REJECTED', // Simula pago rechazado
            currency: 'USD',
          },
        });

      // Debe fallar con error de pago
      expect(response.status).not.toBe(201);
      expect(response.body.status).toBe('fail');

      // VERIFICAR ROLLBACK: El stock NO debe haber cambiado
      const afterProduct = await Product.findByPk(productId);
      expect(afterProduct!.stock).toBe(initialStock);

      // VERIFICAR ROLLBACK: No se creó ninguna orden
      const orderCountAfter = await Order.count();
      expect(orderCountAfter).toBe(orderCountBefore);
    });

    it('should fail when payment has INSUFFICIENT funds and rollback completely', async () => {
      // Obtener stock inicial
      const initialProduct = await Product.findByPk(productId);
      const initialStock = initialProduct!.stock;
      
      // Contar órdenes antes
      const orderCountBefore = await Order.count();

      // Crear orden con full-name = "INSUFFICIENT" (simula fondos insuficientes)
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId, quantity: 1 }],
          paymentMethod: 'CreditCard',
          paymentDetails: {
            'card-number': '4111111111111111',
            cvv: '123',
            'expiration-month': '12',
            'expiration-year': '2025',
            'full-name': 'INSUFFICIENT', // Simula fondos insuficientes
            currency: 'USD',
          },
        });

      // Debe fallar
      expect(response.status).not.toBe(201);
      expect(response.body.status).toBe('fail');

      // VERIFICAR ROLLBACK: El stock NO debe haber cambiado
      const afterProduct = await Product.findByPk(productId);
      expect(afterProduct!.stock).toBe(initialStock);

      // VERIFICAR ROLLBACK: No se creó ninguna orden
      const orderCountAfter = await Order.count();
      expect(orderCountAfter).toBe(orderCountBefore);
    });

    it('should fail when payment has ERROR and rollback completely', async () => {
      // Obtener stock inicial
      const initialProduct = await Product.findByPk(productId);
      const initialStock = initialProduct!.stock;
      
      // Contar órdenes antes
      const orderCountBefore = await Order.count();

      // Crear orden con full-name = "ERROR" (simula error de pago)
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId, quantity: 1 }],
          paymentMethod: 'CreditCard',
          paymentDetails: {
            'card-number': '4111111111111111',
            cvv: '123',
            'expiration-month': '12',
            'expiration-year': '2025',
            'full-name': 'ERROR', // Simula error de pago
            currency: 'USD',
          },
        });

      // Debe fallar
      expect(response.status).not.toBe(201);
      expect(response.body.status).toBe('fail');

      // VERIFICAR ROLLBACK: El stock NO debe haber cambiado
      const afterProduct = await Product.findByPk(productId);
      expect(afterProduct!.stock).toBe(initialStock);

      // VERIFICAR ROLLBACK: No se creó ninguna orden
      const orderCountAfter = await Order.count();
      expect(orderCountAfter).toBe(orderCountBefore);
    });
  });

  // ============================================
  // PRUEBA DE ÉXITO DE TRANSACCIÓN COMPLETA
  // ============================================
  describe('Successful Transaction Tests', () => {
    it('should create order, register items, and reduce stock when payment succeeds', async () => {
      // Obtener stock inicial de ambos productos
      const initialProduct1 = await Product.findByPk(productId);
      const initialProduct2 = await Product.findByPk(productId2);
      const initialStock1 = initialProduct1!.stock;
      const initialStock2 = initialProduct2!.stock;
      
      // Contar órdenes antes
      const orderCountBefore = await Order.count();

      // Crear orden exitosa
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            { productId, quantity: 2 },
            { productId: productId2, quantity: 1 },
          ],
          paymentMethod: 'CreditCard',
          paymentDetails: {
            'card-number': '4111111111111111',
            cvv: '123',
            'expiration-month': '12',
            'expiration-year': '2025',
            'full-name': 'APPROVED', // Pago aprobado
            currency: 'USD',
          },
        });

      // Verificar respuesta exitosa
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      
      // Verificar que la orden se creó correctamente
      const order = response.body.data.order;
      expect(order).toBeDefined();
      expect(order.status).toBe('COMPLETED');
      expect(order.paymentMethod).toBe('CreditCard');
      expect(order.paymentReference).toBeDefined();
      
      // Verificar que los items se registraron
      expect(order.items).toHaveLength(2);
      expect(order.items[0].quantity).toBeDefined();
      expect(order.items[0].unitPrice).toBeDefined();
      
      // Verificar totalAmount calculado correctamente
      const expectedTotal = 29.99 * 2 + 34.99 * 1;
      expect(parseFloat(order.totalAmount)).toBeCloseTo(expectedTotal, 2);

      // VERIFICAR: El stock se redujo correctamente
      const afterProduct1 = await Product.findByPk(productId);
      const afterProduct2 = await Product.findByPk(productId2);
      
      expect(afterProduct1!.stock).toBe(initialStock1 - 2);
      expect(afterProduct2!.stock).toBe(initialStock2 - 1);

      // VERIFICAR: Se creó exactamente una orden nueva
      const orderCountAfter = await Order.count();
      expect(orderCountAfter).toBe(orderCountBefore + 1);

      // VERIFICAR: Los OrderItems se crearon en la base de datos
      const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
      expect(orderItems).toHaveLength(2);
    });
  });

  // ============================================
  // PRUEBAS DE HISTORIAL Y DETALLE
  // ============================================
  describe('Order History and Detail Tests', () => {
    it('GET /orders should return user orders with pagination', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.orders).toBeDefined();
      expect(Array.isArray(response.body.data.orders)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.currentPage).toBe(1);
    });

    it('GET /orders should support pagination parameters', async () => {
      const response = await request(app)
        .get('/orders?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.itemsPerPage).toBe(5);
    });

    it('GET /orders should include order items with product info', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      if (response.body.data.orders.length > 0) {
        const order = response.body.data.orders[0];
        expect(order.items).toBeDefined();
        if (order.items.length > 0) {
          expect(order.items[0].product).toBeDefined();
        }
      }
    });
  });

  // ============================================
  // PRUEBAS DE AUTORIZACIÓN DE ÓRDENES
  // ============================================
  describe('Order Authorization Tests', () => {
    let orderId: number;

    beforeAll(async () => {
      // Obtener un orderId existente
      const ordersResponse = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`);
      
      if (ordersResponse.body.data.orders.length > 0) {
        orderId = ordersResponse.body.data.orders[0].id;
      }
    });

    it('GET /orders/:id should return order details for owner', async () => {
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.order).toBeDefined();
      expect(response.body.data.order.id).toBe(orderId);
      expect(response.body.data.order.items).toBeDefined();
    });

    it('GET /orders/:id should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/orders/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('GET /orders/:id should return 403 for order belonging to another user', async () => {
      // Crear otro usuario
      const otherUserResponse = await request(app)
        .post('/auth/register')
        .send({
          nombreCompleto: 'Other User',
          email: 'other@example.com',
          password: 'password123',
        });
      const otherToken = otherUserResponse.body.data.token;

      // Intentar acceder a la orden del primer usuario
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });
});
