/**
 * agrupa todas las operaciones del cliente sobre pedidos
 * crea, consultar, consultar detalle de un pedido y cancelar pedido  
 */

import apiClient from '../api/apiClient';

const pedidoService = {
    // crear un pedido nuevo los datos capturados en chekout
    crearPedido: async ({ direccionEnvio, telefono, metodoPago = 'efectivo', notasAdicionales = ''}) => {
        const response = await apiClient.post('/cliente/pedidos', {
            direccionEnvio,
            telefono,
            metodoPago,
            notasAdicionales,
        });
        return response.data?.data?.pedidos || response.data?.pedidos || {};
    },

    // devuelve el historial de pedidos del usuario autenticado
    getMisPedidos: async() => {
        const response = await apiClient.get('/cliente/pedidos');
        return response.data?.data?.pedidos || response.data?.pedidos || [];
    },

    //obtiene el detalle completo de un pedido por id
    getPedidoById: async (id) => {
        const response = await apiClient.get(`/cliente/pedidos/${id}`)
        return response.data?.data?.pedidos || response.data?.pedidos || response.data;
    },

    // cancela un pedido siempre que el backend permita el cambio de estado
    cancelarPedido: async (id) => {
        const response = await apiClient.post(`/cliente/pedidos/${id}`)
        return response.data;
    }

}

export default pedidoService;