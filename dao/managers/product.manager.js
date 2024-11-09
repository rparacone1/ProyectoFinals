import { ProductModel } from '../models/product.model.js';

export class ProductManager {
    async getProducts({ limit = 10, page = 1, sort, category }) {
        try {
            const query = category ? { category } : {};
            const options = {
                limit,
                page,
                lean: true
            };

            if (sort) {
                options.sort = { price: sort === 'asc' ? 1 : -1 };
            }

            const products = await ProductModel.paginate(query, options);
            
            return {
                status: 'success',
                payload: products.docs,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                page: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.hasPrevPage ? `/api/products?page=${products.prevPage}` : null,
                nextLink: products.hasNextPage ? `/api/products?page=${products.nextPage}` : null
            };
        } catch (error) {
            throw new Error(`Error al obtener productos: ${error.message}`);
        }
    }

    async getProductById(id) {
        try {
            const product = await ProductModel.findById(id).lean();
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            return product;
        } catch (error) {
            throw new Error(`Error al obtener el producto: ${error.message}`);
        }
    }

    async createProduct(productData) {
        try {
            const { name, description, price, stock, category } = productData;

            if (!name || !price || !stock) {
                throw new Error('Faltan campos obligatorios');
            }

            const product = await ProductModel.create({
                name,
                description,
                price,
                stock,
                category
            });

            return product;
        } catch (error) {
            throw new Error(`Error al crear el producto: ${error.message}`);
        }
    }

    async updateProduct(id, updateData) {
        try {
            const product = await ProductModel.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!product) {
                throw new Error('Producto no encontrado');
            }

            return product;
        } catch (error) {
            throw new Error(`Error al actualizar el producto: ${error.message}`);
        }
    }

    async deleteProduct(id) {
        try {
            const product = await ProductModel.findByIdAndDelete(id);
            
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            return product;
        } catch (error) {
            throw new Error(`Error al eliminar el producto: ${error.message}`);
        }
    }

    async updateStock(id, quantity) {
        try {
            const product = await ProductModel.findById(id);
            
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            if (product.stock < quantity) {
                throw new Error('Stock insuficiente');
            }

            product.stock -= quantity;
            await product.save();
            
            return product;
        } catch (error) {
            throw new Error(`Error al actualizar el stock: ${error.message}`);
        }
    }
}

export const productManager = new ProductManager();