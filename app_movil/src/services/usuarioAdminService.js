/**
 * administra la funciones del usuario 
 * activa y desactiva y eliminar desde la panel del admin
 */

import api from '../api/apiClient';

//Activa un usuario
export async function activarUsuario(id) {
    const res = await api.patch(`/admin/usuarios/${id}/activar`);
    return res.data;
} 

//Desactiva un usuario
export async function desactivarUsuario(id) {
    const res = await api.patch(`/admin/usuarios/${id}/desactivar`);
    return res.data;
} 

// elimina un usuario
export async function eliminarUsuario(id) {
    const res = await api.delete(`/admin/usuarios/${id}`);
    return res.data;
} 


