"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
    User, Mail, Phone, Lock, ArrowRight, ArrowLeft,
    Loader2, CheckCircle, Smartphone, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        password: "",
        confirmPassword: "",
        calle: "",
        ciudad: "",
        estado: "",
        pais: "Bolivia"
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Las contraseñas no coinciden");
        }

        if (formData.password.length < 6) {
            return toast.error("La contraseña debe tener al menos 6 caracteres");
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    telefono: formData.telefono,
                    email: formData.email,
                    password: formData.password,
                    calle: formData.calle,
                    ciudad: formData.ciudad,
                    estado: formData.estado,
                    pais: formData.pais
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("¡Cuenta creada exitosamente!");
                navigate("/login");
            } else {
                toast.error(data.error || "Error al registrarse");
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="w-full max-w-2xl z-10">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12 relative animate-in fade-in zoom-in-95 duration-500">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Volver al inicio
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-400 bg-clip-text text-transparent mb-3">
                            Crear una Cuenta
                        </h1>
                        <p className="text-gray-400 text-lg">Únete a nosotros y empieza a comprar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Nombre <span className="text-blue-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        required
                                        name="nombre"
                                        placeholder="Tu nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Apellido</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        name="apellido"
                                        placeholder="Tu apellido"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email <span className="text-blue-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        placeholder="ejemplo@correo.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Teléfono</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <input
                                        name="telefono"
                                        placeholder="+591 ..."
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Dirección Section */}
                        <div className="border-t border-gray-700/50 pt-6 mt-4">
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Dirección</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Calle / Av. <span className="text-gray-500 text-xs">(Opcional)</span></label>
                                    <input
                                        name="calle"
                                        placeholder="Av. Principal #123"
                                        value={formData.calle}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 px-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Ciudad <span className="text-blue-500">*</span></label>
                                    <input
                                        required
                                        name="ciudad"
                                        placeholder="Ej: La Paz"
                                        value={formData.ciudad}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 px-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Estado / Depto. <span className="text-blue-500">*</span></label>
                                    <input
                                        required
                                        name="estado"
                                        placeholder="Ej: Murillo"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 px-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">País</label>
                                    <input
                                        name="pais"
                                        placeholder="Ej: Bolivia"
                                        value={formData.pais}
                                        onChange={handleChange}
                                        className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 px-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Contraseña <span className="text-blue-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 pl-10 pr-12 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Confirmar Contraseña <span className="text-blue-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    required
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-[#0B1120]/50 border border-gray-700/50 rounded-xl py-3.5 pl-10 pr-12 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all hover:bg-[#0B1120]/70"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-6 w-6" />
                                ) : (
                                    <>
                                        Registrarse y Empezar <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <p className="text-gray-400">
                                ¿Ya tienes una cuenta?{" "}
                                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>

                    </form>
                </div>
            </div >
        </div >
    );
}
