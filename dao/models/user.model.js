import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un email válido']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'premium'],
        default: 'user'
    },
    age: {
        type: Number,
        min: [0, 'La edad no puede ser negativa']
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    documents: [{
        name: String,
        reference: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    }],
    lastConnection: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true,
    versionKey: false
});

// Índices para optimizar búsquedas
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Middleware para poblar el carrito automáticamente
userSchema.pre('find', function() {
    this.populate('cart');
});

// Método para verificar si el usuario es premium
userSchema.methods.isPremium = function() {
    return this.role === 'premium';
};

// Método para verificar si el usuario es admin
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

// Método para actualizar última conexión
userSchema.methods.updateLastConnection = function() {
    this.lastConnection = new Date();
    return this.save();
};

// Método para verificar documentos requeridos para premium
userSchema.methods.hasRequiredDocuments = function() {
    const requiredDocs = ['identificacion', 'comprobanteDomicilio', 'estadoCuenta'];
    const uploadedDocs = this.documents.map(doc => doc.name);
    return requiredDocs.every(doc => uploadedDocs.includes(doc));
};

// Virtual para nombre completo
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Método para generar token de reseteo de contraseña
userSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    return this.save();
};

// Transformación del documento al convertir a JSON
userSchema.set('toJSON', {
    transform: function(doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
    },
    virtuals: true
});

export const UserModel = mongoose.model('User', userSchema);