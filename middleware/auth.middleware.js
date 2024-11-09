export const isAdmin = (req, res, next) => {
    if(req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ status: 'error', message: 'No tienes permisos de administrador' });
    }
};

export const isUser = (req, res, next) => {
    if(req.user && req.user.role === 'user') {
        next();
    } else {
        res.status(403).json({ status: 'error', message: 'Debes ser un usuario para realizar esta acción' });
    }
};