import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../config/database.db'),
  logging: true, // Puedes activarlo para ver las queries SQL en consola
  models: [User], // Cargar modelos explícitamente
});

export default sequelize;