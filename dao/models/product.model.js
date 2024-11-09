import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'El precio no puede ser negativo']
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'El stock no puede ser negativo'],
        default: 0
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Boolean,
        default: true
    },
    thumbnails: {
        type: [String],
        default: []
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

// Middleware para actualizar updatedAt antes de cada actualización
productSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Índices para mejorar el rendimiento de las consultas
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ code: 1 }, { unique: true });

// Plugin de paginación
productSchema.plugin(mongoosePaginate);

// Método para verificar stock disponible
productSchema.methods.hasStock = function(quantity) {
    return this.stock >= quantity;
};

// Método para actualizar stock
productSchema.methods.updateStock = function(quantity) {
    if (this.hasStock(quantity)) {
        this.stock -= quantity;
        return true;
    }
    return false;
};

export const ProductModel = mongoose.model('Product', productSchema);