import { userService } from '../services/user.service.js';
import { UserDTO } from '../dto/user.dto.js';
import jwt from 'jsonwebtoken';
import config from '../config/env.config.js';

export const UserController = {
    async register(req, res) {
        try {
            const { email, password } = req.body;
            const exists = await userService.getByEmail(email);
            
            if(exists) {
                return res.status(400).json({ status: 'error', message: 'El usuario ya existe' });
            }

            const user = await userService.create(req.body);
            res.status(201).json({ status: 'success', payload: new UserDTO(user) });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await userService.validateUser(email, password);
            
            if(!user) {
                return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
            }

            const token = jwt.sign(new UserDTO(user), config.jwtSecret, { expiresIn: '24h' });
            
            res.cookie('authToken', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 24 horas
            });

            res.json({ status: 'success', message: 'Login exitoso' });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    async logout(req, res) {
        try {
            res.clearCookie('authToken');
            res.json({ status: 'success', message: 'Logout exitoso' });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    async getCurrentUser(req, res) {
        try {
            // req.user viene del middleware de passport JWT
            if(!req.user) {
                return res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
            }
            
            // Utilizamos DTO para enviar solo la información necesaria
            const userDTO = new UserDTO(req.user);
            res.json({ status: 'success', payload: userDTO });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    async updateUser(req, res) {
        try {
            const { uid } = req.params;
            const updateData = req.body;
            
            const updatedUser = await userService.update(uid, updateData);
            if(!updatedUser) {
                return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
            }
            
            res.json({ status: 'success', payload: new UserDTO(updatedUser) });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
};