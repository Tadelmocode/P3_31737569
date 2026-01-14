import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import User from './User.model.js';

// Enum para estados de orden
export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  PAYMENT_FAILED = 'PAYMENT_FAILED'
}

@Table({
  tableName: 'Orders',
  timestamps: true,
})
class Order extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
  })
  declare status: OrderStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare totalAmount: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare paymentMethod: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare paymentReference: string;

  // Relación con User (el comprador)
  @BelongsTo(() => User)
  declare user: User;

  // Relación con OrderItems - se establece dinámicamente en database.ts
  declare items: any[];
}

export default Order;
