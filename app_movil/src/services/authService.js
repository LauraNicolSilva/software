/**
 * Centraliza todas las operaciones relacionadas con autenticacion 
 * inicialmente sesion guarda el token/usuario en almacenamiento local
 * cierra sesion  eliminando los datos 
 * reataura la sesion guardada 
 * actualiza el perfil del usuario autenticado
 */

import apiClient from '../api/apiClient';
import { STORAGE_KEY } from '../utils/constants';
import { storageGetItem, storageSetItem , storageMultiRemove} from '../utils/storage';

const authService = {
    //Envia crendenciales al backend y persisten el token + usuario si son validos
    login: async (email, password) => {
        const response = await apiClient.post('auth/login', { email, password });
        const payload = response.data?.data || response.data; // maneja ambos formatos de respuesta 

        if (payload?.token) {
            await storageSetItem(STORAGE_KEY.token, payload.token);
        }

        if (payload?.usuario) {
            await storageSetItem(STORAGE_KEY.usuario, payload.usuario);
        }

        return response.data;
    },
    
    register: async (name, email, password) => {
        const response = await apiClient.post('auth/register', { name, email, password});
        return response.data;
    },
    
    logout: async () => {
        await storageMultiRemove([STORAGE_KEY.token, STORAGE_KEY.user]);
    },

    //Lee el almacenamiento local la sesion previamente guardada 
    getSession: async () => {
        const token = await storageGetItem(STORAGE_KEY.token);
        const userRaw = await storageGetItem(STORAGE_KEY.user);
        const user = userRaw ? JSON.parse(userRaw) : null;
        return { token, user };
    },

    // Actualiza el perfil del usuario autenticado
    updatePerfil: async (data) => {
        const response = await apiClient.put('auth/profile', data);
        const usuario = response.data?.data?.usuario || response.data.usuario; // maneja ambos formatos de respuesta

        if (usuario) {
            await storageSetItem(STORAGE_KEY.user, JSON.stringify(usuario));
        }
        return response.data;
    },


};
export default authService;