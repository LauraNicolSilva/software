/**
 * Es el contexto global del carrito de compras 
 * Funciona en dos modos segun si el usuario esta autenticado 
 * sin session lee y escribe en asyncStorage (carrito local)
 * Connsession lee y escribe en backend via api rest 
 * Al iniciar sesion funciona automaticamente en el carrito local al backend para que el usuario 
 * No pierda los productos agregados sin cuenta 
 * Expone items totales y las acciones: agregar cambiar cantidad eliminar vaciar 
 */

import {  createContext, useCallback, useEffect, useContext, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import CarritoService from '../services/CarritoService';

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
    // Lee isAuthenticated e isLoading del contexto del autenticacion
    const { isAuthenticated, isLoadingSession } = useAuth();

    // estado del carrito
    const [items, setItems ] = useState([]); // Lista de productos en el carrito
    const [totalItems, setTotalItems ] = useState(0); // suma de cantidades
    const [total, setTotal ] = useState([0]); //precio total
    const [loading, setLoading ] = useState([true]); //true mientras carga el carrito

    //Rastrea si el usuario esta autenticado en el render anterior para detectar en el momento exacto de inicio de sesion
    const prevAuthenticated = useRef(false);

    /**
     * hydrate 
     * carga o recarga el carrito desde el origen correcto local o backend 
     * se llama al montar el provider y despues de cada operacion de escritura 
     */
    const hydrate = useCallback(async () => {
        // Espera a que authcontext termine de restaurar la sesion guardada
        if (isLoadingSession) {
            return;
        }

        /**
         * Funcion al iniciar sesion:
         * si el usuario acaba de iniciar sesion paso de true a false
         * sube items del carrito local al backend antes de leerlo 
         * asi no se pierden los productos agregados sin cuenta
         */

        if (isAuthenticated && !prevAuthenticated.current) {
            try {
                await CarritoService.mergerLocalToBackend();
            } catch (error) {
            console.error('Error al fusionar el carrito local con el backend:', error);
            }
        } 

        //Actualiza la referencia para el proximo render
        prevAuthenticated.current = isAuthenticated;

        setLoading(true);
        try {
            //GetCarrito decide internamente si consulta el backend o AsyncStorage
            const snapshot = await CarritoService.getCarrito();
            setItems(snapshot.items);
            setTotalItems(snapshot.totalItems);
            setTotal(snapshot.total);
        } catch {
            // si falla muestra carrito vacio sin productos 
            setItems([]);
            setTotalItems(0);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isLoadingSession]);

    // Se ejecuta cada vez que cambia isAuthenticated o isLoadingSession
    useEffect(() => {
        hydrate();
    }, [hydrate]);

    /**
     * Agregar producto
     * agregar producto al carrito (local o backend) y recarga el estado 
     */

    const agregarProducto = useCallback(async (producto, cantidad) =>{ 
        await CarritoService.addToCarrito({ isAuthenticated, producto, cantidad });
        await hydrate();
    }, [hydrate, isAuthenticated]
);

    /**
     * cambiar cantidad
     * modifica la cantidad de un item ya existente en el carrito
     */
    const cambiarCantidad = useCallback(async (itemId, cantidad) => {
        await CarritoService.updateCantidad({ isAuthenticated, itemId, cantidad });
        await hydrate();
        }, [hydrate, isAuthenticated]
    );

    /**
     * Eliminar item del carrito por si id
     * elimina todos los items del carrito de una vez
     */
    const eliminarItem = useCallback(async (itemId) => {
        await CarritoService.RemoveItem({ isAuthenticated, itemId });
        await hydrate();
    }, [hydrate, isAuthenticated]);

    /**
     * vaciar carrito
     * elimina todos los items del carrito de una vez
     */
    const vaciarCarrito = useCallback(async () => {
        await CarritoService.clearCarrito(isAuthenticated);
        await hydrate();
    }, [hydrate, isAuthenticated]);

    /**
     * useMemo Evita recrear el objeton en cada render innecesario 
     */
    const value= useMemo(
        () => ({
            items, //array de items normalizados
            totalItems, // cantidad total de unidades
            total, // precio total del carrito
            loading, // true mientras se carga 
            refreshCarrito: hydrate, // permite forzar un recargar manual
            agregarProducto, 
            cambiarCantidad,
            eliminarItem,
            vaciarCarrito
        }),
        [items, totalItems, total, loading, hydrate, agregarProducto, eliminarItem, cambiarCantidad, vaciarCarrito]
    );

    return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>

}

    /** 
     * HOOK
     * simplifica el acceso al contexto y lanza un error descriptivo si se usa fuera del arbol de carritoProvider
     */
export function useCarrito() {
    const context = useContext(CarritoContext);
    if (!context ) {
        throw new Error('useCarrito debe usarse dentro de CarritoProvider');
    }

    return context;
}
