/**
 * Pantalla de cuenta pestaña 1 
 * pantalla principal Tienda nuestra el catalogo de productos
 * con un banner hero tarjetas de caracteristicas buscardor de texto 
 * chips de categorias lista de productos a 2 columnas paginacion y un modal de detalle de producto 
 */

/**importar componentes de React native para construir la pantalla
 * hooks de react:
 * useEffect ejecuta el codigo al montar el componente o cuando cambian las depedencias 
 * UseMemo memoriza valores calculados para evitar recalculos innecesarios 
 * UseState maneja variables de estado local 
 * 
 */

//manejo de variables de estado local 
import { useState, useEffect, useMemo } from 'react';
// Dimensios optiene al ancho y alto de la pantalla para hacer diseños responsivos
//Flatlist lista optimiza con virtializacion para mostrar grandes cantidades de datos 
//modal mostrar detalles de contenido en ventana emergente
import { ActivityIndicator,  Platform,  Alert, Dimensions, FlatList, Modal, Image, Pressable, ScrollView, RefreshControl, StyleSheet, TextInput, View } from "react-native";
//importar componentes 
// Ionicons libreria de iconos vectoriales para react native 
import { Ionicons } from "@expo/vector-icons";
//CatalogoService que hace las llamadas a http (API) del backend para productos y categorias 
import  catalogoService from '../../src/services/catalogoService';
// themedText: texto que aplica colores del tema del dispositivos de manera automatica claro a oscuro
import { ThemedText } from '@/components/ui/themed-text';
// themedView: color de fondo automatico segun el tema del dispositivo
import { ThemedView } from '@/components/ui/themed-View';
//useCarrito hook del contexto del carrito para agregar productos
import { useCarrito } from '../../src/context/CarritoContext';

/**
 * Tipo Carrito Ctx 
 * describe los campos que se usan de useCarrito en pantalla
 */

type CarritoCtx = {
    //agregarProducto: agregar producto al carrito con la cantidad indicada
    agregarProducto: (producto: unknown, cantidad: number) => Promise<void>;
    //totalItems numero total de items en el carrito 
    totalItems: number;
};

/**
 * constantes globales 
 * se calculan un sola vez al cargar el modulo 
 */

// SREEN_WIDTH ancho de dispositivo en dp (density independent pixles) para diseños responsivos
const { width: SCREEN_WIDTH } = Dimensions.get('window');
//carld_gap espacio horizontal entre las 2 columnas de la tarjeta de producto
const CARD_GAP = 10;
//card_width ancho de cada tarjeta calculado para que quepan exactamente 2 por fila en dos colunmas
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_GAP) /2;
//ITEMS_POR_PAGINA numero de productos por pagina usando paginacion 
const ITEMS_POR_PAGINA = 15;

const FEATURES = [
    { icon: 'cube-outline', title: 'Envío Rápido', desc: 'Recibe en tu hogar', color: '#6366f1', bg: '#eef2ff' },
    { icon: 'shield-checkmark', title: 'Compra Segura', desc: 'Datos protegidos', color: '#10b981', bg: '#d1fae5' },
    { icon: 'headset', title: 'Atención 24/7', desc: 'Siempre disponibles', color: '#06b6d4', bg: '#cffafe' },
] as const;

/**
 * Componente principal HOME SCREEN 
 */

export default function HomeScreen() {
    // Extrae las funciones del carrito necesarias para la pantalla 
    const { agregarProducto, totalItems } = useCarrito() as CarritoCtx;

    /**
     * Estado de datos
     * productos lista completa de productos traidas del backend 
     */
    const [ productos, SetProductos ] = useState<any[]>([])
    //categorias listas de categorias traida al backend
    const [ categorias, SetCategorias] = useState<any[]>([])

    //Estados de UI
    //Loading true mientras cargan los datos por primera vez
    const [loading, setLoading ] = useState(true);
    //refreshing true mientras el usuario hace pull to refresh 
    const [refreshing, setRefreshing] = useState(false);
    //Error mensaje de error si falla la carga 
    const [errorMessage, SetErrorMessage] = useState('');
    //busqueda texto de campo  de busqueda filtra productos en tiempo real
    const [busqueda, setBusqueda] = useState('');
    // categoriaActiva id de la categoria seleccionada o al para ver todas 
    const [categoriaActiva, setCategoriaActiva] = useState<any>('all');   
    // productoDetalle producto seleccionado para ver el modal 
    const [productoDetalle, setProductoDetalle] = useState<any>(null);
    //paginaActual numero de la pagina activa para la paginacion empieza en 1
    const [paginaActual, setPaginaActual] = useState(1);
    //ITEMS_POR_PAGINA numero de productos por pagina
    const ITEMS_POR_PAGINA = 15;
}
