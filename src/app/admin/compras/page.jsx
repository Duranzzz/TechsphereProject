'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Search, ShoppingCart, Calendar, FileText, ArrowLeft } from 'lucide-react';

export default function ComprasPage() {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCompras();
    }, []);

    const fetchCompras = async () => {
        try {
            const res = await fetch('/api/compras');
            if (res.ok) {
                const data = await res.json();
                setCompras(data);
            }
        } catch (error) {
            console.error('Error fetching compras:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompras = compras.filter(c =>
        c.proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header & Back Button */}
                <div className="flex flex-col gap-4">
                    <Link
                        to="/admin"
                        className="inline-flex items-center text-blue-300 hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al Panel
                    </Link>

                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-xl backdrop-blur-sm">
                                    <ShoppingCart className="h-8 w-8 text-blue-300" />
                                </div>
                                Compras
                            </h1>
                            <p className="text-blue-200/60 mt-2 text-lg">Gestiona tus adquisiciones e inventario</p>
                        </div>
                        <Link
                            to="/admin/compras/nueva"
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 hover:scale-105 font-medium"
                        >
                            <div className="bg-white/20 p-1 rounded-lg">
                                <Plus className="h-5 w-5" />
                            </div>
                            Nueva Compra
                        </Link>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    {/* Search Bar */}
                    <div className="p-6 border-b border-white/10 bg-black/20">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300/50 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Buscar por proveedor o factura..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-blue-200/70 text-sm uppercase tracking-wider">
                                    <th className="p-6 font-semibold">Fecha</th>
                                    <th className="p-6 font-semibold">Proveedor</th>
                                    <th className="p-6 font-semibold">Nº Factura</th>
                                    <th className="p-6 font-semibold">Total</th>
                                    <th className="p-6 font-semibold">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-blue-200/50">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                Cargando compras...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCompras.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-blue-200/50">
                                            No se encontraron compras
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCompras.map((compra) => (
                                        <tr key={compra.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6 text-blue-100/80">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-blue-400" />
                                                    {new Date(compra.fecha_compra).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-6 font-medium text-white">{compra.proveedor_nombre || 'Desconocido'}</td>
                                            <td className="p-6 text-blue-100/80 font-mono">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-blue-400" />
                                                    {compra.numero_factura || '-'}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="font-bold text-emerald-400 text-lg">
                                                    ${Number(compra.total).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                    {compra.estado}
                                                </span>
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
