import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Product from './Product.model.js';

// Forward declaration para evitar dependencia circular
// La relación con Order se establece en database.ts después de cargar ambos modelos

@Table({
  tableName: 'OrderItems',
  timestamps: true,
})
class OrderItem extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare orderId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1, // quantity debe ser mayor a 0
    },
  })
  declare quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare unitPrice: number;

  // Relación con Order - se establece dinámicamente
  declare order: any;

  // Relación con Product
  @BelongsTo(() => Product)
  declare product: Product;
}

export default OrderItem;
