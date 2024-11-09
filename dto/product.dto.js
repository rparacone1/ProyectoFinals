export class ProductDTO {
    constructor(product) {
        this.id = product._id;
        this.name = product.name;
        this.description = product.description;
        this.price = this.formatPrice(product.price);
        this.stock = product.stock;
        this.category = product.category;
        this.status = product.status;
        this.thumbnails = product.thumbnails || [];
        this.code = product.code;
        this.availability = this.checkAvailability(product.stock);
    }

    formatPrice(price) {
        return Number(price).toFixed(2);
    }

    checkAvailability(stock) {
        if (stock === 0) return 'Sin stock';
        if (stock < 5) return 'Últimas unidades';
        return 'Disponible';
    }

    static getPresenterDTO(product) {
        return {
            id: product._id,
            name: product.name,
            price: Number(product.price).toFixed(2),
            thumbnails: product.thumbnails?.[0] || '',
            category: product.category,
            availability: product.stock > 0 ? 'Disponible' : 'Sin stock'
        };
    }

    static getDetailDTO(product) {
        return {
            id: product._id,
            name: product.name,
            description: product.description,
            price: Number(product.price).toFixed(2),
            stock: product.stock,
            category: product.category,
            thumbnails: product.thumbnails || [],
            code: product.code,
            status: product.status
        };
    }

    static getAdminDTO(product) {
        return {
            id: product._id,
            name: product.name,
            price: Number(product.price).toFixed(2),
            stock: product.stock,
            category: product.category,
            status: product.status,
            code: product.code,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        };
    }
}