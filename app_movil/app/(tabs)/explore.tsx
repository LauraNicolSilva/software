/**
 * Pantalla de cuenta pestaña 3 tiene 2 metodos 
 * no autenticado muestra formulario login y registro 
 * autenticado muestra perfil de usuario con opciones de editar datos 
 * acceder al panel admin/aux ver pedidos segun rol 
 */

/**importar componentes de React native para construir la pantalla
 * ActivityIndicator: Spiner de carga circular
 * Alert: Doalogos emergentes nativos del sistema
 * Image: Muestra imagenes
 * Pressable: Area Tactil
 * ScrollView: Contenedor del scroll vertical
 * StyleSheet:  crea estilos de forma optimizada
 * Text: muestra texto plano en la pantalla
 * View:  contenido generico equivale a un div en html y css
 * 
 */

//manejo de variables de estado local 
import { useState } from 'react';

//importar componentes 
import { ActivityIndicator,  KeyboardAvoidingView, Platform,  Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
// Ionicons libreria de iconos vectoriales para react native 
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../../src/context/AuthContext';
// themedText: texto que aplica colores del tema del dispositivos de manera automatica claro a oscuro
import { themedText } from '@/components/ui/themed-text';
// themedView: color de fondo automatico segun el tema del dispositivo
import { themedView } from '@/components/ui/themed-View';


/**
 *  AuthCtx : define la forma del objeto devuelto por UseAuth es necesario
 * Porque AuthContext.js esta en JavaScript no typeScript y el compilador no los reconoce  
 */

type AuthCtx = {
    //user datos del usuario autenticado. null si no inicia sesion
    user: { nombre?: string, email?: string, rol?: string } | null;
    //isAuthenticated: true si hay sesion activa
    isAuthenticated: boolean;
    //isloadign: true mientras se verifica si hay sesion guardada al abrir app
    isLoading: boolean;
    //login: funcion que recibe el email y contraseña lanza error si falla
    login: (email: string, password: string) => Promise<unknown>;
    //register: funcion que registra a un nuevo usuario lanza error si falla
    register: (data: { nombre: string, apellido: string,email: string, password: string, telefono?: string, direcion?: string } ) => Promise<unknown>;
    //logout: funcion de cerrar la sesion del usuario
    logout: () => Promise<void>;
    //updatePerfil: funcion que actualiza los datos del usuario
    updatePerfil: (data: { nombre?: string, email?: string, password?: string, telefono?: string, direcion?: string } ) => Promise<unknown>;
};

//routerPush navega apliando la nueva pantalla permite volver atras con la opcion de atras
// se usa as unknown si para evitar errores de typescript con contextos router

const routerPush = (path: string) => (router as unknown as { push: (p:string) => void}).push(path);

// componente principal del tad de cuenta

export default function TabTwoScreen() {
    const { user, isAuthenticated, isLoading, login, register, logout, updatePerfil } = useAuth() as unknown as AuthCtx;
    // estado del formulario login y registro
    //isRegisterMode true mostrar formulario de registro false mostrar login
    const [ isRegisterMode, setIsRegisterMode ] = useState(false);
    //Campos del formulario de registro y login 
    const [ nombre, setNombre ] = useState('');
    const [ apellido, setApellido ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ ConfirmPassword, setConfirmPassword ] = useState('');
    const [ telefono, setTelefono ] = useState('');
    const [ direccion, setDireccion ] = useState('');
    //loadingSubmit true miewntras se procesa el login o registro evita el doble envio
    const [loadingSubmit, setLoadingSubmit] =useState(false);
    //Maneja la retroalimentacion al usuario(error o exito)
    const [errorMesage, setErrorMessage] = useState('');
    const [successMesage, setSuccessMessage] = useState('');


    // Estado de edicion de perfil 
    //editMode true mostrar campos editables false modo lectura
    const [ editMode, seteditMode ] = useState(false);
    // Campos editables del perfil
    const [ editNombre, setEditNombre ] = useState('');
    const [ editEmail, setEditEmail ] = useState('');
    const [ editPassword, setEditPassword ] = useState('');
    //Guardar cambios 
    const [ savignPerfil, setSavingPerfil] = useState(false);
       //Maneja la retroalimentacion al usuario(error o exito)
    const [perfilerror, setPerfilError] = useState('');
    const [perfilsuccess, setPerfilSuccess] = useState('');

    //Fution resetFeedBack
    //limpia los mensajes de error y exito del formulario login y registro
    const resetFeedback = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    //Funcion: handleLogout
    //Cierra la sesion y resetea todos los campos del formulario para que la pantalla quede limpia cuando el usuario vuelva a ver el formulario
    const handleLogout = async() => {
        await logout(); //llama el contexto de cerrar sesion
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setNombre('');
        setApellido('');
        setTelefono('');
        setDireccion('');
        setIsRegisterMode(false);
        setErrorMessage('');
        setSuccessMessage('');
    }

    //Funcion handlelogin
    //valida y envia el formulario de login o registro segun el modo activo
    const handleSubmit = async () => {
        resetFeedback(); // limpia mensahes anteriores a validar

        if (isRegisterMode) {
            //Validaciones de registro
            // todos los campos marcados con * son obligatorios
            if (!nombre || !apellido || !email || !password || !ConfirmPassword) {
                setErrorMessage('todos los campos son obligatorios *.');
                return;
            }

            // las contraseñas deben coincidir
            if (password !== ConfirmPassword) {
            setErrorMessage('las contraseñas no coinciden')
            return;
            }

            // las contraseñas deben coincidir
            if (password.length < 6) {
            setErrorMessage('las contraseña debe tener al menos 6 caracteres')
            return;
            }

            // Telefono si se proporciona debe ser colombiano (10 digitos y debe empezar con 3)
            if (telefono && !/^\d{10}$/.test(telefono)) {
            setErrorMessage('telefono invalido: 10 digitos iniciando con 3')
            return;
            }
        } else {
            // validacion de login 
            if (!email || !password) {
                setErrorMessage('Ingresa TU CORREO y contraseña');
                return;
            }
        }

        // se activa el spiner y bloquea el boton para evitar multiples envios
        setLoadingSubmit(true);
        try {
            if (isRegisterMode) {
                // llama register() del contexto con los datos del formulario
                // el operador spread condicional... solo incluye telefono/direccion si no estan vacios
                await register({ nombre, apellido, email, password, ...(telefono ? { telefono } : {}),...(direccion ? { direccion } : {})
            });
            setSuccessMessage(' Registro exitoso!, ahora inicie sesion');
            setIsRegisterMode(false); // vuelve al login tras el registro
            //limpia los campos que no se comparten en el formulario de login
            setPassword('');
            setConfirmPassword('');
            setNombre('');
            setApellido('');
            setTelefono('');
            setDireccion('');
            } else {
                // llama login() del context con el email y contraseña
                await login(email, password);
                setSuccessMessage('Inicio de sesion exitoso');
            }
        } catch (error: unknown) {
            // si la backend devuelve error muestra su mensaje, si no muestra uno generico
            setErrorMessage((error as { message?: string})?. message || 'No fue posible completar la accion');
        } finally {
            // siempre desactiva el spiner al terminar exito y error
            setLoadingSubmit(false);
        }
    };

    /**
     * funcion handleGuardarPerfil
     * valida y envia los cambios al perfil del usuario autenticado
     */

    const handleGuardarPerfil = async () => {
        setPerfilError('');
        setPerfilSuccess('');
        // al menos uno de los tres campos tiene que estar modificado
        if (!editNombre.trim() && !editNombre.trim() && !editEmail.trim() && !editPassword.trim()) {
            setPerfilError('Modifica al menos un campo')
            return;
        }
    }
}
