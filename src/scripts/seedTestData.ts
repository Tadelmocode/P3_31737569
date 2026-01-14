/**
 * Script para crear datos de prueba para testing manual en Swagger
 * Ejecutar con: npm run build && node dist/scripts/seedTestData.js
 */

import sequelize from '../config/database.js';

// Importar modelos después de que sequelize esté configurado
const User = sequelize.models.User;
const Category = sequelize.models.Category;
const Tag = sequelize.models.Tag;
const Product = sequelize.models.Product;

async function seedTestData() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    
    console.log('🔄 Sincronizando modelos...');
    await sequelize.sync({ force: false }); // No borrar datos existentes

    // ============================================
    // CREAR USUARIO DE PRUEBA
    // ============================================
    console.log('\n📝 Creando usuario de prueba...');
    
    const existingUser = await User.findOne({ where: { email: 'test@vinylstore.com' } });
    
    let testUser: any;
    if (existingUser) {
      console.log('   ⚠️  Usuario ya existe, usando el existente');
      testUser = existingUser;
    } else {
      testUser = await User.create({
        nombreCompleto: 'Usuario de Prueba',
        email: 'test@vinylstore.com',
        password: 'Test123!',
      });
      console.log('   ✅ Usuario creado');
    }

    // ============================================
    // CREAR CATEGORÍAS
    // ============================================
    console.log('\n📝 Creando categorías...');
    
    const categories = [
      { name: 'Rock', description: 'Música rock de todas las épocas' },
      { name: 'Jazz', description: 'Jazz clásico y contemporáneo' },
      { name: 'Electronic', description: 'Música electrónica y EDM' },
      { name: 'Classical', description: 'Música clásica y orquestal' },
    ];

    const createdCategories: any[] = [];
    for (const cat of categories) {
      const existing = await Category.findOne({ where: { name: cat.name } });
      if (!existing) {
        const created = await Category.create(cat);
        createdCategories.push(created);
        console.log(`   ✅ Categoría "${cat.name}" creada`);
      } else {
        createdCategories.push(existing);
        console.log(`   ⚠️  Categoría "${cat.name}" ya existe`);
      }
    }

    // ============================================
    // CREAR TAGS
    // ============================================
    console.log('\n📝 Creando tags...');
    
    const tags = [
      { name: 'Vintage' },
      { name: 'Limited Edition' },
      { name: 'Remastered' },
      { name: 'Import' },
    ];

    const createdTags: any[] = [];
    for (const tag of tags) {
      const existing = await Tag.findOne({ where: { name: tag.name } });
      if (!existing) {
        const created = await Tag.create(tag);
        createdTags.push(created);
        console.log(`   ✅ Tag "${tag.name}" creado`);
      } else {
        createdTags.push(existing);
        console.log(`   ⚠️  Tag "${tag.name}" ya existe`);
      }
    }

    // ============================================
    // CREAR PRODUCTOS
    // ============================================
    console.log('\n📝 Creando productos...');
    
    const products = [
      {
        name: 'Dark Side of the Moon',
        description: 'Álbum icónico de Pink Floyd de 1973',
        price: 45.99,
        stock: 15,
        artist: 'Pink Floyd',
        label: 'Harvest Records',
        releaseYear: 1973,
        format: 'LP',
        condition: 'Near Mint',
        userId: testUser.id,
        categoryId: createdCategories[0].id, // Rock
      },
      {
        name: 'Abbey Road',
        description: 'El último álbum grabado por The Beatles',
        price: 39.99,
        stock: 20,
        artist: 'The Beatles',
        label: 'Apple Records',
        releaseYear: 1969,
        format: 'LP',
        condition: 'Mint',
        userId: testUser.id,
        categoryId: createdCategories[0].id, // Rock
      },
      {
        name: 'Kind of Blue',
        description: 'El álbum de jazz más vendido de todos los tiempos',
        price: 35.99,
        stock: 10,
        artist: 'Miles Davis',
        label: 'Columbia Records',
        releaseYear: 1959,
        format: 'LP',
        condition: 'Very Good Plus',
        userId: testUser.id,
        categoryId: createdCategories[1].id, // Jazz
      },
      {
        name: 'Random Access Memories',
        description: 'Álbum ganador del Grammy de Daft Punk',
        price: 49.99,
        stock: 8,
        artist: 'Daft Punk',
        label: 'Columbia Records',
        releaseYear: 2013,
        format: 'LP',
        condition: 'Mint',
        userId: testUser.id,
        categoryId: createdCategories[2].id, // Electronic
      },
      {
        name: 'The Four Seasons',
        description: 'Obra maestra de Vivaldi',
        price: 29.99,
        stock: 12,
        artist: 'Antonio Vivaldi',
        label: 'Deutsche Grammophon',
        releaseYear: 1725,
        format: 'LP',
        condition: 'Near Mint',
        userId: testUser.id,
        categoryId: createdCategories[3].id, // Classical
      },
    ];

    const createdProducts: any[] = [];
    for (const prod of products) {
      const existing = await Product.findOne({ where: { name: prod.name } });
      if (!existing) {
        const created = await Product.create(prod as any);
        createdProducts.push(created);
        console.log(`   ✅ Producto "${prod.name}" creado (Stock: ${prod.stock})`);
      } else {
        createdProducts.push(existing);
        console.log(`   ⚠️  Producto "${prod.name}" ya existe`);
      }
    }

    // ============================================
    // RESUMEN
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('📋 DATOS DE PRUEBA CREADOS EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n🔐 CREDENCIALES DE USUARIO DE PRUEBA:');
    console.log('   Email:    test@vinylstore.com');
    console.log('   Password: Test123!');
    console.log('\n📦 PRODUCTOS DISPONIBLES PARA ÓRDENES:');
    
    for (const prod of createdProducts) {
      console.log(`   ID: ${prod.id} | ${prod.name} | $${prod.price} | Stock: ${prod.stock}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📖 GUÍA PARA PROBAR EN SWAGGER');
    console.log('='.repeat(60));
    console.log(`
1. AUTENTICACIÓN:
   - Ve a POST /auth/login
   - Usa: { "email": "test@vinylstore.com", "password": "Test123!" }
   - Copia el token de la respuesta
   - Click en "Authorize" (🔓) y pega: Bearer <tu-token>

2. CREAR ORDEN EXITOSA:
   POST /orders
   {
     "items": [
       { "productId": ${createdProducts[0]?.id || 1}, "quantity": 1 },
       { "productId": ${createdProducts[1]?.id || 2}, "quantity": 2 }
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

3. PROBAR PAGO RECHAZADO (full-name = "REJECTED"):
   POST /orders
   {
     "items": [{ "productId": ${createdProducts[0]?.id || 1}, "quantity": 1 }],
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

4. PROBAR STOCK INSUFICIENTE:
   POST /orders
   {
     "items": [{ "productId": ${createdProducts[0]?.id || 1}, "quantity": 999 }],
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

5. VER HISTORIAL DE ÓRDENES:
   GET /orders

6. VER DETALLE DE ORDEN:
   GET /orders/{id}
`);

    console.log('='.repeat(60));
    console.log('✅ Script completado exitosamente');
    console.log('='.repeat(60));

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedTestData();
