import { CartModel } from '../models/cart.model.js';
import { ProductModel } from '../models/product.model.js';

export class CartManager {
    async getCart(cartId) {
        try {
            return await CartModel.findById(cartId)
                .populate('products.product')
                .lean();
        } catch (error) {
            throw new Error(`Error al obtener el carrito: ${error.message}`);
        }
    }

    async createCart(userId) {
        try {
            const newCart = await CartModel.create({
                user: userId,
                products: []
            });
            return newCart;
        } catch (error) {
            throw new Error(`Error al crear el carrito: ${error.message}`);
        }
    }

    async addProduct(cartId, productId, quantity = 1) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            const productIndex = cart.products.findIndex(
                item => item.product.toString() === productId
            );

            if (productIndex !== -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({
                    product: productId,
                    quantity
                });
            }

            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(`Error al agregar producto al carrito: ${error.message}`);
        }
    }

    async removeProduct(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            cart.products = cart.products.filter(
                item => item.product.toString() !== productId
            );

            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(`Error al eliminar producto del carrito: ${error.message}`);
        }
    }

    async updateCart(cartId, products) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            cart.products = products;
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(`Error al actualizar el carrito: ${error.message}`);
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            cart.products = [];
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error(`Error al vaciar el carrito: ${error.message}`);
        }
    }

    async processPurchase(cartId) {
        try {
            const cart = await this.getCart(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            const failedProducts = [];
            const successfulProducts = [];
            let totalAmount = 0;

            for (const item of cart.products) {
                const product = await ProductModel.findById(item.product._id);
                
                if (!product) {
                    failedProducts.push(item);
                    continue;
                }

                if (product.stock >= item.quantity) {
                    // Actualizar stock
                    product.stock -= item.quantity;
                    await product.save();

                    successfulProducts.push({
                        product: product._id,
                        quantity: item.quantity,
                        price: product.price
                    });

                    totalAmount += product.price * item.quantity;
                } else {
                    failedProducts.push(item);
                }
            }

            // Actualizar carrito solo con productos fallidos
            if (failedProducts.length > 0) {
                await this.updateCart(cartId, failedProducts);
            } else {
                await this.clearCart(cartId);
            }

            return {
                failedProducts,
                successfulProducts,
                totalAmount
            };
        } catch (error) {
            throw new Error(`Error al procesar la compra: ${error.message}`);
        }
    }
}

export const cartManager = new CartManager();