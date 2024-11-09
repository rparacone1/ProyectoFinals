export const errorTypes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR'
};

export class CustomError {
    constructor(type, message, statusCode) {
        this.type = type;
        this.message = message;
        this.statusCode = statusCode;
    }
}

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Si es un error personalizado
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            status: 'error',
            error: {
                type: err.type,
                message: err.message
            }
        });
    }

    // Manejar errores específicos de Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            error: {
                type: errorTypes.VALIDATION_ERROR,
                message: 'Error de validación',
                details: Object.values(err.errors).map(error => error.message)
            }
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'error',
            error: {
                type: errorTypes.VALIDATION_ERROR,
                message: 'ID inválido'
            }
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            status: 'error',
            error: {
                type: errorTypes.VALIDATION_ERROR,
                message: 'Valor duplicado',
                field: Object.keys(err.keyPattern)[0]
            }
        });
    }

    // Error por defecto
    return res.status(500).json({
        status: 'error',
        error: {
            type: errorTypes.DATABASE_ERROR,
            message: 'Error interno del servidor'
        }
    });
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        status: 'error',
        error: {
            type: errorTypes.NOT_FOUND_ERROR,
            message: 'Ruta no encontrada'
        }
    });
};

// Middleware para capturar errores asíncronos
export const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Ejemplos de uso de CustomError
export const errorExamples = {
    validationError: new CustomError(
        errorTypes.VALIDATION_ERROR,
        'Datos inválidos',
        400
    ),
    authenticationError: new CustomError(
        errorTypes.AUTHENTICATION_ERROR,
        'No autorizado',
        401
    ),
    authorizationError: new CustomError(
        errorTypes.AUTHORIZATION_ERROR,
        'No tienes permisos',
        403
    ),
    notFoundError: new CustomError(
        errorTypes.NOT_FOUND_ERROR,
        'Recurso no encontrado',
        404
    ),
    businessError: new CustomError(
        errorTypes.BUSINESS_LOGIC_ERROR,
        'Error en la lógica de negocio',
        400
    )
};