# Guía de Testing Manual en Swagger - API de Órdenes

Esta guía te ayudará a probar manualmente los endpoints de órdenes usando Swagger UI.

## Requisitos Previos

1. Ejecutar el seed script para crear datos de prueba:
   ```bash
   npm run build && node dist/scripts/seedTestData.js
   ```

2. Iniciar el servidor:
   ```bash
   npm start
   ```

3. Abrir Swagger UI en: `http://localhost:3000/api-docs`

---

## Paso 1: Autenticación

### 1.1 Obtener Token JWT

1. En Swagger, busca el endpoint `POST /auth/login`
2. Click en "Try it out"
3. Usa estas credenciales:
   ```json
   {
     "email": "test@vinylstore.com",
     "password": "Test123!"
   }
   ```
4. Click en "Execute"
5. Copia el `token` de la respuesta

### 1.2 Autorizar en Swagger

1. Click en el botón "Authorize" (🔓) en la parte superior
2. En el campo "Value", escribe: `Bearer <tu-token>`
   - Ejemplo: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click en "Authorize" y luego "Close"

---

## Paso 2: Crear Orden Exitosa

### 2.1 POST /orders - Pago Aprobado

1. Busca el endpoint `POST /orders`
2. Click en "Try it out"
3. Usa este body:
   ```json
   {
     "items": [
       { "productId": 101, "quantity": 1 },
       { "productId": 102, "quantity": 2 }
     ],
     "paymentMethod": "CreditCard",
     "paymentDetails": {
       "card-number": "4111111111111111",
       "cvv": "123",
       "expiration-month": "12",
       "expiration-year": "2025",
       "full-name": "APPROVED",
       "currency": "USD"
     }
   }
   ```
4. Click en "Execute"

**Resultado esperado:**
- Status: `201 Created`
- La orden se crea con status `COMPLETED`
- El stock de los productos se reduce

---

## Paso 3: Probar Escenarios de Error

### 3.1 Pago Rechazado (REJECTED)

Cambia `full-name` a `"REJECTED"`:
```json
{
  "items": [{ "productId": 101, "quantity": 1 }],
  "paymentMethod": "CreditCard",
  "paymentDetails": {
    "card-number": "4111111111111111",
    "cvv": "123",
    "expiration-month": "12",
    "expiration-year": "2025",
    "full-name": "REJECTED",
    "currency": "USD"
  }
}
```

**Resultado esperado:**
- Status: `402 Payment Required`
- El stock NO se modifica (rollback)

### 3.2 Fondos Insuficientes (INSUFFICIENT)

Cambia `full-name` a `"INSUFFICIENT"`:
```json
{
  "items": [{ "productId": 101, "quantity": 1 }],
  "paymentMethod": "CreditCard",
  "paymentDetails": {
    "card-number": "4111111111111111",
    "cvv": "123",
    "expiration-month": "12",
    "expiration-year": "2025",
    "full-name": "INSUFFICIENT",
    "currency": "USD"
  }
}
```

**Resultado esperado:**
- Status: `402 Payment Required`
- El stock NO se modifica (rollback)

### 3.3 Error de Pago (ERROR)

Cambia `full-name` a `"ERROR"`:
```json
{
  "items": [{ "productId": 101, "quantity": 1 }],
  "paymentMethod": "CreditCard",
  "paymentDetails": {
    "card-number": "4111111111111111",
    "cvv": "123",
    "expiration-month": "12",
    "expiration-year": "2025",
    "full-name": "ERROR",
    "currency": "USD"
  }
}
```

**Resultado esperado:**
- Status: `402 Payment Required`
- El stock NO se modifica (rollback)

### 3.4 Stock Insuficiente

Solicita más cantidad de la disponible:
```json
{
  "items": [{ "productId": 101, "quantity": 999 }],
  "paymentMethod": "CreditCard",
  "paymentDetails": {
    "card-number": "4111111111111111",
    "cvv": "123",
    "expiration-month": "12",
    "expiration-year": "2025",
    "full-name": "APPROVED",
    "currency": "USD"
  }
}
```

**Resultado esperado:**
- Status: `400 Bad Request`
- `errorCode`: `INSUFFICIENT_STOCK`

### 3.5 Producto No Existente

Usa un productId que no existe:
```json
{
  "items": [{ "productId": 9999, "quantity": 1 }],
  "paymentMethod": "CreditCard",
  "paymentDetails": {
    "card-number": "4111111111111111",
    "cvv": "123",
    "expiration-month": "12",
    "expiration-year": "2025",
    "full-name": "APPROVED",
    "currency": "USD"
  }
}
```

**Resultado esperado:**
- Status: `400 Bad Request`
- `errorCode`: `PRODUCT_NOT_FOUND`

---

## Paso 4: Consultar Órdenes

### 4.1 GET /orders - Historial de Órdenes

1. Busca el endpoint `GET /orders`
2. Click en "Try it out"
3. Opcionalmente configura paginación:
   - `page`: 1
   - `limit`: 10
4. Click en "Execute"

**Resultado esperado:**
- Status: `200 OK`
- Lista de órdenes del usuario con items y productos

### 4.2 GET /orders/{id} - Detalle de Orden

1. Busca el endpoint `GET /orders/{id}`
2. Click en "Try it out"
3. Ingresa el ID de una orden existente
4. Click en "Execute"

**Resultado esperado:**
- Status: `200 OK` (si es tu orden)
- Status: `403 Forbidden` (si es de otro usuario)
- Status: `404 Not Found` (si no existe)

---

## Paso 5: Verificar Sin Autenticación

### 5.1 Probar endpoints sin token

1. Click en "Authorize" y luego "Logout"
2. Intenta ejecutar cualquier endpoint de `/orders`

**Resultado esperado:**
- Status: `401 Unauthorized`

---

## Tarjetas de Prueba

| Número de Tarjeta | Tipo |
|-------------------|------|
| 4111111111111111 | Visa |
| 5555555555554444 | Mastercard |

## Control de Resultado del Pago

El campo `full-name` controla el resultado:

| Valor | Resultado |
|-------|-----------|
| `APPROVED` | Pago exitoso |
| `REJECTED` | Pago rechazado |
| `INSUFFICIENT` | Fondos insuficientes |
| `ERROR` | Error de procesamiento |

---

## Productos de Prueba Disponibles

| ID | Nombre | Precio | Stock |
|----|--------|--------|-------|
| 101 | Dark Side of the Moon | $45.99 | 15 |
| 102 | Abbey Road | $39.99 | 20 |
| 103 | Kind of Blue | $35.99 | 10 |
| 104 | Random Access Memories | $49.99 | 8 |
| 105 | The Four Seasons | $29.99 | 12 |

> **Nota:** Los IDs pueden variar si ya existían productos en la base de datos.
