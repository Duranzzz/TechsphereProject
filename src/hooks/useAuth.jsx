/**
 * useAuth - PROVIDER DE AUTENTICACIÓN GLOBAL
 * ===========================================
 * 
 * PROPÓSITO:
 * Gestionar el estado de autenticación en TODA la aplicación.
 * Cualquier componente puede acceder al usuario logueado usando useAuth().
 * 
 * PATRÓN: Context API de React
 * • Context: "Almacén" global de datos
 * • Provider: Componente que "provee" el almacén a sus hijos
 * • Hook: Función para "consumir" el almacén desde cualquier componente
 * 
 * FLUJO DE USO:
 * 1. <AuthProvider> envuelve toda la app (en root.tsx)
 * 2. Cualquier componente usa: const { user, login, logout } = useAuth()
 * 3. El estado es compartido: login en un lugar, visible en todos lados
 * 
 * PERSISTENCIA:
 * • Guarda usuario en localStorage para mantener sesión al recargar
 * • Al cerrar sesión, limpia localStorage
 */

import { createContext, useContext, useState, useEffect } from 'react';

// 1. CREAR CONTEXTO: El "almacén" global
const AuthContext = createContext(null);

/**
 * AuthProvider - COMPONENTE PROVEEDOR
 * 
 * Envuelve la aplicación y proporciona:
 * • user: Objeto con datos del usuario (null si no está logueado)
 * • login: Función para iniciar sesión
 * • register: Función para registrarse
 * • logout: Función para cerrar sesión
 * • loading: Boolean indicando si está cargando datos iniciales
 */
export const AuthProvider = ({ children }) => {
    // ESTADO LOCAL (se comparte globalmente via Context)
    const [user, setUser] = useState(null);       // Usuario actual o null
    const [loading, setLoading] = useState(true);  // ¿Está cargando?

    /**
     * INICIALIZACIÓN: Al montar el componente
     * Revisa si hay un usuario guardado en localStorage
     * (Permite mantener sesión al recargar la página)
     */
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));  // Restaurar sesión
        }
        setLoading(false);  // Ya terminó de cargar
    }, []);  // [] = solo ejecuta 1 vez al montar

    /**
     * LOGIN - Iniciar sesión
     * 
     * FLUJO:
     * 1. Envía credenciales a /api/auth/login
     * 2. Servidor valida con Argon2 (ver docs/05-INTERACCION-CON-BD.md)
     * 3. Si exitoso: Guarda user en state y localStorage
     * 4. Throw error si falla (debe ser manejado con try-catch)
     * 
     * @param {string} email - Email del usuario
     * @param {string} password - Password en texto plano (se hashea en servidor)
     * @returns {Promise<Object>} Usuario logueado
     */
    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // ÉXITO: Guardar usuario en state y localStorage
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            throw error;  // Propagar error para manejo en UI
        }
    };

    /**
     * REGISTER - Registrar nuevo usuario
     * 
     * Similar a login pero llama a /api/auth/register
     * Servidor ejecuta función almacenada registrar_usuario_nuevo()
     * (Ver docs/03-SCRIPTS-SQL.md sección 3.3.1)
     */
    const register = async (nombre, email, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            throw error;
        }
    };

    /**
     * LOGOUT - Cerrar sesión
     * 
     * Simplemente limpia el state y localStorage
     * No necesita llamar al servidor (sesión está en cliente)
     */
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    /**
     * PROVIDER: Hace disponibles los valores a toda la app
     * 
     * value={{ ... }}: Todo lo que está aquí es accesible vía useAuth()
     * children: Todos los componentes hijos (toda la app)
     */
    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * useAuth - HOOK PERSONALIZADO
 * 
 * Permite acceder al contexto de autenticación desde cualquier componente.
 * 
 * EJEMPLO DE USO:
 * ```jsx
 * function Navbar() {
 *     const { user, logout } = useAuth();
 *     
 *     return (
 *         <div>
 *             {user ? (
 *                 <>
 *                     <span>Hola, {user.nombre}</span>
 *                     <button onClick={logout}>Salir</button>
 *                 </>
 *             ) : (
 *                 <Link to="/login">Iniciar sesión</Link>
 *             )}
 *         </div>
 *     );
 * }
 * ```
 * 
 * PROTECCIÓN:
 * • Valida que se use dentro de <AuthProvider>
 * • Lanza error si se usa fuera (ayuda a detectar bugs)
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
