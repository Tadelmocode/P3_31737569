/**
 * Orders Controller
 * Maneja las peticiones HTTP para el recurso /orders
 */

import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService.js';

const orderService = new OrderService();

/**
 * POST /orders - Crear orden con pago transaccional
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'fail',
        data: { message: 'User not authenticated' },
      });
      return;
    }

    const { items, paymentMethod, paymentDetails } = req.body;

    // Validar items
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        status: 'fail',
        data: { message: 'Items array is required and must not be empty' },
      });
      return;
    }

    // Validar cada item
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        res.status(400).json({
          status: 'fail',
          data: { message: 'Each item must have productId and quantity (>= 1)' },
        });
        return;
      }
    }

    // Validar paymentMethod (opcional, default: CreditCard)
    const validPaymentMethod = paymentMethod || 'CreditCard';

    // Validar paymentDetails
    if (!paymentDetails) {
      res.status(400).json({
        status: 'fail',
        data: { message: 'Payment details are required' },
      });
      return;
    }

    const requiredPaymentFields = ['card-number', 'cvv', 'expiration-month', 'expiration-year', 'full-name', 'currency'];
    for (const field of requiredPaymentFields) {
      if (!paymentDetails[field]) {
        res.status(400).json({
          status: 'fail',
          data: { message: `Payment field '${field}' is required` },
        });
        return;
      }
    }

    // Crear orden usando el OrderService (Facade)
    const result = await orderService.createOrder({
      userId,
      items,
      paymentMethod: validPaymentMethod,
      paymentDetails,
    });

    if (!result.success) {
      // Determinar código de estado HTTP basado en el tipo de error
      let statusCode = 500;
      
      if (result.errorCode === 'INSUFFICIENT_STOCK' || result.errorCode === 'PRODUCT_NOT_FOUND') {
        statusCode = 400;
      } else if (result.errorCode === 'INVALID_PAYMENT_METHOD') {
        statusCode = 400;
      } else if (
        result.errorCode === 'PAYMENT_FAILED' || 
        result.errorCode === '002' || // REJECTED
        result.errorCode === '003' || // ERROR
        result.errorCode === '004'    // INSUFFICIENT funds
      ) {
        statusCode = 402; // Payment Required
      }

      res.status(statusCode).json({
        status: 'fail',
        data: { 
          message: result.message,
          errorCode: result.errorCode,
        },
      });
      return;
    }

    res.status(201).json({
      status: 'success',
      data: { order: result.order },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      status: 'error',
      message: `Internal server error: ${errorMessage}`,
    });
  }
};

/**
 * GET /orders - Obtener historial de órdenes del usuario
 */
export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'fail',
        data: { message: 'User not authenticated' },
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await orderService.getUserOrders(userId, page, limit);

    res.status(200).json({
      status: 'success',
      data: {
        orders: result.orders,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      status: 'error',
      message: `Internal server error: ${errorMessage}`,
    });
  }
};

/**
 * GET /orders/:id - Obtener detalle de una orden
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'fail',
        data: { message: 'User not authenticated' },
      });
      return;
    }

    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      res.status(400).json({
        status: 'fail',
        data: { message: 'Invalid order ID' },
      });
      return;
    }

    const result = await orderService.getOrderById(orderId, userId);

    if (!result.success) {
      const statusCode = result.errorCode === 'NOT_FOUND' ? 404 : 403;
      res.status(statusCode).json({
        status: 'fail',
        data: { message: result.message },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { order: result.order },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      status: 'error',
      message: `Internal server error: ${errorMessage}`,
    });
  }
};
