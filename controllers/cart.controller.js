import { cartService } from '../services/cart.service.js';
import { ticketService } from '../services/ticket.service.js';

export const CartController = {
    async purchase(req, res) {
        try {
            const { cid } = req.params;
            const user = req.user;
            
            const result = await cartService.processPurchase(cid, user);
            
            if(result.failedProducts.length > 0) {
                // Actualizar carrito solo con productos que no se pudieron comprar
                await cartService.updateCart(cid, result.failedProducts);
            }
            
            if(result.successfulProducts.length > 0) {
                // Generar ticket
                const ticket = await ticketService.createTicket({
                    purchaser: user.email,
                    amount: result.totalAmount,
                    products: result.successfulProducts
                });
            }
            
            res.json({
                status: 'success',
                failedProducts: result.failedProducts,
                ticket: ticket
            });
        } catch(error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
};