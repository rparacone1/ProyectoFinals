import { UserModel } from '../models/user.model.js';
import { createHash, isValidPassword } from '../../utils.js';
import config from '../../config/env.config.js';

export class UserManager {
    async getUsers() {
        try {
            const users = await UserModel.find().lean();
            return users;
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    async getUserById(id) {
        try {
            const user = await UserModel.findById(id).lean();
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            throw new Error(`Error al obtener el usuario: ${error.message}`);
        }
    }

    async getUserByEmail(email) {
        try {
            const user = await UserModel.findOne({ email }).lean();
            return user;
        } catch (error) {
            throw new Error(`Error al obtener el usuario por email: ${error.message}`);
        }
    }

    async createUser(userData) {
        try {
            const { email, password, firstName, lastName } = userData;

            if (!email || !password || !firstName || !lastName) {
                throw new Error('Faltan campos obligatorios');
            }

            const existingUser = await this.getUserByEmail(email);
            if (existingUser) {
                throw new Error('Ya existe un usuario con ese email');
            }

            const user = await UserModel.create({
                ...userData,
                password: createHash(password),
                role: email === config.adminEmail ? 'admin' : 'user'
            });

            return user;
        } catch (error) {
            throw new Error(`Error al crear el usuario: ${error.message}`);
        }
    }

    async updateUser(id, updateData) {
        try {
            // Si se está actualizando la contraseña, hashearla
            if (updateData.password) {
                updateData.password = createHash(updateData.password);
            }

            const user = await UserModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            return user;
        } catch (error) {
            throw new Error(`Error al actualizar el usuario: ${error.message}`);
        }
    }

    async deleteUser(id) {
        try {
            const user = await UserModel.findByIdAndDelete(id);
            
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            return user;
        } catch (error) {
            throw new Error(`Error al eliminar el usuario: ${error.message}`);
        }
    }

    async validateUser(email, password) {
        try {
            const user = await this.getUserByEmail(email);
            
            if (!user) {
                return null;
            }

            if (!isValidPassword(password, user.password)) {
                return null;
            }

            return user;
        } catch (error) {
            throw new Error(`Error al validar el usuario: ${error.message}`);
        }
    }

    async updateLastConnection(userId) {
        try {
            const user = await UserModel.findByIdAndUpdate(
                userId,
                { $set: { lastConnection: new Date() } },
                { new: true }
            );

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            return user;
        } catch (error) {
            throw new Error(`Error al actualizar última conexión: ${error.message}`);
        }
    }
}

export const userManager = new UserManager();