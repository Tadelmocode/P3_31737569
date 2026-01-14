# Implementation Plan: Transactional Core - Data Models

## Overview

Implementación de los modelos Order y OrderItem usando Sequelize ORM con TypeScript, siguiendo los patrones del proyecto existente.

## Tasks

- [x] 1. Crear modelo Order
  - Crear archivo `src/models/Order.model.ts`
  - Definir campos: id, userId, status (ENUM), totalAmount, paymentMethod, paymentReference
  - Establecer relación belongsTo con User
  - Establecer relación hasMany con OrderItem
  - Configurar timestamps automáticos
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Crear modelo OrderItem
  - Crear archivo `src/models/OrderItem.model.ts`
  - Definir campos: id, orderId, productId, quantity, unitPrice
  - Establecer relación belongsTo con Order
  - Establecer relación belongsTo con Product
  - Agregar validación de quantity > 0
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Registrar modelos en la configuración de base de datos
  - Actualizar `src/config/database.ts` para incluir Order y OrderItem
  - Verificar que las relaciones se establezcan correctamente
  - _Requirements: 1.2, 1.3, 2.2, 2.3_

- [x] 4. Crear tests para los modelos
  - Crear archivo `src/__tests__/orders.test.ts`
  - Test de creación de Order con campos válidos
  - Test de creación de OrderItem con campos válidos
  - Test de relaciones entre modelos
  - Test de validación de status ENUM
  - Test de validación de quantity > 0
  - _Requirements: 1.1-1.6, 2.1-2.6_

- [x] 5. Checkpoint - Verificar modelos
  - Ejecutar tests para confirmar que los modelos funcionan correctamente
  - Verificar que la base de datos crea las tablas con las relaciones correctas

- [x] 6. Implementar Payment Strategy Pattern
  - Crear interfaz `PaymentStrategy` en `src/strategies/PaymentStrategy.ts`
  - Crear implementación `FakePaymentStrategy` para la API externa
  - Crear implementación `MockPaymentStrategy` para tests
  - Configurar llamada a https://fakepayment.onrender.com/payments
  - _Requirements: 3.9, 3.10_

- [x] 7. Implementar OrderService (Facade Pattern)
  - Crear `src/services/OrderService.ts`
  - Implementar método `createOrder` con transacción atómica
  - Implementar verificación de stock
  - Implementar cálculo de totalAmount
  - Implementar integración con PaymentStrategy
  - Implementar actualización de stock post-pago
  - Implementar rollback en caso de fallo
  - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8, 3.11, 3.12_

- [x] 8. Implementar OrderRepository
  - Crear `src/repositories/OrderRepository.ts`
  - Implementar métodos: create, findById, findByUserId con paginación
  - _Requirements: 4.3, 4.4, 5.3_

- [x] 9. Implementar OrderController
  - Crear `src/controllers/orders.controller.ts`
  - Implementar POST /orders (checkout)
  - Implementar GET /orders (historial)
  - Implementar GET /orders/:id (detalle)
  - _Requirements: 3.1, 3.2, 3.3, 3.13, 4.1, 4.2, 4.5, 4.6, 5.1, 5.2, 5.4, 5.5, 5.6_

- [x] 10. Crear rutas de orders
  - Crear `src/routes/orders.ts`
  - Configurar middleware de autenticación JWT
  - Registrar rutas en app.ts
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 5.1, 5.2_

- [x] 11. Crear tests de integración para orders API
  - Tests para POST /orders (checkout exitoso y fallido)
  - Tests para GET /orders (paginación)
  - Tests para GET /orders/:id (autorización)
  - _Requirements: 3.1-3.13, 4.1-4.6, 5.1-5.6_

- [x] 12. Checkpoint - Verificar API de orders
  - Ejecutar todos los tests
  - Verificar integración con API de pagos externa

## Notes

- Los modelos siguen el patrón establecido en Product.model.ts
- Se usa sequelize-typescript con decoradores
- La base de datos SQLite se usa para desarrollo y tests (en memoria para tests)
- El patrón Strategy permite cambiar el proveedor de pagos sin modificar el código existente
- El patrón Facade (OrderService) centraliza la lógica de negocio


- [x] 13. Refactorizar Strategy Pattern con selección dinámica
  - Crear `CreditCardPaymentStrategy` como implementación concreta
  - Crear `PaymentStrategyFactory` para selección dinámica basada en paymentMethod
  - Actualizar `OrderService` para usar el Factory
  - Agregar `paymentMethod` al request de POST /orders
  - Documentar en Swagger el campo paymentMethod
  - _Requirements: Strategy Pattern con selección dinámica_

- [x] 14. Crear documentación de testing manual
  - Crear script de seed para datos de prueba (`seedTestData.ts`)
  - Crear guía paso a paso para testing en Swagger (`GUIA_TESTING_SWAGGER.md`)
  - Documentar escenarios de prueba (éxito, rechazo, error, stock insuficiente)
  - _Requirements: Documentación de testing_

## Arquitectura de Patrones Implementados

### Facade Pattern (Service Layer)
- `OrderService` actúa como fachada que orquesta:
  - Verificación de stock (repositories)
  - Cálculo de totales
  - Procesamiento de pagos (Strategy)
  - Creación de órdenes y items
  - Transacciones atómicas con rollback

### Strategy Pattern (Mecanismo de Pago)
- `PaymentStrategy` - Interfaz base
- `CreditCardPaymentStrategy` - Implementación concreta para FakePayment API
- `PaymentStrategyFactory` - Factory para selección dinámica
- `MockPaymentStrategy` - Para tests sin llamadas externas
