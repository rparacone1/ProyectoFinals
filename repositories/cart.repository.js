import { cartManager } from '../dao/managers/cart.manager.js';
import { productManager } from '../dao/managers/product.manager.js';
import { CustomError, errorTypes } from '../middlewares/error.middleware.js';
import { ticketService } from '../services/ticket.service.js';

class CartRepository {
    constructor() {
        this.cartManager = cartManager;
        this.productManager = productManager;
    }

    async getCart(cartId) {
        try {
            const cart = await this.cartManager.getCart(cartId);
            if (!cart) {
                throw new CustomError(
                    errorTypes.NOT_FOUND_ERROR,
                    'Carrito no encontrado',
                    404
                );
            }
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async createCart(userId) {
        try {
            return await this.cartManager.createCart(userId);
        } catch (error) {
            throw new CustomError(
                errorTypes.DATABASE_ERROR,
                'Error al crear el carrito',
                500
            );
        }
    }

    async addProduct(cartId, productId, quantity = 1) {
        try {
            const product = await this.productManager.getProductById(productId);
            if (!product) {
                throw new CustomError(
                    errorTypes.NOT_FOUND_ERROR,
                    'Producto no encontrado',
                    404
                );
            }

            if (product.stock < quantity) {
                throw new CustomError(
                    errorTypes.BUSINESS_LOGIC_ERROR,
                    'Stock insuficiente',
                    400
                );
            }

            return await this.cartManager.addProduct(cartId, productId, quantity);
        } catch (error) {
            throw error;
        }
    }

    async removeProduct(cartId, productId) {
        try {
            return await this.cartManager.removeProduct(cartId, productId);
        } catch (error) {
            throw new CustomError(
                errorTypes.DATABASE_ERROR,
                'Error al eliminar el producto del carrito',
                500
            );
        }
    }

    async updateCart(cartId, products) {
        try {
            return await this.cartManager.updateCart(cartId, products);
        } catch (error) {
            throw new CustomError(
                errorTypes.DATABASE_ERROR,
                'Error al actualizar el carrito',
                500
            );
        }
    }

    async clearCart(cartId) {
        try {
            return await this.cartManager.clearCart(cartId);
        } catch (error) {
            throw new CustomError(
                errorTypes.DATABASE_ERROR,
                'Error al vaciar el carrito',
                500
            );
        }
    }

    async processPurchase(cartId, user) {
        try {
            const cart = await this.getCart(cartId);
            
            if (!cart.products.length) {
                throw new CustomError(
                    errorTypes.BUSINESS_LOGIC_ERROR,
                    'El carrito está vacío',
                    400
                );
            }

            const purchaseResult = await this.cartManager.processPurchase(cartId);

            if (purchaseResult.successfulProducts.length > 0) {
                // Crear ticket
                const ticket = await ticketService.createTicket({
                    purchaser: user.email,
                    amount: purchaseResult.totalAmount,
                    products: purchaseResult.successfulProducts
                });

                return {
                    status: 'success',
                    ticket,
                    failedProducts: purchaseResult.failedProducts
                };
            }

            return {
                status: 'error',
                message: 'No se pudo procesar ningún producto',
                failedProducts: purchaseResult.failedProducts
            };

        } catch (error) {
            throw new CustomError(
                errorTypes.BUSINESS_LOGIC_ERROR,
                'Error al procesar la compra: ' + error.message,
                500
            );
        }
    }

    async calculateCartTotal(cartId) {
        try {
            const cart = await this.getCart(cartId);
            let total = 0;

            for (const item of cart.products) {
                const product = await this.productManager.getProductById(item.product);
                total += product.price * item.quantity;
            }

            return total;
        } catch (error) {
            throw new CustomError(
                errorTypes.BUSINESS_LOGIC_ERROR,
                'Error al calcular el total del carrito',
                500
            );
        }
    }
}

export const cartRepository = new CartRepository();