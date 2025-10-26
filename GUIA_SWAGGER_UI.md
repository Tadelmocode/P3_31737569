# 🎯 Guía Completa: Probar la API desde Swagger UI

## 🚀 Paso 1: Iniciar el Servidor

```bash
npm run dev
```

El servidor iniciará en: `http://localhost:3000`

## 📖 Paso 2: Abrir Swagger UI

Abre tu navegador en: **http://localhost:3000/api-docs**

Verás una interfaz interactiva con todos los endpoints de la API organizados por categorías.

---

## 🔐 Paso 3: Obtener tu Token JWT

### Opción A: Registrar un nuevo usuario

1. **Busca el endpoint** `POST /auth/register` en la sección **Auth**
2. **Click en el endpoint** para expandirlo
3. **Click en "Try it out"** (botón azul en la esquina superior derecha)
4. **Completa el Request body**:
   ```json
   {
     "nombreCompleto": "Juan Pérez",
     "email": "juan@example.com",
     "password": "password123"
   }
   ```
5. **Click en "Execute"** (botón azul grande)
6. **Verás la respuesta** abajo con código 201:
   ```json
   {
     "status": "success",
     "data": {
       "user": {
         "id": 1,
         "nombreCompleto": "Juan Pérez",
         "email": "juan@example.com"
       },
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqdWFuQGV4YW1wbGUuY29tIiwiaWF0IjoxNjk4MjcwMDAwLCJleHAiOjE2OTgzNTY0MDB9.abcdefghijklmnopqrstuvwxyz"
     }
   }
   ```

7. **COPIA EL TOKEN** (todo el texto después de `"token":`). Es muy largo, asegúrate de copiarlo completo.

### Opción B: Iniciar sesión con usuario existente

1. **Busca el endpoint** `POST /auth/login` en la sección **Auth**
2. **Click en "Try it out"**
3. **Completa el Request body**:
   ```json
   {
     "email": "juan@example.com",
     "password": "password123"
   }
   ```
4. **Click en "Execute"**
5. **Copia el token** de la respuesta

---

## 🔓 Paso 4: Autorizar tus Peticiones en Swagger

Este es el paso MÁS IMPORTANTE para probar los endpoints protegidos.

### 🎯 Cómo Autorizar:

1. **Busca el botón "Authorize"** 🔓 
   - Está ubicado en la parte superior derecha de la página
   - Es un ícono de candado verde
   - Dice "Authorize" al pasar el mouse

2. **Click en el botón "Authorize"**

3. **Se abrirá un modal** titulado "Available authorizations"

