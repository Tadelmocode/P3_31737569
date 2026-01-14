# Requirements Document

## Introduction

Este documento define los requisitos para implementar el núcleo transaccional de la API RESTful de una tienda de vinilos (Task 3). El sistema debe gestionar órdenes de compra, control de stock y procesamiento de pagos externos, garantizando la integridad de datos mediante operaciones atómicas. Se utilizarán los patrones Facade (Service Layer) para orquestar operaciones y Strategy para manejar múltiples proveedores de pago.

## Glossary

- **Order**: Entidad que representa una orden de compra con estado, usuario comprador y monto total
- **Order_Item**: Tabla intermedia para relación muchos-a-muchos entre Order y Product, almacena cantidad y precio histórico
- **Order_Status**: Estados posibles de una orden: PENDING, COMPLETED, CANCELED, PAYMENT_FAILED
- **User**: Usuario comprador que realiza la orden
- **Product**: Producto de vinilo que se puede ordenar
- **ORM**: Object-Relational Mapping (Sequelize con TypeScript)
- **Order_Service**: Capa de servicio (Facade) que orquesta operaciones de órdenes, stock y pagos
- **Payment_Strategy**: Interfaz que define el contrato para procesadores de pago
- **FakePayment_API**: API externa de pagos en https://fakepayment.onrender.com
- **Transaction**: Operación atómica de base de datos con rollback automático

## Requirements

### Requirement 1: Modelo Order

**User Story:** As a developer, I want an Order model that tracks purchase orders, so that the system can manage customer transactions.

#### Acceptance Criteria

1. THE Order model SHALL include fields: id (primary key, auto-increment), userId (foreign key), status, totalAmount, paymentMethod, paymentReference, createdAt, updatedAt
2. THE Order model SHALL have a belongsTo relationship with User (el comprador)
3. THE Order model SHALL have a hasMany relationship with Order_Item
4. THE Order status field SHALL be an ENUM with values: PENDING, COMPLETED, CANCELED, PAYMENT_FAILED
5. THE Order totalAmount field SHALL be DECIMAL(10,2) and calculated automatically from Order_Items
6. WHEN an Order is created, THE status SHALL default to PENDING

### Requirement 2: Modelo OrderItem

**User Story:** As a developer, I want an OrderItem model that serves as intermediate table, so that orders can contain multiple products with quantities and historical prices.

#### Acceptance Criteria

1. THE Order_Item model SHALL include fields: id (primary key), orderId (foreign key), productId (foreign key), quantity, unitPrice
2. THE Order_Item model SHALL have a belongsTo relationship with Order
3. THE Order_Item model SHALL have a belongsTo relationship with Product
4. THE Order_Item quantity field SHALL be INTEGER and greater than zero
5. THE Order_Item unitPrice field SHALL be DECIMAL(10,2) and store the product price at time of purchase (precio histórico)
6. WHEN an Order_Item is created, THE unitPrice SHALL be captured from the current Product price

### Requirement 3: POST /orders - Creación de Orden y Pago Transaccional

**User Story:** As an authenticated user, I want to create an order with payment processing, so that I can purchase vinyl products atomically.

#### Acceptance Criteria

1. THE API SHALL require a valid JWT token for POST /orders endpoint
2. WHEN an unauthenticated user calls POST /orders, THE API SHALL return 401 Unauthorized
3. THE request body SHALL include items array (productId, quantity) and paymentDetails (card-number, cvv, expiration-month, expiration-year, full-name, currency)
4. THE Order_Service SHALL execute the entire checkout within a database transaction (atomic operation)
5. WHEN any step fails, THE Transaction SHALL rollback all changes completely
6. THE Order_Service SHALL verify stock availability for all products before processing payment
7. IF any product has insufficient stock, THEN THE Order_Service SHALL reject the order with error details and rollback
8. THE Order_Service SHALL calculate totalAmount as sum of (quantity × product.price) for all items
9. THE Order_Service SHALL call FakePayment_API at https://fakepayment.onrender.com/payments with payment details
10. IF payment fails (REJECTED, ERROR, INSUFFICIENT), THEN THE Order_Service SHALL rollback and return payment error
11. WHEN payment succeeds, THE Order_Service SHALL decrement stock for all ordered products
12. WHEN payment succeeds, THE Order_Service SHALL create Order with status COMPLETED and OrderItems
13. THE API SHALL respond with created Order object in JSend format on success

### Requirement 4: GET /orders - Historial del Usuario

**User Story:** As an authenticated user, I want to view my order history, so that I can track my purchases.

#### Acceptance Criteria

1. THE API SHALL require a valid JWT token for GET /orders endpoint
2. WHEN an unauthenticated user calls GET /orders, THE API SHALL return 401 Unauthorized
3. THE API SHALL return only orders belonging to the authenticated user
4. THE API SHALL support pagination with page and limit query parameters
5. THE response SHALL include Order data with associated OrderItems and Product references
6. THE API SHALL respond in JSend format with pagination metadata

### Requirement 5: GET /orders/:id - Detalle de Orden

**User Story:** As an authenticated user, I want to view details of a specific order, so that I can see what I purchased.

#### Acceptance Criteria

1. THE API SHALL require a valid JWT token for GET /orders/:id endpoint
2. WHEN an unauthenticated user calls GET /orders/:id, THE API SHALL return 401 Unauthorized
3. THE API SHALL return order details only if the order belongs to the authenticated user
4. IF the order does not belong to the user, THEN THE API SHALL return 403 Forbidden
5. IF the order does not exist, THEN THE API SHALL return 404 Not Found
6. THE response SHALL include Order data with associated OrderItems and Product details
