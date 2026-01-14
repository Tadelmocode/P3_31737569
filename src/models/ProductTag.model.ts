import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import Product from './Product.model.js';
import Tag from './Tag.model.js';

@Table({
  tableName: 'ProductTags',
  timestamps: false,
})
class ProductTag extends Model {
  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @ForeignKey(() => Tag)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare tagId: number;
}

export default ProductTag;
