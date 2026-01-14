import sequelize from '../config/database.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Order, { OrderStatus } from '../models/Order.model.js';
import OrderItem from '../models/OrderItem.model.js';

describe('Order and OrderItem Models', () => {
  let testUser: User;
  let testCategory: Category;
  let testProduct: Product;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Limpiar tablas en orden correcto (por foreign keys)
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Crear datos de prueba
    testUser = await User.create({
      nombreCompleto: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    testCategory = await Category.create({
      name: 'Rock',
      description: 'Rock music vinyls',
    });

    testProduct = await Product.create({
      name: 'Abbey Road',
      description: 'The Beatles classic album',
      price: 29.99,
      stock: 10,
      userId: testUser.id,
      categoryId: testCategory.id,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Order Model', () => {
    it('should create an order with valid fields', async () => {
      const order = await Order.create({
        userId: testUser.id,
        status: OrderStatus.PENDING,
        totalAmount: 59.98,
      });

      expect(order.id).toBeDefined();
      expect(order.userId).toBe(testUser.id);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(parseFloat(order.totalAmount.toString())).toBe(59.98);
    });

    it('should default status to PENDING', async () => {
      const order = await Order.create({
        userId: testUser.id,
        totalAmount: 0,
      });

      expect(order.status).toBe(OrderStatus.PENDING);
    });

    it('should have belongsTo relationship with User', async () => {
      const order = await Order.create({
        userId: testUser.id,
        totalAmount: 29.99,
      });

      const orderWithUser = await Order.findByPk(order.id, {
        include: [User],
      });

      expect(orderWithUser?.user).toBeDefined();
      expect(orderWithUser?.user.id).toBe(testUser.id);
      expect(orderWithUser?.user.email).toBe('test@example.com');
    });

    it('should accept all valid status values', async () => {
      const statuses = [
        OrderStatus.PENDING,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELED,
        OrderStatus.PAYMENT_FAILED,
      ];

      for (const status of statuses) {
        const order = await Order.create({
          userId: testUser.id,
          status,
          totalAmount: 0,
        });
        expect(order.status).toBe(status);
      }
    });

    // Nota: SQLite no valida ENUMs estrictamente a nivel de base de datos
    // La validación se hace a nivel de aplicación/TypeScript
    it('should have status as one of the valid enum values', async () => {
      const order = await Order.create({
        userId: testUser.id,
        totalAmount: 0,
      });

      const validStatuses = Object.values(OrderStatus);
      expect(validStatuses).toContain(order.status);
    });
  });

  describe('OrderItem Model', () => {
    let testOrder: Order;

    beforeEach(async () => {
      testOrder = await Order.create({
        userId: testUser.id,
        totalAmount: 0,
      });
    });

    it('should create an order item with valid fields', async () => {
      const orderItem = await OrderItem.create({
        orderId: testOrder.id,
        productId: testProduct.id,
        quantity: 2,
        unitPrice: 29.99,
      });

      expect(orderItem.id).toBeDefined();
      expect(orderItem.orderId).toBe(testOrder.id);
      expect(orderItem.productId).toBe(testProduct.id);
      expect(orderItem.quantity).toBe(2);
      expect(parseFloat(orderItem.unitPrice.toString())).toBe(29.99);
    });

    it('should have belongsTo relationship with Order', async () => {
      const orderItem = await OrderItem.create({
        orderId: testOrder.id,
        productId: testProduct.id,
        quantity: 1,
        unitPrice: 29.99,
      });

      const itemWithOrder = await OrderItem.findByPk(orderItem.id, {
        include: [{ model: Order, as: 'order' }],
      });

      expect(itemWithOrder?.order).toBeDefined();
      expect(itemWithOrder?.order.id).toBe(testOrder.id);
    });

    it('should have belongsTo relationship with Product', async () => {
      const orderItem = await OrderItem.create({
        orderId: testOrder.id,
        productId: testProduct.id,
        quantity: 1,
        unitPrice: 29.99,
      });

      const itemWithProduct = await OrderItem.findByPk(orderItem.id, {
        include: [Product],
      });

      expect(itemWithProduct?.product).toBeDefined();
      expect(itemWithProduct?.product.id).toBe(testProduct.id);
      expect(itemWithProduct?.product.name).toBe('Abbey Road');
    });

    it('should reject quantity less than 1', async () => {
      await expect(
        OrderItem.create({
          orderId: testOrder.id,
          productId: testProduct.id,
          quantity: 0,
          unitPrice: 29.99,
        })
      ).rejects.toThrow();
    });

    it('should reject negative quantity', async () => {
      await expect(
        OrderItem.create({
          orderId: testOrder.id,
          productId: testProduct.id,
          quantity: -1,
          unitPrice: 29.99,
        })
      ).rejects.toThrow();
    });

    it('should preserve unitPrice (historical price)', async () => {
      // Crear item con precio actual
      const orderItem = await OrderItem.create({
        orderId: testOrder.id,
        productId: testProduct.id,
        quantity: 1,
        unitPrice: testProduct.price,
      });

      // Cambiar precio del producto
      await testProduct.update({ price: 39.99 });

      // Recargar el item
      await orderItem.reload();

      // El unitPrice debe mantener el precio histórico
      expect(parseFloat(orderItem.unitPrice.toString())).toBe(29.99);
    });
  });

  describe('Order-OrderItem Relationship', () => {
    it('should allow Order to have multiple OrderItems', async () => {
      const order = await Order.create({
        userId: testUser.id,
        totalAmount: 0,
      });

      // Crear segundo producto
      const product2 = await Product.create({
        name: 'Dark Side of the Moon',
        description: 'Pink Floyd classic',
        price: 34.99,
        stock: 5,
        userId: testUser.id,
        categoryId: testCategory.id,
      });

      // Crear múltiples items
      await OrderItem.create({
        orderId: order.id,
        productId: testProduct.id,
        quantity: 2,
        unitPrice: 29.99,
      });

      await OrderItem.create({
        orderId: order.id,
        productId: product2.id,
        quantity: 1,
        unitPrice: 34.99,
      });

      // Verificar relación hasMany
      const orderWithItems = await Order.findByPk(order.id, {
        include: [{ model: OrderItem, as: 'items' }],
      });

      expect(orderWithItems?.items).toBeDefined();
      expect(orderWithItems?.items.length).toBe(2);
    });

    it('should calculate total from items correctly', async () => {
      const order = await Order.create({
        userId: testUser.id,
        totalAmount: 0,
      });

      await OrderItem.create({
        orderId: order.id,
        productId: testProduct.id,
        quantity: 2,
        unitPrice: 29.99,
      });

      const orderWithItems = await Order.findByPk(order.id, {
        include: [{ model: OrderItem, as: 'items' }],
      });

      // Calcular total manualmente
      const calculatedTotal = orderWithItems?.items.reduce(
        (sum, item) => sum + item.quantity * parseFloat(item.unitPrice.toString()),
        0
      );

      expect(calculatedTotal).toBe(59.98);
    });
  });
});
