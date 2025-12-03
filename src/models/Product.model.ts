import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import * as slugifyModule from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import User from './User.model.js';
import Category from './Category.model.js';
import Tag from './Tag.model.js';
import ProductTag from './ProductTag.model.js';

const slugify = (slugifyModule as any).default || slugifyModule;

@Table({
  tableName: 'Products',
  timestamps: true,
})
class Product extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare slug: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare stock: number;

  // Atributos específicos para Vinilos
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare artist: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare label: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare releaseYear: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare format: string; // LP, EP, Single, etc.

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare condition: string; // Mint, Near Mint, Very Good, etc.

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare sku: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  // Relación con User
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  // Relación con Category
  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare categoryId: number;

  @BelongsTo(() => Category)
  declare category: Category;

  // Relación muchos-a-muchos con Tags
  @BelongsToMany(() => Tag, () => ProductTag)
  declare tags: Tag[];

  // Generar slug único antes de crear
  @BeforeCreate
  static async generateSlugBeforeCreate(product: Product) {
    if (!product.slug) {
      const name = product.getDataValue('name');
      if (name) {
        const baseSlug = slugify(name, { lower: true, strict: true });
        product.setDataValue('slug', `${baseSlug}-${uuidv4().slice(0, 8)}`);
      }
    }
  }

  // Actualizar slug si cambia el nombre
  @BeforeUpdate
  static async updateSlugBeforeUpdate(product: Product) {
    const changedFields = product.changed() as string[] | boolean;
    if (changedFields && (changedFields === true || (Array.isArray(changedFields) && changedFields.includes('name')))) {
      const name = product.getDataValue('name');
      if (name) {
        const baseSlug = slugify(name, { lower: true, strict: true });
        product.setDataValue('slug', `${baseSlug}-${uuidv4().slice(0, 8)}`);
      }
    }
  }
}

export default Product;