4. **En el campo "Value" de bearerAuth**:
   - Verás un input de texto
   - Dice "Value:" arriba
   - **PEGA TU TOKEN** aquí (sin agregar nada más, solo el token)
   - Ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqdWFuQGV4YW1wbGUuY29tIiwiaWF0IjoxNjk4MjcwMDAwLCJleHAiOjE2OTgzNTY0MDB9.abcdefghijklmnopqrstuvwxyz`

5. **Click en "Authorize"** (botón dentro del modal)

6. **Click en "Close"** para cerrar el modal

7. **¡Listo!** 🎉 Ahora el candado 🔓 cambiará a 🔒 (cerrado)

---

## ✅ Paso 5: Probar los Endpoints CRUD de Users

Ahora que estás autenticado, puedes probar TODOS los endpoints protegidos.

### 📋 **1. GET /users** - Listar todos los usuarios

1. Busca el endpoint `GET /users` en la sección **Users**
2. Click en el endpoint para expandirlo
3. Verás un **candado cerrado** 🔒 indicando que requiere autenticación
4. Click en **"Try it out"**
5. Click en **"Execute"**
6. **Resultado esperado** (código 200):
   ```json
   {
     "status": "success",
     "data": [
       {
         "id": 1,
         "nombreCompleto": "Juan Pérez",
         "email": "juan@example.com",
         "createdAt": "2024-10-25T20:00:00.000Z",
         "updatedAt": "2024-10-25T20:00:00.000Z"
       }
     ]
   }
   ```

**Nota**: Verás que NO aparece el campo `password`. ¡Esto es correcto por seguridad!

---

### 🔍 **2. GET /users/{id}** - Obtener un usuario específico

1. Busca el endpoint `GET /users/{id}` en la sección **Users**
2. Click en **"Try it out"**
3. En el campo **id**, ingresa: `1`
4. Click en **"Execute"**
5. **Resultado esperado** (código 200):
   ```json
   {
     "status": "success",
     "data": {
       "id": 1,
       "nombreCompleto": "Juan Pérez",
       "email": "juan@example.com",
       "createdAt": "2024-10-25T20:00:00.000Z",
       "updatedAt": "2024-10-25T20:00:00.000Z"
     }
   }
   ```

**Prueba también** con un ID que no existe (ej: `999`) para ver el error 404.

---

### ➕ **3. POST /users** - Crear un nuevo usuario

1. Busca el endpoint `POST /users` en la sección **Users**
2. Click en **"Try it out"**
3. Completa el **Request body**:
   ```json
   {
     "nombreCompleto": "María García",
     "email": "maria@example.com",
     "password": "password456"
   }
   ```
4. Click en **"Execute"**
5. **Resultado esperado** (código 201):
   ```json
   {
     "status": "success",
     "data": {
       "id": 2,
       "nombreCompleto": "María García",
       "email": "maria@example.com",
       "createdAt": "2024-10-25T20:05:00.000Z",
       "updatedAt": "2024-10-25T20:05:00.000Z",
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }
   ```

**Nota**: Este endpoint también devuelve un token para el nuevo usuario.

**Prueba también**: Intenta crear un usuario con el mismo email para ver el error 400.

---

### ✏️ **4. PUT /users/{id}** - Actualizar un usuario

1. Busca el endpoint `PUT /users/{id}` en la sección **Users**
2. Click en **"Try it out"**
3. En el campo **id**, ingresa: `2`
4. Completa el **Request body** (puedes actualizar solo algunos campos):
   ```json
   {
     "nombreCompleto": "María García López",
     "email": "maria.garcia@example.com"
   }
   ```
5. Click en **"Execute"**
6. **Resultado esperado** (código 200):
   ```json
   {
     "status": "success",
     "data": {
       "id": 2,
       "nombreCompleto": "María García López",
       "email": "maria.garcia@example.com",
       "createdAt": "2024-10-25T20:05:00.000Z",
       "updatedAt": "2024-10-25T20:10:00.000Z"
     }
   }
   ```

**Nota**: Observa que `updatedAt` cambia a la fecha/hora actual.

---

### 🗑️ **5. DELETE /users/{id}** - Eliminar un usuario

1. Busca el endpoint `DELETE /users/{id}` en la sección **Users**
2. Click en **"Try it out"**
3. En el campo **id**, ingresa: `2`
4. Click en **"Execute"**
5. **Resultado esperado** (código 200):
   ```json
   {
     "status": "success",
     "data": null
   }
   ```

**Verifica**: Ahora haz un `GET /users` y verás que el usuario con ID 2 ya no aparece.

---

## 🚨 Probando Escenarios de Error

### ❌ Sin Token (401)

1. Click en el botón **"Authorize"** 🔒
2. Click en **"Logout"** para desautorizarte
3. Intenta hacer un `GET /users`
4. **Resultado esperado** (código 401):
   ```json
   {
     "status": "fail",
     "data": {
       "message": "Token de acceso requerido"
     }
   }
   ```

### ❌ Token Inválido (403)

1. Click en **"Authorize"** 🔓
2. Ingresa un token falso: `token_invalido_123`
3. Click en **"Authorize"** y luego **"Close"**
4. Intenta hacer un `GET /users`
5. **Resultado esperado** (código 403):
   ```json
   {
     "status": "fail",
     "data": {
       "message": "Token inválido"
     }
   }
   ```

### ❌ Usuario No Encontrado (404)

1. Autentica correctamente
2. Haz un `GET /users/999` (ID que no existe)
3. **Resultado esperado** (código 404):
   ```json
   {
     "status": "fail",
     "data": {
       "message": "Usuario no encontrado"
     }
   }
   ```

### ❌ Email Duplicado (400)

1. Autentica correctamente
2. Intenta crear un usuario con un email que ya existe
3. `POST /users` con:
   ```json
   {
     "nombreCompleto": "Test",
     "email": "juan@example.com",
     "password": "test123"
   }
   ```
4. **Resultado esperado** (código 400):
   ```json
   {
     "status": "fail",
     "data": {
       "message": "El email ya está en uso"
     }
   }
   ```

---

## 🎯 Secuencia de Prueba Completa

### Flujo Recomendado:

```
1. POST /auth/register          → Crear primer usuario y obtener token
2. Click en Authorize 🔓        → Pegar token
3. GET /users                   → Ver lista con 1 usuario
4. GET /users/1                 → Ver detalles del usuario 1
5. POST /users                  → Crear segundo usuario (ID 2)
6. GET /users                   → Ver lista con 2 usuarios
7. PUT /users/2                 → Actualizar usuario 2
8. GET /users/2                 → Verificar actualización
9. DELETE /users/2              → Eliminar usuario 2
10. GET /users                  → Ver lista con 1 usuario
11. Click en Logout             → Desautorizarse
12. GET /users                  → Ver error 401
```

---

## 💡 Consejos Útiles

### ✅ Siempre que veas un candado 🔒:
- Significa que el endpoint requiere autenticación
- Debes hacer click en **Authorize** primero

### ✅ Si obtienes error 401 o 403:
- Verifica que hiciste click en **Authorize**
- Asegúrate de copiar el token completo
- El token expira después de 24 horas (configurable)

### ✅ Para refrescar tu token:
- Haz `POST /auth/login` nuevamente
- Copia el nuevo token
- Click en **Authorize** y pega el nuevo token

### ✅ Códigos de respuesta:
- **200** = OK (operación exitosa)
- **201** = Created (usuario creado)
- **400** = Bad Request (datos inválidos)
- **401** = Unauthorized (sin token)
- **403** = Forbidden (token inválido)
- **404** = Not Found (recurso no existe)
- **500** = Internal Server Error (error del servidor)

---

## 🎨 Características de Swagger UI

### Elementos Interactivos:

- **Try it out**: Habilita el formulario para editar
- **Execute**: Envía la petición al servidor
- **Clear**: Limpia los campos del formulario
- **Download**: Descarga la respuesta
- **Copy**: Copia la respuesta al portapapeles

### Información Visible:

- **Request URL**: La URL completa de la petición
- **Curl**: Comando curl equivalente (puedes copiarlo)
- **Request headers**: Headers enviados (incluye Authorization)
- **Response body**: El JSON de respuesta
- **Response headers**: Headers de la respuesta
- **Response code**: Código HTTP de la respuesta

---

## 🔄 Ventajas de Usar Swagger UI

✅ **No necesitas instalar nada** (funciona en el navegador)
✅ **Documentación siempre actualizada** (se genera del código)
✅ **Pruebas en tiempo real** sin herramientas externas
✅ **Interfaz visual intuitiva** fácil de usar
✅ **Autorización centralizada** (un solo click para todos los endpoints)
✅ **Validación automática** de campos requeridos
✅ **Ejemplos incluidos** en cada endpoint

---

## 📞 ¿Necesitas Ayuda?

Si encuentras algún problema:
1. Verifica que el servidor esté corriendo (`npm run dev`)
2. Asegúrate de estar en `http://localhost:3000/api-docs`
3. Revisa que copiaste el token completo
4. Intenta hacer logout y volver a autorizar

---

¡Ahora puedes probar toda la API desde tu navegador sin necesidad de Postman! 🎉
