'use client';

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { ArrowLeft, AlertTriangle, Package, MapPin, TrendingDown, ShoppingCart } from 'lucide-react';

export default function StockBajoPage() {
    const { data: stockBajo = [], isLoading } = useQuery({
        queryKey: ['stock-bajo'],
        queryFn: async () => {
            const response = await fetch('/api/stock-bajo');
            if (!response.ok) throw new Error('Error fetching stock bajo');
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-gradient-to-r from-rose-600 to-orange-600 p-4 rounded-2xl mb-6 inline-block shadow-lg">
                        <AlertTriangle className="h-10 w-10 text-white animate-pulse" />
                    </div>
                    <p className="text-blue-200 text-lg font-medium">Cargando alertas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/admin"
                    className="inline-flex items-center text-blue-300 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Dashboard
                </Link>
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-rose-600 to-orange-600 p-3 rounded-xl shadow-lg">
                        <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                            Alertas de Stock Bajo
                        </h1>
                        <p className="text-blue-200/60">
                            Ubicaciones con inventario crítico - acción requerida
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-200/60 text-sm font-medium mb-1">Ubicaciones en Riesgo</p>
                            <p className="text-3xl font-bold text-rose-400">{stockBajo.length}</p>
                        </div>
                        <div className="bg-rose-500/20 p-3 rounded-xl">
                            <MapPin className="h-8 w-8 text-rose-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-200/60 text-sm font-medium mb-1">Productos Únicos</p>
                            <p className="text-3xl font-bold text-orange-400">
                                {new Set(stockBajo.map(item => item.producto_id)).size}
                            </p>
                        </div>
                        <div className="bg-orange-500/20 p-3 rounded-xl">
                            <Package className="h-8 w-8 text-orange-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-200/60 text-sm font-medium mb-1">Déficit Total</p>
                            <p className="text-3xl font-bold text-yellow-400">
                                {stockBajo.reduce((sum, item) => sum + item.deficit, 0)} unidades
                            </p>
                        </div>
                        <div className="bg-yellow-500/20 p-3 rounded-xl">
                            <TrendingDown className="h-8 w-8 text-yellow-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-black/20">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <AlertTriangle className="h-6 w-6 mr-3 text-rose-400" />
                        Detalle por Ubicación
                    </h2>
                </div>

                {stockBajo.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="bg-emerald-500/20 p-6 rounded-full inline-block mb-4">
                            <Package className="h-16 w-16 text-emerald-400" />
                        </div>
                        <p className="text-xl font-semibold text-emerald-400 mb-2">
                            ¡Todo en orden! 🎉
                        </p>
                        <p className="text-blue-200/60">
                            No hay ubicaciones con stock por debajo del mínimo
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5 text-blue-200/70 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Producto</th>
                                    <th className="px-6 py-4 text-left font-semibold">Ubicación</th>
                                    <th className="px-6 py-4 text-center font-semibold">Stock Actual</th>
                                    <th className="px-6 py-4 text-center font-semibold">Mínimo</th>
                                    <th className="px-6 py-4 text-center font-semibold">Déficit</th>
                                    <th className="px-6 py-4 text-center font-semibold">Urgencia</th>
                                    <th className="px-6 py-4 text-right font-semibold">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stockBajo.map((item, index) => {
                                    const urgencia = item.deficit === 0 ? 'critico' :
                                        item.deficit <= 2 ? 'alto' : 'medio';

                                    return (
                                        <tr key={index} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {item.imagen_url ? (
                                                            <img
                                                                src={item.imagen_url}
                                                                alt={item.producto_nombre}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="h-6 w-6 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-white">
                                                            {item.producto_nombre}
                                                        </div>
                                                        <div className="text-sm text-gray-400 font-mono">
                                                            {item.sku}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-blue-400" />
                                                    <span className="text-blue-200">
                                                        {item.ubicacion_nombre}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-rose-400 text-lg">
                                                    {item.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-blue-200">
                                                    {item.cantidad_minima}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-orange-400">
                                                    {item.deficit}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {urgencia === 'critico' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        CRÍTICO
                                                    </span>
                                                )}
                                                {urgencia === 'alto' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                                        ALTO
                                                    </span>
                                                )}
                                                {urgencia === 'medio' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                                        MEDIO
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to="/admin/compras/nueva"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium opacity-0 group-hover:opacity-100"
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    Ordenar
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
