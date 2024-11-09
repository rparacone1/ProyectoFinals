import { productManager } from '../dao/managers/product.manager.js';
import { CustomError, errorTypes } from '../middlewares/error.middleware.js';
import { ProductDTO } from '../dto/product.dto.js';

class ProductRepository {
    constructor() {
        this.productManager = productManager;
    }

    async getProducts(options = {}) {
        try {
            const products = await this.productManager.getProducts(options);
            return {
                ...products,
                payload: products.payload.map(product => ProductDTO.getPresenterDTO(product))
            };
        } catch (error) {
            throw new CustomError(
                errorTypes.DATABASE_ERROR,
                'Error al obtener productos',
                500
            );
        }
    }

    async getProductById(id) {
        try {
            const product = await this.productManager.getProductById(id);
            if (!product) {
                throw new CustomError(
                    errorTypes.NOT_FOUND_ERROR,
                    'Producto no encontrado',
                    404
                );
            }
            return ProductDTO.getDetailDTO(product);
        } catch (error) {
            throw error;
        }
    }

    async createProduct(productData) {
        try {
            this.validateProductData(productData);

            const existingProduct = await this.productManager.getProductByCode(productData.code);
            if (existingProduct) {
                throw new CustomError(
                    errorTypes.VALIDATION_ERROR,
                    'Ya existe un producto con ese código',
                    400
                );
            }

            const product = await this.productManager.createProduct(productData);
            return ProductDTO.getDetailDTO(product);
        } catch (error) {
            throw error;
        }
    }

    async updateProduct(id, updateData) {
        try {
            if (updateData.code) {
                const existingProduct = await this.productManager.getProductByCode(updateData.code);
                if (existingProduct && existingProduct._id.toString() !== id) {
                    throw new CustomError(
                        errorTypes.VALIDATION_ERROR,
                        'Ya existe un producto con ese código',
                        400
                    );
                }
            }

            const product = await this.productManager.updateProduct(id, updateData);
            if (!product) {
                throw new CustomError(
                    errorTypes.NOT_FOUND_ERROR,
                    'Producto no encontrado',
                    404
                );
            }
            return ProductDTO.getDetailDTO(product);
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const product = await this.productManager.deleteProduct(id);
            if (!product) {
                throw new CustomError(
                    errorTypes.NOT_FOUND_ERROR,
                    'Producto no encontrado',
                    404
                );
            }
            return ProductDTO.getDetailDTO(product);
        } catch (error) {
            throw error;
        }
    }

    async updateStock(id, quantity) {
        try {
            const product = await this.productManager.getProductById(id);
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

            product.stock -= quantity;
            const updatedProduct = await this.productManager.updateProduct(id, { stock: product.stock });
            return ProductDTO.getDetailDTO(updatedProduct);
        } catch (error) {
            throw error;
        }
    }

    validateProductData(productData) {
        const requiredFields = ['name', 'description', 'price', 'code', 'stock', 'category'];
        const missingFields = requiredFields.filter(field => !productData[field]);

        if (missingFields.length > 0) {
            throw new CustomError(
                errorTypes.VALIDATION_ERROR,
                `Faltan campos requeridos: ${missingFields.join(', ')}`,
                400
            );
        }

        if (productData.price <= 0) {
            throw new CustomError(
                errorTypes.VALIDATION_ERROR,
                'El precio debe ser mayor a 0',
                400
            );
        }

        if (productData.stock < 0) {
            throw new CustomError(
                errorTypes.VALIDATION_ERROR,
                'El stock no puede ser negativo',
                400
            );
        }
    }

    async getProductsByCategory(category) {
        try {
            const products = await this.productManager.getProducts({ category });
            return products.payload.map(product => ProductDTO.getPresenterDTO(product));
        } catch (error) {
            throw new CustomError(
                errorTypes.DATABASE_ERROR,
                'Error al obtener productos por categoría',
                500
            );
        }
    }

    async searchProducts(searchTerm) {
        try {
            const products = await this.productManager.searchProducts(searchTerm);
            return products.map(product => ProductDTO.getPresenterDTO(product));
        } catch (error) {
            throw new CustomError(
                errorTypes.DATABASE_ERROR,
                'Error en la búsqueda de productos',
                500
            );
        }
    }
}

export const productRepository = new ProductRepository();