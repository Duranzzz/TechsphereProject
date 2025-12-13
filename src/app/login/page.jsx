/**
 * LOGIN PAGE - PÁGINA DE INICIO DE SESIÓN
 * ========================================
 * 
 * RUTA: /login (archivo: src/app/login/page.jsx)
 * 
 * PROPÓSITO:
 * Permitir a usuarios existentes iniciar sesión en el sistema
 * 
 * FLUJO COMPLETO:
 * 1. Usuario ingresa email y password
 * 2. Hace submit del formulario
 * 3. Llama a login() del AuthProvider
 * 4. AuthProvider hace POST a /api/auth/login
 * 5. Servidor valida con Argon2 (ver docs/05-INTERACCION-CON-BD.md)
 * 6. Si exitoso: Guarda usuario en state + localStorage
 * 7. Redirige según rol (admin → /admin, empleado → /admin/ventas, cliente → /tienda)
 * 
 * CARACTERÍSTICAS:
 * • Validación de formulario HTML5 (required, type="email")
 * • Mostrar/ocultar password
 * • Loading state durante autenticación
 * • Manejo de errores
 * • Animaciones con motion
 * • Efectos de mouse parallax
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";  // 🔥 Hook para acceder al AuthProvider
import { Link, useNavigate } from "react-router";
import { ArrowLeft, User, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import NebulaBackground from "@/components/NebulaBackground";

export default function LoginPage() {
    // CONSUMIR AUTHPROVIDER
    // login: Función para iniciar sesión (definida en useAuth.jsx)
    const { login } = useAuth();

    // NAVEGACIÓN PROGRAMÁTICA
    // navigate(): Función para redirigir a otras páginas
    const navigate = useNavigate();

    // ESTADO LOCAL DEL FORMULARIO
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);  // Mostrar/ocultar password
    const [loading, setLoading] = useState(false);            // Estado de carga
    const [error, setError] = useState("");                   // Mensaje de error
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });  // Para efectos visuales

    /**
     * EFECTO: Trackear posición del mouse
     * Para crear efecto de gradiente que sigue al cursor
     */
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    /**
     * HANDLER: Enviar formulario
     * 
     * FLUJO:
     * 1. e.preventDefault() → Evita recarga de página
     * 2. setLoading(true) → Muestra spinner
     * 3. await login() → Llama a AuthProvider
     * 4. Redirige según rol del usuario
     * 5. Si error: Muestra mensaje
     */
    const handleSubmit = async (e) => {
        e.preventDefault();  // IMPORTANTE: Evita que el formulario recargue la página
        setLoading(true);
        setError("");

        try {
            // LLAMAR A AUTHPROVIDER
            // login() envía POST a /api/auth/login
            const user = await login(email, password);

            // REDIRECCIÓN BASADA EN ROL
            // admin → Dashboard administrativo
            // empleado → Nueva venta (su función principal)
            // cliente → Tienda (catálogo de productos)
            if (user.rol === 'admin') {
                navigate('/admin');
            } else if (user.rol === 'empleado') {
                navigate('/admin/ventas/nueva');
            } else {
                navigate('/tienda');
            }
        } catch (err) {
            // MANEJO DE ERRORES
            // Si login() hace throw, cae aquí
            setError("Credenciales inválidas. Inténtalo de nuevo.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* EFECTOS DE FONDO */}
            <NebulaBackground />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradiente que sigue al mouse */}
                <div
                    className="absolute inset-0 opacity-100"
                    style={{
                        background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(56, 189, 248, 0.25), transparent 70%)`
                    }}
                />
            </div>

            {/* FORMULARIO */}
            <div className="w-full max-w-md z-10">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 relative animate-in fade-in zoom-in-95 duration-500">

                    {/* Botón volver */}
                    <Link to="/" className="absolute top-8 left-8 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>

                    {/* HEADER */}
                    <div className="text-center mt-8 mb-10">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                            <LogIn className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                            Bienvenido
                        </h1>
                        <p className="text-gray-400">Ingresa a tu cuenta para continuar</p>
                    </div>

                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mensaje de error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Input Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                            <div className="relative group">
                                {/* Icono */}
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                    <User className="h-5 w-5" />
                                </div>
                                {/* Input real */}
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}  // Actualiza state
                                    placeholder="tu@email.com"
                                    className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}  // Cambiar tipo dinámicamente
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 pl-10 pr-12 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                />
                                {/* Botón mostrar/ocultar password */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Botón Submit */}
                        <button
                            type="submit"
                            disabled={loading}  // Deshabilitar durante carga
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* Mostrar spinner o texto según loading */}
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Iniciar Sesión"}
                        </button>

                        {/* Link a registro */}
                        <div className="text-center pt-2">
                            <p className="text-gray-400">
                                ¿No tienes cuenta?{" "}
                                <Link to="/registro" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

/**
 * CONCEPTOS CLAVE USADOS AQUÍ:
 * 
 * 1. CONTROLLED COMPONENTS (Componentes Controlados)
 *    • value={email} + onChange={(e) => setEmail(e.target.value)}
 *    • El estado de React es la "única fuente de verdad"
 *    • Cada tecla actualiza el state inmediatamente
 * 
 * 2. ASYNC/AWAIT
 *    • await login() espera a que complete la petición
 *    • try-catch maneja errores
 * 
 * 3. CONDITIONAL RENDERING (Renderizado Condicional)
 *    • {error && <div>...</div>} → Solo muestra si hay error
 *    • {loading ? <Spinner /> : "Texto"} → Ternario para alternar
 * 
 * 4. CONTEXT CONSUMPTION (Consumo de Contexto)
 *    • const { login } = useAuth() → Accede al AuthProvider sin props
 * 
 * 5. PROGRAMMATIC NAVIGATION (Navegación Programática)
 *    • navigate('/admin') → Cambia de página sin <Link>
 */
