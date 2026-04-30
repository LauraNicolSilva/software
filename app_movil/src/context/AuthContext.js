/**
 * Archivo contexto global de autenticacion 
 * restaura la sesion guardada al iniciar la app,(token, usuario, ect)
 * Expone las funciones de login, register, logout, actualizar perfil
 * Cualquier componente que se necesite saber si el usuario esta logueando usa un hook useAuth() en lugar de leer el AsyncStorage directamente
 */

import { createContext, useCallback, useContext,useEffect, useMemo, useState } from 'react';
import authService from '.../services/authService';

// Valor Inicial null: useAuth() valida que esta dentro del provider
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    //Usuario autenticado objeto con id, nombre, rol o null 
    const [user, setUser] = useState(null);
    // JWT recibido del backend: su presencia es indica sesion activa 
    const [token, setToken] = useState(null);
    // True mientras se lee asyncStorage al arrancar: evita redirigir antes de tiempo 
    const [isloading, setLoading] = useState(true);

    /** 
     * RestoreSession: 
     * lee el token y el usuario guardados en AsyncStorage al abrir la app
     * Si no hay sesion guardado, deja los estados en null
     */

    const restoreSession = useCallback(async () => {
        try {
            const session = await authService.getSession();
            setToken(session?.token || null);
            setUser(session?.user || null);
        } finally {
            // Siempre se termina de cargar como terminada, aunque falle al inicio 
            setIsLoading(false);
        }
    }, []);

    // Se ejecuta una sola vez al montar el provider (Al iniciar la app)
    useEffect (() => {
        restoreSession();
    }, [restoreSession]);

    /** 
     * Login: 
     * llama el post /auth/login, guarda el token en AsyncStorage y actualiza el estado 
     * Goblal para que toda la app sepa que el usuario esta logueado
     */

    const login = useCallback(async (email, password) => {
        const response = await authService.login(email,password);
        // El backend puede devolver el playload dentro de respose.data o directo
        const payload = response.data || response;

        setToken(payload?.token || null);
        setUser(payload?.user || null);

        return response;
    }, []);

    /**
     * Register 
     * delega el registro al servicio: no inicia sesion automaticamente
     */
    
    const register = useCallback(async (data) => {
        return authService.register(data);
    }, []);

    /**
     * Logout:
     * Actualiza los datos del usuario en el backend y sincroniza el estado actual 
     */

    const logout = useCallback(async () => {
        await authService.logout();
        setToken(null);
        setUser(null);
    }, []);

    /**
     * updateProfile: 
     * Actualiza los datos el usuario en el backend y sincroniza el estado local
     */

    const updatePerfil = useCallback(async (data) => {
        const usuario = await authService.updatePerfil(data);
        if (usuario) setUser(usuario);
        return usuario;
    }, []);

    /** 
     * Valor de contexto
     * usememo evita recrear el objeto en cada render, 
     * solo cambia si alguna de las dependencias cambia 
     */
    const value = useMemo(() => ({
        user, // Objeto del usuario autenticado o null
        token, // JWT o null
        isAuthenticated: Boolean(token), // Booleando derivado del token
        isLoadingSession, // True mientras se restaura la sesion
        login,
        register,
        logout,
        updatePerfil,
        refreshSession: restoreSession // Permite forzar una re-lectura del storage 
    }),
    [user, token, isLoadingSession, login, register, logout, updatePerfil, restoreSession]
    );
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}

    /**
     * Hook use
     * simplifica el acceso al contexto y lanza un error descriptivo si se usa fuera del arbol del provider
    */

  export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe usarse dentro del AuthProvider');
    }
    return context;
}