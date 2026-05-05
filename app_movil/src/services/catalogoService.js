/**
 * gestiona las consultas publicas del catalogo
 * obtener categorias, productos con filtros
 * construir la url validas para imagenes del backend 
 */

import apiClient from '../api/apiClient';

const catalogoService = {
    // Consultar la lista de categorias disponibles para filtros de navegacion
    getCategorias: async () => {
        const response = await apiClient.get('/catalogo/categorias');
        const payload = response.data?.data || response.data || {};
        return payload.categorias || [];
    },

    // consulta productos de catalogo y acepta filtros de busqueda 
    getProductos: async (params = {}) => {
        const response = await apiClient.get('/catalogo/productos', { params });
        const payload = response.data?.data || response.data || {};
        const productos = payload.productos || [];
        return productos;
    },

    //Convierte una ruta relativa del backend en url completa usable para imagen

    buildImagenUrl: (path) => {
        if (!path) {
            return 'https://via.placeholder.com/300/200.png?text=Producto';
        }

        if (path.startWith('http://') || path.startWith('https://')) {
            return path;
        }

        const origin  = 'http://10.0.2.2:5000';
        return `${origin}/${path.replace(/^\//, '')}`;
    },
};

export default catalogoService;