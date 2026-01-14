/**
 * OrderRepository
 * Abstrae la lógica de acceso a datos para órdenes
 */

import Order from '../models/Order.model.js';
import OrderItem from '../models/OrderItem.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface OrderListResult {
  orders: Order[];
  pagination: PaginationInfo;
}

export class OrderRepository {
  /**
   * Encuentra todas las órdenes de un usuario con paginación
   */
  async findByUserId(userId: number, page: number = 1, limit: number = 10): Promise<OrderListResult> {
    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'slug', 'price', 'artist', 'format'],
            },
          ],
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
   * Encuentra una orden por ID con todas sus relaciones
   */
  async findById(id: number): Promise<Order | null> {
    return await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product }],
        },
        {
          model: User,
          attributes: ['id', 'nombreCompleto', 'email'],
        },
      ],
    });
  }

  /**
   * Verifica si una orden pertenece a un usuario
   */
  async belongsToUser(orderId: number, userId: number): Promise<boolean> {
    const order = await Order.findByPk(orderId, {
      attributes: ['userId'],
    });
    return order?.userId === userId;
  }

  /**
   * Cuenta órdenes por usuario
   */
  async countByUser(userId: number): Promise<number> {
    return await Order.count({ where: { userId } });
  }
}

export default OrderRepository;
