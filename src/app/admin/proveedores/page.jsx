'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Edit, Trash2, Truck, ArrowLeft } from 'lucide-react';

export default function ProveedoresPage() {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        try {
            const res = await fetch('/api/proveedores');
            if (res.ok) {
                const data = await res.json();
                setProveedores(data);
            }
        } catch (error) {
            console.error('Error fetching proveedores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) return;

        try {
            const res = await fetch(`/api/proveedores/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setProveedores(proveedores.filter(p => p.id !== id));
                alert('Proveedor eliminado correctamente');
            } else {
                const data = await res.json();
                alert('Error: ' + (data.error || 'No se pudo eliminar el proveedor'));
            }
        } catch (error) {
            console.error('Error deleting proveedor:', error);
            alert('Error al eliminar el proveedor');
        }
    };

    const filteredProveedores = proveedores.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contacto?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header & Back Button */}
                <div className="flex flex-col gap-4">
                    <Link
                        to="/admin"
                        className="inline-flex items-center text-purple-300 hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al Panel
                    </Link>

                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-3">
                                <div className="bg-purple-500/20 p-2 rounded-xl backdrop-blur-sm">
                                    <Truck className="h-8 w-8 text-purple-300" />
                                </div>
                                Proveedores
                            </h1>
                            <p className="text-purple-200/60 mt-2 text-lg">Gestiona tu red de distribución y contactos</p>
                        </div>
                        <Link
                            to="/admin/proveedores/nuevo"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25 hover:scale-105 font-medium"
                        >
                            <div className="bg-white/20 p-1 rounded-lg">
                                <Plus className="h-5 w-5" />
                            </div>
                            Nuevo Proveedor
                        </Link>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    {/* Search Bar */}
                    <div className="p-6 border-b border-white/10 bg-black/20">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300/50 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o contacto..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-purple-200/70 text-sm uppercase tracking-wider">
                                    <th className="p-6 font-semibold">Nombre</th>
                                    <th className="p-6 font-semibold">Contacto</th>
                                    <th className="p-6 font-semibold">Teléfono</th>
                                    <th className="p-6 font-semibold">Email</th>
                                    <th className="p-6 font-semibold">Estado</th>
                                    <th className="p-6 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-purple-200/50">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                                Cargando proveedores...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProveedores.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-purple-200/50">
                                            No se encontraron proveedores
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProveedores.map((proveedor) => (
                                        <tr key={proveedor.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-bold text-white text-lg">{proveedor.nombre}</div>
                                            </td>
                                            <td className="p-6 text-purple-100/80">{proveedor.contacto || '-'}</td>
                                            <td className="p-6 text-purple-100/80 font-mono">{proveedor.telefono || '-'}</td>
                                            <td className="p-6 text-purple-100/80">{proveedor.email || '-'}</td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${proveedor.activo
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                                    }`}>
                                                    {proveedor.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        to={`/admin/proveedores/editar/${proveedor.id}`}
                                                        className="p-2 hover:bg-purple-500/20 text-purple-300 hover:text-white rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(proveedor.id)}
                                                        className="p-2 hover:bg-rose-500/20 text-rose-300 hover:text-white rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
