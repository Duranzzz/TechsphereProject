'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Save, Truck, User, Phone, Mail, MapPin } from 'lucide-react';

export default function EditarProveedorPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        contacto: '',
        telefono: '',
        email: '',
        calle: '',
        ciudad: '',
        estado: '',
        pais: 'Bolivia',
        activo: true
    });

    useEffect(() => {
        const fetchProveedor = async () => {
            try {
                const res = await fetch(`/api/proveedores/${id}`);
                if (!res.ok) throw new Error('Error al cargar el proveedor');
                const data = await res.json();
                setFormData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProveedor();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/proveedores/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al actualizar el proveedor');
            }

            navigate('/admin/proveedores');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
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
                            Editar Proveedor
                        </h1>
                        <p className="text-purple-200/60 mt-2 text-lg">Actualiza la información del proveedor</p>
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
                                value={formData.contacto || ''}
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
                                value={formData.telefono || ''}
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
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        {/* Address Fields */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3 group">
                                <label className="text-sm font-medium text-purple-200/80 flex items-center gap-2 group-focus-within:text-purple-300 transition-colors">
                                    <MapPin className="h-4 w-4 text-purple-400" />
                                    Calle / Av. <span className="text-purple-400/50 text-xs">(Opcional)</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    placeholder="Av. Principal #123"
                                    value={formData.calle || ''}
                                    onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-sm font-medium text-purple-200/80 flex items-center gap-2 group-focus-within:text-purple-300 transition-colors">
                                    <MapPin className="h-4 w-4 text-purple-400" />
                                    Ciudad *
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    placeholder="Ej: Santa Cruz"
                                    value={formData.ciudad || ''}
                                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-sm font-medium text-purple-200/80 flex items-center gap-2 group-focus-within:text-purple-300 transition-colors">
                                    <MapPin className="h-4 w-4 text-purple-400" />
                                    Estado / Depto. *
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    placeholder="Ej: Andrés Ibáñez"
                                    value={formData.estado || ''}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3 group">
                                <label className="text-sm font-medium text-purple-200/80 flex items-center gap-2 group-focus-within:text-purple-300 transition-colors">
                                    <MapPin className="h-4 w-4 text-purple-400" />
                                    País
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    placeholder="Ej: Bolivia"
                                    value={formData.pais || ''}
                                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-purple-200/80 flex items-center gap-2">
                                Estado
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, activo: true })}
                                    className={`px-4 py-2 rounded-lg border transition-all ${formData.activo
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                        : 'bg-slate-900/50 border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    Activo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, activo: false })}
                                    className={`px-4 py-2 rounded-lg border transition-all ${!formData.activo
                                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                                        : 'bg-slate-900/50 border-white/10 text-gray-400 hover:bg-white/5'
                                        }`}
                                >
                                    Inactivo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        >
                            <Save className="h-5 w-5" />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
