/**
 * OrderService - Facade Pattern (Service Layer)
 * Orquesta las operaciones de órdenes, stock y pagos
 * Implementa transacciones atómicas para garantizar integridad de datos
 * 
 * Responsabilidades:
 * - Coordinar la transacción de checkout
 * - Interactuar con repositories (stock)
 * - Coordinar el proceso de pago usando el Strategy Pattern
 */

import sequelize from '../config/database.js';
import Order, { OrderStatus } from '../models/Order.model.js';
import OrderItem from '../models/OrderItem.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import { PaymentStrategy, PaymentDetails, PaymentMethod } from '../strategies/PaymentStrategy.js';
import { PaymentStrategyFactory } from '../strategies/PaymentStrategyFactory.js';
import { Transaction } from 'sequelize';

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderInput {
  userId: number;
  items: OrderItemInput[];
  paymentMethod: string; // Tipo de método de pago (CreditCard, PayPal, etc.)
  paymentDetails: PaymentDetails;
}

export interface OrderResult {
  success: boolean;
  order?: Order;
  message: string;
  errorCode?: string;
}

/**
 * OrderService - Facade que orquesta el proceso de checkout
 * Selecciona dinámicamente el PaymentStrategy basado en paymentMethod
 */
export class OrderService {
  /**
   * Crea una orden con pago transaccional (operación atómica)
   * 
   * Flujo:
   * 1. Selecciona el PaymentStrategy basado en paymentMethod
   * 2. Verifica stock de todos los productos
   * 3. Calcula el total de la orden
   * 4. Procesa el pago usando el strategy seleccionado
   * 5. Actualiza el stock (solo si el pago fue exitoso)
   * 6. Crea la orden y los items
   * 
   * Si cualquier paso falla, se hace rollback de toda la transacción
   */
  async createOrder(input: CreateOrderInput): Promise<OrderResult> {
    const transaction = await sequelize.transaction();

    try {
      // 1. Seleccionar el PaymentStrategy dinámicamente
      const paymentMethod = input.paymentMethod || PaymentMethod.CREDIT_CARD;
      let paymentStrategy: PaymentStrategy;
      
      try {
        paymentStrategy = PaymentStrategyFactory.createStrategy(paymentMethod);
      } catch (error) {
        await transaction.rollback();
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Invalid payment method',
          errorCode: 'INVALID_PAYMENT_METHOD',
        };
      }

      // 2. Verificar stock y obtener productos
      const stockValidation = await this.verifyStock(input.items, transaction);
      if (!stockValidation.success) {
        await transaction.rollback();
        return stockValidation;
      }

      const products = stockValidation.products!;

      // 3. Calcular total
      const totalAmount = this.calculateTotal(input.items, products);

      // 4. Procesar pago con el strategy seleccionado
      const paymentResult = await paymentStrategy.processPayment({
        amount: totalAmount,
        description: `Order for user ${input.userId}`,
        reference: `order_${Date.now()}`,
        paymentDetails: input.paymentDetails,
      });

      if (!paymentResult.success) {
        await transaction.rollback();
        return {
          success: false,
          message: paymentResult.message,
          errorCode: paymentResult.errorCode || 'PAYMENT_FAILED',
        };
      }

      // 5. Actualizar stock (solo si el pago fue exitoso)
      await this.updateStock(input.items, products, transaction);

      // 6. Crear orden con status COMPLETED
      const order = await Order.create(
        {
          userId: input.userId,
          status: OrderStatus.COMPLETED,
          totalAmount,
          paymentMethod: paymentMethod,
          paymentReference: paymentResult.transactionId,
        },
        { transaction }
      );

      // 7. Crear OrderItems
      await Promise.all(
        input.items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return OrderItem.create(
            {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.price,
            },
            { transaction }
          );
        })
      );

      // Commit de la transacción
      await transaction.commit();

      // Recargar orden con relaciones
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          { model: OrderItem, as: 'items', include: [Product] },
          { model: User, attributes: ['id', 'nombreCompleto', 'email'] },
        ],
      });

      return {
        success: true,
        order: completeOrder!,
        message: 'Order created successfully',
      };
    } catch (error) {
      await transaction.rollback();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Order creation failed: ${errorMessage}`,
        errorCode: 'TRANSACTION_ERROR',
      };
    }
  }

  /**
   * Verifica que todos los productos tengan stock suficiente
   * Usa lock para evitar race conditions
   */
  private async verifyStock(
    items: OrderItemInput[],
    transaction: Transaction
  ): Promise<{ success: boolean; products?: Product[]; message: string; errorCode?: string }> {
    const productIds = items.map((item) => item.productId);
    
    const products = await Product.findAll({
      where: { id: productIds },
      lock: transaction.LOCK.UPDATE, // Lock para evitar race conditions
      transaction,
    });

    // Verificar que todos los productos existen
    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return {
        success: false,
        message: `Products not found: ${missingIds.join(', ')}`,
        errorCode: 'PRODUCT_NOT_FOUND',
      };
    }

    // Verificar stock suficiente
    const insufficientStock: string[] = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        insufficientStock.push(
          `${product.name} (available: ${product.stock}, requested: ${item.quantity})`
        );
      }
    }

    if (insufficientStock.length > 0) {
      return {
        success: false,
        message: `Insufficient stock for: ${insufficientStock.join(', ')}`,
        errorCode: 'INSUFFICIENT_STOCK',
      };
    }

    return { success: true, products, message: 'Stock verified' };
  }

  /**
   * Calcula el total de la orden
   */
  private calculateTotal(items: OrderItemInput[], products: Product[]): number {
    return items.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return total + item.quantity * parseFloat(product.price.toString());
    }, 0);
  }

  /**
   * Actualiza el stock de los productos
   */
  private async updateStock(
    items: OrderItemInput[],
    products: Product[],
    transaction: Transaction
  ): Promise<void> {
    await Promise.all(
      items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return product.update(
          { stock: product.stock - item.quantity },
          { transaction }
        );
      })
    );
  }

  /**
   * Obtiene las órdenes de un usuario con paginación
   */
  async getUserOrders(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: Order[]; pagination: any }> {
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, attributes: ['id', 'name', 'slug', 'price'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Obtiene una orden por ID (verificando que pertenezca al usuario)
   */
  async getOrderById(
    orderId: number,
    userId: number
  ): Promise<{ success: boolean; order?: Order; message: string; errorCode?: string }> {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product }],
        },
        { model: User, attributes: ['id', 'nombreCompleto', 'email'] },
      ],
    });

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        errorCode: 'NOT_FOUND',
      };
    }

    if (order.userId !== userId) {
      return {
        success: false,
        message: 'You do not have permission to view this order',
        errorCode: 'FORBIDDEN',
      };
    }

    return {
      success: true,
      order,
      message: 'Order found',
    };
  }

  /**
   * Obtiene los métodos de pago disponibles
   */
  static getAvailablePaymentMethods(): string[] {
    return PaymentStrategyFactory.getAvailableMethods();
  }
}

export default OrderService;
