/**
 * Payment Strategy Pattern Interface
 * Define el contrato para todos los procesadores de pago
 * Permite agregar nuevos métodos de pago sin modificar código existente (Open/Closed Principle)
 */

export interface PaymentDetails {
  'card-number': string;
  cvv: string;
  'expiration-month': string;
  'expiration-year': string;
  'full-name': string;
  currency: string;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  reference: string;
  paymentDetails: PaymentDetails;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  errorCode?: string;
}

/**
 * Strategy Interface for Payment Processing
 * Todas las implementaciones concretas deben implementar esta interfaz
 */
export interface PaymentStrategy {
  /**
   * Procesa un pago
   * @param request - Datos del pago a procesar
   * @returns Resultado del procesamiento
   */
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
  
  /**
   * Obtiene el estado de un pago
   * @param transactionId - ID de la transacción
   * @returns Estado del pago
   */
  getPaymentStatus(transactionId: string): Promise<PaymentResponse>;
  
  /**
   * Nombre del método de pago
   */
  getMethodName(): string;
}

/**
 * Tipos de métodos de pago soportados
 */
export enum PaymentMethod {
  CREDIT_CARD = 'CreditCard',
  PAYPAL = 'PayPal',
  BANK_TRANSFER = 'BankTransfer',
}
