/**
 * CreditCardPaymentStrategy - Concrete Strategy Implementation
 * Implementa el procesamiento de pagos con tarjeta de crédito
 * usando la API externa FakePayment (https://fakepayment.onrender.com)
 */

import { PaymentStrategy, PaymentRequest, PaymentResponse, PaymentMethod } from './PaymentStrategy.js';

const FAKE_PAYMENT_API_URL = 'https://fakepayment.onrender.com';

export class CreditCardPaymentStrategy implements PaymentStrategy {
  private apiKey: string | null = null;

  constructor() {}

  getMethodName(): string {
    return PaymentMethod.CREDIT_CARD;
  }

  /**
   * Obtiene un API key de la API de FakePayment
   */
  private async getApiKey(): Promise<string> {
    if (this.apiKey) {
      return this.apiKey;
    }

    try {
      const response = await fetch(`${FAKE_PAYMENT_API_URL}/payments/api-key`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get API key: ${response.status}`);
      }

      const data = await response.json();
      this.apiKey = data.apiKey;
      console.log('Obtained FakePayment API key');
      return this.apiKey!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to obtain API key: ${errorMessage}`);
    }
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Obtener API key
      const apiKey = await this.getApiKey();

      // Construir el body según la documentación de FakePayment API
      const paymentBody = {
        amount: request.amount.toString(),
        'card-number': request.paymentDetails['card-number'],
        cvv: request.paymentDetails.cvv,
        'expiration-month': request.paymentDetails['expiration-month'],
        'expiration-year': request.paymentDetails['expiration-year'],
        'full-name': request.paymentDetails['full-name'],
        currency: request.paymentDetails.currency,
        description: request.description || 'Payment',
        reference: request.reference || `ref_${Date.now()}`,
      };

      console.log('Sending payment request to FakePayment API:', JSON.stringify(paymentBody, null, 2));

      const response = await fetch(`${FAKE_PAYMENT_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(paymentBody),
      });

      // Primero verificar si la respuesta es JSON válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('FakePayment API returned non-JSON response:', textResponse);
        return {
          success: false,
          message: `Payment API returned invalid response: ${textResponse.substring(0, 100)}`,
          errorCode: 'INVALID_RESPONSE',
        };
      }

      const data = await response.json();
      console.log('FakePayment API response:', JSON.stringify(data, null, 2));

      // La API de FakePayment devuelve diferentes respuestas según el full-name:
      // APPROVED o cualquier nombre: pago aprobado (code: "001" o sin code)
      // REJECTED: pago rechazado (code: "002")
      // ERROR: error de pago (code: "003")
      // INSUFFICIENT: fondos insuficientes (code: "004")
      
      // Verificar si el pago fue exitoso
      // La API devuelve success: true cuando el pago es aprobado
      if (data.success === true || (response.ok && !data.error && data.code !== '002' && data.code !== '003' && data.code !== '004')) {
        return {
          success: true,
          transactionId: data.transaction_id || data.transactionId || data.id || `txn_${Date.now()}`,
          message: data.message || 'Payment processed successfully',
        };
      }

      // Pago fallido - extraer código de error
      const errorCode = data.code || data.error_code || data.errorCode || 'PAYMENT_FAILED';
      return {
        success: false,
        message: data.message || data.error || 'Payment failed',
        errorCode: errorCode,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('CreditCardPaymentStrategy error:', errorMessage);
      return {
        success: false,
        message: `Credit card payment processing error: ${errorMessage}`,
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      const apiKey = await this.getApiKey();

      const response = await fetch(`${FAKE_PAYMENT_API_URL}/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {
          success: false,
          message: 'Invalid response from payment API',
          errorCode: 'INVALID_RESPONSE',
        };
      }

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          transactionId: data.transaction_id || transactionId,
          message: data.status || 'Payment found',
        };
      }

      return {
        success: false,
        message: data.message || 'Transaction not found',
        errorCode: data.error_code || 'NOT_FOUND',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Error fetching payment status: ${errorMessage}`,
        errorCode: 'NETWORK_ERROR',
      };
    }
  }
}

export default CreditCardPaymentStrategy;
