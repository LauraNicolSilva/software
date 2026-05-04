/**
 * Encapsula las operaciones del panel administrativo sobre productos
 * crea, edita, elimina, activa/desactiva productos 
 * todas la funciones usan el token el cliente https central para incluir el token y manejo de errores 
 */
import api from '../api/apiClient';

// Crea un producto en el backend usando el payload del formulario del admin
export async function createProduct(data) {
    const res = await api.post('/admin/productos', data);
    return res.data;
}

// Edita un producto en el backend usando el payload del formulario del admin
export async function updateProduct(id, data) {
    const res = await api.put(`/admin/productos/${id}`, data);
    return res.data;
}

// Elimina un producto en el backend 
export async function deleteProduct(id) {
    const res = await api.delete(`/admin/productos/${id}`);
    return res.data;
}

// Activar y Desactivar un producto en el backend 
export async function activarProducto(id) {
    const res = await api.patch(`/admin/productos/${id}/activar`);
    return res.data;
}

// Activar y Desactivar un producto en el backend 
export async function desactivarProducto(id) {
    const res = await api.patch(`/admin/productos/${id}/desactivar`);
    return res.data;
}


