"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";
import {
    Package,
    Smartphone,
    Monitor,
    Gamepad2,
    Eye,
    EyeOff,
    ArrowRight
} from "lucide-react";

function MainComponent() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);


    const { signInWithCredentials } = useAuth();

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email || !password) {
            setError("Por favor completa todos los campos");
            setLoading(false);
            return;
        }

        try {
            const res = await signInWithCredentials({
                email,
                password,
                redirect: false, // Prevent automatic redirect to handle errors
            });

            if (res?.error) {
                if (res.error.includes("usuario")) setError("El usuario no existe");
                else if (res.error.includes("contraseña")) setError("La contraseña es incorrecta");
                else setError("Credenciales incorrectas");
            } else {
                // Success
                window.location.href = "/admin";
            }
        } catch (err) {
            setError("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-pink-600/20 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Header con logo */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl inline-block mb-4 shadow-lg shadow-purple-500/20">
                        <Package className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        TechSphere
                    </h1>
                    <p className="text-blue-200/60 mt-2 text-lg">Panel de Administración</p>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10"
                >
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        Bienvenido de nuevo
                    </h2>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-blue-200/80 ml-1">
                                Email
                            </label>
                            <div className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 transition duration-300 blur"></div>
                                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 flex items-center">
                                    <input
                                        required
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@techsphere.com"
                                        className="w-full bg-transparent text-white placeholder-blue-300/30 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-blue-200/80 ml-1">
                                Contraseña
                            </label>
                            <div className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 transition duration-300 blur"></div>
                                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 flex items-center gap-2">
                                    <input
                                        required
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent text-white placeholder-blue-300/30 outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-blue-300/50 hover:text-blue-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-rose-500/20 p-4 border border-rose-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                <p className="text-sm text-rose-300 font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-4 py-3.5 text-lg font-bold text-white transition-all duration-200 shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Ingresar
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <a
                            href="/"
                            className="block w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium text-blue-200 hover:text-white text-center transition-all duration-200"
                        >
                            Volver a la tienda
                        </a>
                    </div>
                </form>

                {/* Decorative icons */}
                <div className="flex justify-center space-x-8 mt-12">
                    <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors duration-300">
                        <Smartphone className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors duration-300">
                        <Monitor className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors duration-300">
                        <Gamepad2 className="h-6 w-6 text-pink-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainComponent;
