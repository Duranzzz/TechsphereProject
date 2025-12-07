"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, User, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import NebulaBackground from "@/components/NebulaBackground";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const user = await login(email, password);

            // Redirect based on role
            if (user.rol === 'admin') {
                navigate('/admin');
            } else if (user.rol === 'empleado') {
                navigate('/admin/ventas/nueva');
            } else {
                navigate('/tienda');  // Removed /perfil per user's earlier flow, usually /tienda is better landing
            }
        } catch (err) {
            setError("Credenciales inválidas. Inténtalo de nuevo.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            {/* Background Effects */}
            <NebulaBackground />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 opacity-100"
                    style={{
                        background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(56, 189, 248, 0.25), transparent 70%)`
                    }}
                />
            </div>

            <div className="w-full max-w-md z-10">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 relative animate-in fade-in zoom-in-95 duration-500">

                    <Link to="/" className="absolute top-8 left-8 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>

                    <div className="text-center mt-8 mb-10">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                            <LogIn className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                            Bienvenido
                        </h1>
                        <p className="text-gray-400">Ingresa a tu cuenta para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 pl-10 pr-12 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Iniciar Sesión"}
                        </button>

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
