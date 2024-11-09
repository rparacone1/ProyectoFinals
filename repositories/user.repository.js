import { userManager } from '../dao/managers/user.manager.js';
import { cartRepository } from './cart.repository.js';
import { CustomError, errorTypes } from '../middlewares/error.middleware.js';
import { UserDTO } from '../dto/user.dto.js';
import { createHash, isValidPassword } from '../utils.js';
import { sendEmail } from '../services/mail.service.js';

class UserRepository {
    constructor() {
        this.userManager = userManager;
    }

    async getUsers() {
        try {
            const users = await this.userManager.getUsers();
            return users.map(user => new UserDTO(user));
        } catch (error) {
            throw new CustomError(
                errorTypes.DATABASE_ERROR,
                'Error al obtener usuarios',
                500
            );
        }
    }

    async getUserById(id) {
        try {
            const user = await this.userManager.getUserById(id);
            if (!user) {
                throw new CustomError(
                    errorTypes.NOT_FOUND_ERROR,
                    'Usuario no encontrado',
                    404
                );
            }
            return new UserDTO(user);
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            const user = await this.userManager.getUserByEmail(email);
            return user ? new UserDTO(user) : null;
        } catch (error) {
            throw new CustomError(
                errorTypes.DATABASE_ERROR,
                'Error al buscar usuario por email',
                500
            );
        }
    }

    async createUser(userData) {
        try {
            this.validateUserData(userData);

            const existingUser = await this.userManager.getUserByEmail(userData.email);
            if (existingUser) {
                throw new CustomError(
                    errorTypes.VALIDATION_ERROR,
                    'Ya existe un usuario con ese email',
                    400
                );
            }

            // Crear carrito para el nuevo usuario
            const cart = await cartRepository.createCart();
            
            const user = await this.userManager.createUser({
                ...userData,
                cart: cart._id
            });

            // Enviar email de bienvenida
            await sendEmail({
                to: user.email,
                subject: 'Bienvenido a nuestra plataforma',
                html: `<h1>Bienvenido ${user.firstName}!</h1>`
            });

            return new UserDTO(user);
        } catch (error) {
            throw error;
        }
    }

    async updateUser(id, updateData) {
        try {
            if (updateData.email) {
                const existingUser = await this.userManager.getUserByEmail(updateData.email);
                if (existingUser && existingUser._id.toString() !== id) {
                    throw new CustomError(
                        errorTypes.VALIDATION_ERROR,
                        'Ya existe un usuario con ese email',
                        400
                    );
                }
            }

            if (updateData.password) {
                updateData.password = createHash(updateData.password);
            }

            const user = await this.userManager.updateUser(id, updateData);
            if (!user) {
                throw new CustomError(
                    errorTypes.NOT_FOUND_ERROR,
                    'Usuario no encontrado',
                    404
                );
            }

            return new UserDTO(user);
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            const user = await this.userManager.deleteUser(id);
            if (!user) {
                throw new CustomError(
                    errorTypes.NOT_FOUND_ERROR,
                    'Usuario no encontrado',
                    404
                );
            }

            // Eliminar carrito asociado
            if (user.cart) {
                await cartRepository.deleteCart(user.cart);
            }

            return new UserDTO(user);
        } catch (error) {
            throw error;
        }
    }

    async validateUser(email, password) {
        try {
            const user = await this.userManager.getUserByEmail(email);
            if (!user || !isValidPassword(password, user.password)) {
                throw new CustomError(
                    errorTypes.AUTHENTICATION_ERROR,
                    'Credenciales inválidas',
                    401
                );
            }

            await this.userManager.updateLastConnection(user._id);
            return new UserDTO(user);
        } catch (error) {
            throw error;
        }
    }

    async upgradeToPremiun(userId) {
        try {
            const user = await this.userManager.getUserById(userId);
            if (!user) {
                throw new CustomError(
                    errorTypes.NOT_FOUND_ERROR,
                    'Usuario no encontrado',
                    404
                );
            }

            if (!user.hasRequiredDocuments()) {
                throw new CustomError(
                    errorTypes.VALIDATION_ERROR,
                    'El usuario debe completar la documentación requerida',
                    400
                );
            }

            const updatedUser = await this.userManager.updateUser(userId, { role: 'premium' });
            return new UserDTO(updatedUser);
        } catch (error) {
            throw error;
        }
    }

    validateUserData(userData) {
        const requiredFields = ['firstName', 'lastName', 'email', 'password'];
        const missingFields = requiredFields.filter(field => !userData[field]);

        if (missingFields.length > 0) {
            throw new CustomError(
                errorTypes.VALIDATION_ERROR,
                `Faltan campos requeridos: ${missingFields.join(', ')}`,
                400
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new CustomError(
                errorTypes.VALIDATION_ERROR,
                'Email inválido',
                400
            );
        }

        if (userData.password.length < 6) {
            throw new CustomError(
                errorTypes.VALIDATION_ERROR,
                'La contraseña debe tener al menos 6 caracteres',
                400
            );
        }
    }

    async requestPasswordReset(email) {
        try {
            const user = await this.userManager.getUserByEmail(email);
            if (!user) {
                throw new CustomError(
                    errorTypes.NOT_FOUND_ERROR,
                    'Usuario no encontrado',
                    404
                );
            }

            const resetToken = await this.userManager.generatePasswordReset(user._id);
            
            // Enviar email con link de reseteo
            await sendEmail({
                to: email,
                subject: 'Reseteo de contraseña',
                html: `<p>Para resetear tu contraseña, haz click <a href="/reset-password/${resetToken}">aquí</a></p>`
            });

            return true;
        } catch (error) {
            throw error;
        }
    }
}

export const userRepository = new UserRepository();
