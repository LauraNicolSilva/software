// este archivo centraliza axios para todas las peticiones HTTP al backend 
// Configura la URL base y el tiempo maximo de espera desde las constantes 
// Intercertor de peticion: adjunta automaticamente el token JWT si existe 
// Interceptor de respuesta: normalmente los errores para el todo codigo reciba 
// Siempre un objeto Error con un mensaje leglible

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS, STORAGE_KEYS } from '../utils/constants';
import { storageGetItem } from '../utils/storage'; 

// instancias de axios
const apiClient = axios.create({
    baseURL: API_BASE_URL, // la base de url que se conecta con el backend con puerto
    timeout: API_TIMEOUT_MS, // tiempo maximo se cancela si el server dura mas 
});

// Interceptor de peticion
// S ejecuta antes de enviar cada request
// Si hay token lo valida 
// Autorizando para el que el backend pueda autenticar el usuario

apiClient.interceptors.request.use(
    async (config) => {
        const token = await storageGetItem(STORAGE_KEYS.token);

        if (token) {
            //Formato estandar Bearer Authorization: Bearer <token>
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    // Si el interceptor mismo falla (error de configuracion) rechaza la peticion 
    (error) => Promise.reject(error)
);

// Interceptor de respuesta 
// Se ejecuta despues de recibir cada respuesta 
// Respuestas 2xx se devuelve sin modificar 
// Respuestas con error (4xx, 5xx) /red extrae el mensaje del backend 
// Si existe si no usa el mensaje de axios o un mensaje generico

appClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const backendMessage = error.response.data?.message; //Mensaje del servidor
        const message  = backendMessage || error.message || 'Error de conexion';
        return Promise.reject(new Error(message));
    }
);

export default apiClient;
