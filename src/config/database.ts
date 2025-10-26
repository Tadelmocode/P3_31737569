import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../config/database.db'),
  logging: true, // Puedes activarlo para ver las queries SQL en consola
  models: [path.join(__dirname, '../models')], // Auto-cargar modelos
});

export default sequelize;