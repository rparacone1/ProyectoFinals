import { productService } from '../services/product.service.js';

export const ProductController = {
    async getProducts(req, res) {
        try {
            const { limit = 10, page = 1, sort, category } = req.query;
            const products = await productService.getProducts({ limit, page, sort, category });
            res.json({ status: 'success', payload: products });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    async getProductById(req, res) {
        try {
            const { pid } = req.params;
            const product = await productService.getProductById(pid);
            if(!product) {
                return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
            }
            res.json({ status: 'success', payload: product });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    async createProduct(req, res) {
        try {
            const productData = req.body;
            const newProduct = await productService.createProduct(productData);
            res.status(201).json({ status: 'success', payload: newProduct });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    async updateProduct(req, res) {
        try {
            const { pid } = req.params;
            const updateData = req.body;
            const updatedProduct = await productService.updateProduct(pid, updateData);
            if(!updatedProduct) {
                return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
            }
            res.json({ status: 'success', payload: updatedProduct });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    async deleteProduct(req, res) {
        try {
            const { pid } = req.params;
            const result = await productService.deleteProduct(pid);
            if(!result) {
                return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
            }
            res.json({ status: 'success', message: 'Producto eliminado correctamente' });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
};