'use client';

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Save, Search, Plus, Trash2, ShoppingCart, DollarSign, Calendar, FileText, User } from 'lucide-react';

export default function NuevaCompraPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);

    // Form State
    const [proveedorId, setProveedorId] = useState('');
    const [numeroFactura, setNumeroFactura] = useState('');
    const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [provRes, prodRes] = await Promise.all([
                fetch('/api/proveedores'),
                fetch('/api/productos')
            ]);

            if (provRes.ok) setProveedores(await provRes.json());
            if (prodRes.ok) setProductos(await prodRes.json());
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Error al cargar datos necesarios');
        }
    };

    const addToCart = (producto) => {
        const existing = cart.find(item => item.producto_id === producto.id);
        if (existing) {
            setCart(cart.map(item =>
                item.producto_id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                producto_id: producto.id,
                nombre: producto.nombre,
                cantidad: 1,
                precio_unitario: producto.precio_costo || 0 // Default to current cost
            }]);
        }
    };

    const updateCartItem = (id, field, value) => {
        setCart(cart.map(item =>
            item.producto_id === id
                ? { ...item, [field]: parseFloat(value) || 0 }
                : item
        ));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.producto_id !== id));
    };

    const total = cart.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

    const handleSubmit = async () => {
        if (!proveedorId) return setError('Selecciona un proveedor');
        if (cart.length === 0) return setError('Agrega al menos un producto');

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/compras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proveedor_id: proveedorId,
                    numero_factura: numeroFactura,
                    fecha_compra: fechaCompra,
                    items: cart
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al guardar la compra');
            }

            navigate('/admin/compras');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const filteredProductos = productos.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex flex-col gap-2">
                    <Link
                        to="/admin/compras"
                        className="inline-flex items-center text-blue-300 hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a Compras
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-xl backdrop-blur-sm">
                            <ShoppingCart className="h-8 w-8 text-blue-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                Nueva Compra
                            </h1>
                            <p className="text-blue-200/60">Registra entrada de mercadería</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-blue-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Save className="h-5 w-5" />
                    {loading ? 'Procesando...' : `Guardar Compra ($${total.toFixed(2)})`}
                </button>
            </div>

            {error && (
                <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 p-4 rounded-xl shrink-0 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    {error}
                </div>
            )}

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Left Column: Form & Product Selection */}
                <div className="w-1/2 flex flex-col gap-6 min-h-0">
                    {/* Purchase Details */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-4 shrink-0 shadow-xl">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-400" />
                            Datos de la Factura
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-200/80">Proveedor</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400/50 h-4 w-4" />
                                    <select
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none"
                                        value={proveedorId}
                                        onChange={(e) => setProveedorId(e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {proveedores.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-200/80">Fecha</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400/50 h-4 w-4" />
                                    <input
                                        type="date"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        value={fechaCompra}
                                        onChange={(e) => setFechaCompra(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium text-blue-200/80">Nº Factura / Referencia</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400/50 h-4 w-4" />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="Ej: FAC-00123"
                                        value={numeroFactura}
                                        onChange={(e) => setNumeroFactura(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Search */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col min-h-0 flex-1 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 bg-black/20">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300/50 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar productos para agregar..."
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 space-y-2 flex-1 custom-scrollbar">
                            {filteredProductos.map(producto => (
                                <button
                                    key={producto.id}
                                    onClick={() => addToCart(producto)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-white/5"
                                >
                                    <div>
                                        <div className="text-white font-medium text-lg">{producto.nombre}</div>
                                        <div className="text-sm text-blue-200/60 mt-1">SKU: {producto.sku || '-'} | Stock: {producto.stock}</div>
                                    </div>
                                    <div className="bg-blue-500/20 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <Plus className="h-5 w-5 text-blue-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Cart */}
                <div className="w-1/2 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col min-h-0 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShoppingCart className="h-6 w-6 text-blue-400" />
                            Detalle de Compra
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium border border-blue-500/30">
                            {cart.length} items
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-blue-200/30 space-y-4">
                                <div className="bg-white/5 p-6 rounded-full">
                                    <ShoppingCart className="h-16 w-16 opacity-50" />
                                </div>
                                <p className="text-lg font-medium">Tu carrito está vacío</p>
                                <p className="text-sm">Agrega productos desde el panel izquierdo</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.producto_id} className="bg-black/20 rounded-2xl p-4 flex items-center gap-4 border border-white/5 hover:border-white/10 transition-colors group">
                                    <div className="flex-1">
                                        <div className="text-white font-medium text-lg mb-2">{item.nombre}</div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-blue-200/60 uppercase tracking-wider">Cant</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-20 bg-slate-900/80 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:border-blue-500/50 outline-none text-center font-mono"
                                                    value={item.cantidad}
                                                    onChange={(e) => updateCartItem(item.producto_id, 'cantidad', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-blue-200/60 uppercase tracking-wider">Costo U.</span>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-blue-400/70" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="w-28 bg-slate-900/80 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-white text-sm focus:border-blue-500/50 outline-none font-mono"
                                                        value={item.precio_unitario}
                                                        onChange={(e) => updateCartItem(item.producto_id, 'precio_unitario', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <div className="text-emerald-400 font-bold text-xl font-mono">
                                            ${(item.cantidad * item.precio_unitario).toFixed(2)}
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.producto_id)}
                                            className="text-rose-400 hover:text-white p-2 hover:bg-rose-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-md">
                        <div className="flex justify-between items-center">
                            <span className="text-blue-200/80 font-medium text-lg">Total a Pagar</span>
                            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-mono">
                                ${total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
