'use client';

import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Save, Truck, User, Phone, Mail, MapPin } from 'lucide-react';

export default function NuevoProveedorPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/proveedores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al crear el proveedor');
            }

            navigate('/admin/proveedores');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header & Back Button */}
                <div className="flex flex-col gap-4">
                    <Link
                        to="/admin/proveedores"
                        className="inline-flex items-center text-purple-300 hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a Proveedores
                    </Link>

                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-3">
                            <div className="bg-purple-500/20 p-2 rounded-xl backdrop-blur-sm">
                                <Truck className="h-8 w-8 text-purple-300" />
                            </div>
                            Nuevo Proveedor
                        </h1>
                        <p className="text-purple-200/60 mt-2 text-lg">Registra un nuevo socio comercial</p>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl space-y-8">
                    {error && (
                        <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Nombre de la Empresa */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-purple-200/80 flex items-center gap-2 group-focus-within:text-purple-300 transition-colors">
                                <Truck className="h-4 w-4 text-purple-400" />
                                Nombre de la Empresa *
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                placeholder="Ej: Distribuidora Central"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>

                        {/* Nombre de Contacto */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-purple-200/80 flex items-center gap-2 group-focus-within:text-purple-300 transition-colors">
                                <User className="h-4 w-4 text-purple-400" />
                                Nombre de Contacto
                            </label>
                            <input
                                type="text"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                placeholder="Ej: Juan Pérez"
                                value={formData.contacto}
                                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                            />
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-purple-200/80 flex items-center gap-2 group-focus-within:text-purple-300 transition-colors">
                                <Phone className="h-4 w-4 text-purple-400" />
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                placeholder="+591 70000000"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-purple-200/80 flex items-center gap-2 group-focus-within:text-purple-300 transition-colors">
                                <Mail className="h-4 w-4 text-purple-400" />
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                placeholder="contacto@empresa.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        {/* Dirección - Full Width */}
                        <div className="space-y-3 md:col-span-2 group">
                            <label className="text-sm font-medium text-purple-200/80 flex items-center gap-2 group-focus-within:text-purple-300 transition-colors">
                                <MapPin className="h-4 w-4 text-purple-400" />
                                Dirección
                            </label>
                            <textarea
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all h-32 resize-none"
                                placeholder="Dirección completa de la empresa..."
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        >
                            <Save className="h-5 w-5" />
                            {loading ? 'Guardando...' : 'Guardar Proveedor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
