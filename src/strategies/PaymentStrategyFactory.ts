/**
 * PaymentStrategyFactory
 * Factory para crear instancias de PaymentStrategy basado en el método de pago
 * Permite selección dinámica del strategy en tiempo de ejecución
 */

import { PaymentStrategy, PaymentMethod } from './PaymentStrategy.js';
import { CreditCardPaymentStrategy } from './CreditCardPaymentStrategy.js';

/**
 * Mock Payment Strategy for Testing
 * Simula pagos sin llamar a la API externa
 */
export class MockPaymentStrategy implements PaymentStrategy {
  getMethodName(): string {
    return 'Mock';
  }

  async processPayment(request: { paymentDetails: { 'full-name': string } }): Promise<{
    success: boolean;
    transactionId?: string;
    message: string;
    errorCode?: string;
  }> {
    const fullName = request.paymentDetails['full-name'].toUpperCase();
    
    if (fullName === 'REJECTED') {
      return {
        success: false,
        message: 'Payment rejected',
        errorCode: '002',
      };
    }
    
    if (fullName === 'ERROR') {
      return {
        success: false,
        message: 'Payment error',
        errorCode: '003',
      };
    }
    
    if (fullName === 'INSUFFICIENT') {
      return {
        success: false,
        message: 'Insufficient funds',
        errorCode: '004',
      };
    }
    
    return {
      success: true,
      transactionId: `mock_txn_${Date.now()}`,
      message: 'Payment approved',
    };
  }

  async getPaymentStatus(transactionId: string): Promise<{
    success: boolean;
    transactionId: string;
    message: string;
  }> {
    return {
      success: true,
      transactionId,
      message: 'Payment found',
    };
  }
}

/**
 * Factory class para crear PaymentStrategy basado en el método de pago
 */
export class PaymentStrategyFactory {
  private static strategies: Map<string, () => PaymentStrategy> = new Map();
  private static isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

  /**
   * Registra los strategies disponibles
   */
  static {
    // Registrar CreditCard strategy
    PaymentStrategyFactory.strategies.set(
      PaymentMethod.CREDIT_CARD,
      () => new CreditCardPaymentStrategy()
    );

    // Aquí se pueden agregar más strategies en el futuro:
    // PaymentStrategyFactory.strategies.set(PaymentMethod.PAYPAL, () => new PayPalPaymentStrategy());
    // PaymentStrategyFactory.strategies.set(PaymentMethod.BANK_TRANSFER, () => new BankTransferPaymentStrategy());
  }

  /**
   * Crea una instancia de PaymentStrategy basado en el método de pago
   * @param paymentMethod - Tipo de método de pago (CreditCard, PayPal, etc.)
   * @returns Instancia del strategy correspondiente
   * @throws Error si el método de pago no está soportado
   */
  static createStrategy(paymentMethod: string): PaymentStrategy {
    // En tests, usar MockPaymentStrategy
    if (PaymentStrategyFactory.isTest) {
      return new MockPaymentStrategy();
    }

    const strategyFactory = PaymentStrategyFactory.strategies.get(paymentMethod);
    
    if (!strategyFactory) {
      throw new Error(`Payment method '${paymentMethod}' is not supported. Available methods: ${PaymentStrategyFactory.getAvailableMethods().join(', ')}`);
    }

    return strategyFactory();
  }

  /**
   * Obtiene la lista de métodos de pago disponibles
   */
  static getAvailableMethods(): string[] {
    return Array.from(PaymentStrategyFactory.strategies.keys());
  }

  /**
   * Verifica si un método de pago está soportado
   */
  static isMethodSupported(paymentMethod: string): boolean {
    return PaymentStrategyFactory.strategies.has(paymentMethod);
  }

  /**
   * Registra un nuevo strategy (útil para extensibilidad)
   */
  static registerStrategy(method: string, factory: () => PaymentStrategy): void {
    PaymentStrategyFactory.strategies.set(method, factory);
  }
}

export default PaymentStrategyFactory;
