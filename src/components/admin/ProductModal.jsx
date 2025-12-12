import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { X, DollarSign, History, Save, Package } from "lucide-react";
import { toast } from "sonner";

export default function ProductModal({ isOpen, onClose, product, categorias, marcas }) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('details');
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        precio_costo: "",
        stock: "", // Unused in UI now, but kept in state if needed or we can remove. I will remove it from initial state.
        cantidad_minima: "",
        dias_garantia: 365,
        categoria_id: "",
        marca_id: "",
        sku: "",
        imagen_url: "",
        activo: true,
    });

    // Load product data when opening for edit
    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({ ...product, id: product.id });
            } else {
                // Reset for new product
                setFormData({
                    nombre: "",
                    descripcion: "",
                    precio: "",
                    precio_costo: "",
                    cantidad_minima: 5,
                    dias_garantia: 365,
                    categoria_id: "",
                    marca_id: "",
                    sku: "",
                    imagen_url: "",
                    activo: true,
                });
            }
            setActiveTab('details');
        }
    }, [isOpen, product]);

    // Fetch Kardex only if tab is active and product exists
    const { data: kardex = [], isLoading: loadingKardex } = useQuery({
        queryKey: ["kardex", product?.id],
        queryFn: async () => {
            if (!product?.id) return [];
            const res = await fetch(`/api/kardex?producto_id=${product.id}`);
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!product?.id && activeTab === 'kardex',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = product ? "PUT" : "POST";

        // Validate
        if (!formData.nombre || !formData.precio || !formData.precio_costo ||
            !formData.categoria_id || !formData.marca_id || !formData.sku ||
            !formData.cantidad_minima || !formData.dias_garantia) {
            toast.error("Por favor completa todos los campos obligatorios");
            return;
        }

        try {
            const res = await fetch("/api/productos", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                queryClient.invalidateQueries(["productos"]);
                toast.success(product ? "Producto actualizado" : "Producto creado exitosamente");
                onClose();
            } else {
                const error = await res.json();
                toast.error(error.message || "Error al guardar producto");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar la solicitud");
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - Fixed to cover everything independently */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[50] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Container Wrapper */}
            <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                {/* Modal Window */}
                <div className="relative bg-[#0B1120] rounded-3xl shadow-2xl w-full max-w-4xl h-[92vh] flex flex-col border border-white/10 overflow-hidden ring-1 ring-white/10 pointer-events-auto animate-in zoom-in-95 duration-200">

                    {/* Modal Header */}
                    <div className="relative px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#0B1120]/50 backdrop-blur-xl shrink-0">
                        {/* Title Section (Left) */}
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                                {product ? "Editar Producto" : "Nuevo Producto"}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {product ? `SKU: ${product.sku || 'N/A'}` : "Ingresa los detalles del nuevo ítem"}
                            </p>
                        </div>

                        {/* Tabs Section (Centered Absolutely) */}
                        {product && (
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:flex bg-white/5 rounded-xl p-1 border border-white/5 hidden">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'details' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Detalles
                                </button>
                                <button
                                    onClick={() => setActiveTab('kardex')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'kardex' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Historial
                                </button>
                            </div>
                        )}

                        {/* Close Button (Right) */}
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 hover:scale-105 transition-all"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Modal Content - Scrollable Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        {activeTab === 'details' ? (
                            <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* General Info Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Package className="h-5 w-5 text-blue-400" />
                                        Información General
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-gray-400 ml-1">Nombre del Producto</label>
                                            <input
                                                required
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all placeholder:text-gray-600 focus:bg-slate-900"
                                                value={formData.nombre}
                                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                placeholder="Ej: Laptop Gamer RTX 4090"
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-medium text-gray-400 ml-1">Descripción</label>
                                            <textarea
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all placeholder:text-gray-600 min-h-[100px] resize-none focus:bg-slate-900"
                                                value={formData.descripcion || ""}
                                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                                placeholder="Describe las características principales..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing & Stock Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-emerald-400" />
                                            Precios
                                        </h3>
                                        <div className="grid gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Precio de Venta</label>
                                                <div className="relative group">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors h-4 w-4" />
                                                    <input
                                                        required
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent outline-none transition-all focus:bg-slate-900 font-mono"
                                                        value={formData.precio}
                                                        onChange={e => setFormData({ ...formData, precio: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Costo de Adquisición</label>
                                                <div className="relative group">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-gray-300 transition-colors h-4 w-4" />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-gray-500/50 focus:border-transparent outline-none transition-all focus:bg-slate-900 font-mono"
                                                        value={formData.precio_costo || ""}
                                                        onChange={e => setFormData({ ...formData, precio_costo: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Package className="h-5 w-5 text-purple-400" />
                                            Inventario & Garantía
                                        </h3>
                                        <div className="grid gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Stock Mínimo (Alerta)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-transparent outline-none transition-all focus:bg-slate-900 font-mono"
                                                    value={formData.cantidad_minima}
                                                    onChange={e => setFormData({ ...formData, cantidad_minima: e.target.value })}
                                                    placeholder="5"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Días de Garantía</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-transparent outline-none transition-all focus:bg-slate-900 font-mono"
                                                    value={formData.dias_garantia}
                                                    onChange={e => setFormData({ ...formData, dias_garantia: e.target.value })}
                                                    placeholder="365"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Classification Section */}
                                <div className="pt-6 border-t border-white/5 space-y-6">
                                    <h3 className="text-lg font-semibold text-white">Clasificación</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400 ml-1">Categoría</label>
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-slate-900"
                                                value={formData.categoria_id || ""}
                                                onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
                                            >
                                                <option value="" className="bg-[#0B1120] text-gray-400">Seleccionar categoría...</option>
                                                {categorias.map(c => <option key={c.id} value={c.id} className="bg-[#0B1120] text-white">{c.nombre}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400 ml-1">Marca</label>
                                            <select
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-slate-900"
                                                value={formData.marca_id || ""}
                                                onChange={e => setFormData({ ...formData, marca_id: e.target.value })}
                                            >
                                                <option value="" className="bg-[#0B1120] text-gray-400">Seleccionar marca...</option>
                                                {marcas.map(m => <option key={m.id} value={m.id} className="bg-[#0B1120] text-white">{m.nombre}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400 ml-1">Código SKU</label>
                                            <input
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all placeholder:text-gray-600 font-mono text-sm"
                                                value={formData.sku || ""}
                                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                                placeholder="GEN-00000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400 ml-1">URL de Imagen</label>
                                            <input
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all placeholder:text-gray-600 text-sm"
                                                value={formData.imagen_url || ""}
                                                onChange={e => setFormData({ ...formData, imagen_url: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <div className="flex flex-col items-center justify-center gap-4 bg-white/5 rounded-xl p-6 border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                                            className={`w-14 h-7 rounded-full transition-colors relative ${formData.activo ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${formData.activo ? 'left-8' : 'left-1'}`} />
                                        </button>
                                        <div className="text-center">
                                            <span className={`block font-medium ${formData.activo ? 'text-emerald-400' : 'text-gray-400'}`}>
                                                {formData.activo ? 'Producto Activo' : 'Producto Inactivo'}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formData.activo ? 'El producto será visible en la tienda' : 'El producto está oculto a los clientes'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="h-full">
                                {loadingKardex ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p>Cargando movimientos...</p>
                                    </div>
                                ) : kardex.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-60">
                                        <History className="h-20 w-20 stroke-1" />
                                        <p className="text-lg">No hay historial de movimientos</p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5">
                                                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                                                    <th className="px-6 py-4 font-semibold">Fecha</th>
                                                    <th className="px-6 py-4 font-semibold">Tipo</th>
                                                    <th className="px-6 py-4 font-semibold">Detalle</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Cant.</th>
                                                    <th className="px-6 py-4 font-semibold text-right">Saldo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {kardex.map((mov) => (
                                                    <tr key={mov.id} className="text-sm hover:bg-white/5 transition-colors">
                                                        <td className="px-6 py-4 text-gray-300">
                                                            {new Date(mov.fecha).toLocaleDateString()}
                                                            <span className="text-gray-600 ml-2 text-xs font-mono">{new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${mov.tipo_movimiento === 'compra' || mov.tipo_movimiento === 'ajuste_entrada'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                }`}>
                                                                {mov.tipo_movimiento.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400">
                                                            {mov.observacion || '-'}
                                                        </td>
                                                        <td className={`px-6 py-4 text-right font-mono font-bold ${mov.cantidad > 0 ? 'text-emerald-400' : 'text-rose-400'
                                                            }`}>
                                                            {mov.cantidad > 0 ? '+' : ''}{mov.cantidad}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-white font-mono">
                                                            {mov.saldo_actual}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {activeTab === 'details' && (
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#0B1120]/50 backdrop-blur-xl shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => document.getElementById('product-form').requestSubmit()}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Save className="h-5 w-5" />
                                Guardar Producto
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
