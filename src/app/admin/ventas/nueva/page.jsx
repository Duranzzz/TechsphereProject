"use client";

import { useState, useEffect } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Search, Plus, Trash2, User, ShoppingCart, Save, Package, Minus, LogOut, CreditCard, MapPin } from "lucide-react";
import { toast } from "sonner";

const queryClient = new QueryClient();

function POSPage() {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [clientSearch, setClientSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedMetodoPago, setSelectedMetodoPago] = useState("1");
    const [direccionesCliente, setDireccionesCliente] = useState([]);
    const [selectedDireccion, setSelectedDireccion] = useState("");
    const [isClientInputFocused, setIsClientInputFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user, logout } = useAuth();

    // Fetch productos (Global)
    const { data: productos = [] } = useQuery({
        queryKey: ["productos", searchTerm],
        queryFn: async () => {
            const res = await fetch(`/api/productos?search=${searchTerm}`);
            if (!res.ok) throw new Error("Error fetching products");
            return res.json();
        }
    });

    // Fetch clientes
    const { data: clientes = [] } = useQuery({
        queryKey: ["clientes", clientSearch],
        queryFn: async () => {
            const res = await fetch(`/api/clientes?search=${clientSearch}`);
            if (!res.ok) throw new Error("Error fetching clients");
            return res.json();
        }
    });

    // Fetch Payment Methods
    const { data: metodosPago = [] } = useQuery({
        queryKey: ["metodos-pago"],
        queryFn: async () => {
            const res = await fetch("/api/metodos-pago");
            if (!res.ok) throw new Error("Error fetching payment methods");
            return res.json();
        }
    });

    // Fetch direcciones cuando se selecciona un cliente
    useEffect(() => {
        if (selectedClient?.user_id) {
            fetch(`/api/cliente/direcciones?user_id=${selectedClient.user_id}`)
                .then(res => res.json())
                .then(data => {
                    setDireccionesCliente(data || []);
                    if (data && data.length > 0) {
                        setSelectedDireccion(data[0].id);
                    }
                })
                .catch(err => {
                    console.error('Error fetching direcciones:', err);
                    setDireccionesCliente([]);
                });
        } else {
            setDireccionesCliente([]);
            setSelectedDireccion("");
        }
    }, [selectedClient]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
            }
            return [...prev, { ...product, cantidad: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(prev => prev.map(item => item.id === id ? { ...item, cantidad: newQuantity } : item));
    };

    const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    const handleSubmit = async () => {
        if (cart.length === 0) return toast.error("El carrito está vacío");
        if (!selectedClient) return toast.error("Seleccione un cliente");
        if (!selectedDireccion) return toast.error("Seleccione una dirección de envío");
        if (!user?.empleado_id) return toast.error("Error: No se identificó al vendedor (Ud).");
        if (!selectedMetodoPago) return toast.error("Seleccione un método de pago");

        setLoading(true);
        try {
            const res = await fetch("/api/ventas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cliente: { id: selectedClient.id },
                    productos: cart.map(item => ({ id: item.id, cantidad: item.cantidad })),
                    empleado_id: user.empleado_id,
                    metodo_pago: selectedMetodoPago,
                    direccion_id: selectedDireccion
                    // ubicacion_id se maneja autom. en backend por trigger
                })
            });

            if (res.ok) {
                toast.success("Venta registrada con éxito");
                setCart([]);
                setSelectedClient(null);
                setClientSearch("");
                setSelectedMetodoPago("1");
                setDireccionesCliente([]);
                setSelectedDireccion("");
            } else {
                const error = await res.json();
                toast.error("Error: " + error.error);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error al procesar la venta");
        } finally {
            setLoading(false);
        }
    };

    // ... (El resto del JSX se mantiene igual, pero SIN el bloque "Location Selector")
    // Para simplificarte, copia el JSX de abajo que ya no tiene el selector:

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={async () => {
                            await logout();
                            window.location.href = '/';
                        }}
                        className="p-3 bg-white/5 hover:bg-rose-500/20 rounded-xl transition-colors border border-white/10 group bg-rose-500/10"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="h-6 w-6 text-rose-400 group-hover:text-rose-500" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            Nueva Venta
                        </h1>
                        <p className="text-blue-200/60 text-sm">Punto de Venta - Vendedor: {user?.nombre || '...'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Products */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Search */}
                        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/10">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300/50 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar productos por nombre o SKU..."
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-blue-300/30 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {productos.map(product => (
                                <div key={product.id} className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10">
                                    <div>
                                        <div className="h-32 bg-slate-800/50 rounded-xl mb-3 overflow-hidden flex items-center justify-center border border-white/5 relative">
                                            {product.imagen_url ? (
                                                <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <Package className="text-gray-600 h-10 w-10 opacity-50" />
                                            )}
                                            {product.stock <= 5 && (
                                                <div className="absolute top-2 right-2 bg-rose-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                                    {product.stock === 0 ? 'AGOTADO' : 'POCO STOCK'}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-medium text-white line-clamp-2 min-h-[2.5rem]">{product.nombre}</h3>
                                        <div className="flex justify-between items-end mt-2">
                                            <p className="text-emerald-400 font-bold text-lg">${Number(product.precio).toFixed(2)}</p>
                                            <p className="text-xs text-blue-200/50">Stock Total: {product.stock}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock <= 0}
                                        className="mt-3 w-full bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-blue-500/20 hover:border-blue-500"
                                    >
                                        <Plus className="h-4 w-4" /> Agregar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Cart & Client */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/10 sticky top-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
                                <div className="bg-purple-500/20 p-2 rounded-xl">
                                    <ShoppingCart className="h-5 w-5 text-purple-400" />
                                </div>
                                Carrito de Venta
                            </h2>

                            {/* Cart Items code same as before... */}
                            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                        <ShoppingCart className="h-12 w-12 text-gray-500 mx-auto mb-3 opacity-30" />
                                        <p className="text-gray-500">Carrito vacío</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                                            <div className="flex-1 min-w-0 mr-3">
                                                <p className="font-medium text-sm text-white truncate">{item.nombre}</p>
                                                <p className="text-xs text-emerald-400 font-mono">${item.precio}</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-1 border border-white/10">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                                                    className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-sm font-bold text-white w-4 text-center">{item.cantidad}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                                    className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="ml-2 p-2 text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-white/10 pt-4 mb-6">
                                <div className="flex justify-between text-xl font-bold text-white items-end">
                                    <span className="text-sm text-gray-400 font-normal mb-1">Total a Pagar</span>
                                    <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Client & Payment Section */}
                            <div className="space-y-4 border-t border-white/10 pt-6">
                                <h3 className="font-medium text-blue-200/80 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <User className="h-4 w-4" /> Cliente y Pago
                                </h3>

                                {selectedClient ? (
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex justify-between items-center group">
                                        <div>
                                            <p className="text-white font-medium">{selectedClient.nombre} {selectedClient.apellido}</p>
                                            <p className="text-xs text-blue-300/60">{selectedClient.email || 'Sin email'}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedClient(null)}
                                            className="p-2 hover:bg-rose-500/20 text-blue-300 hover:text-rose-400 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <input
                                            placeholder="Buscar cliente (Nombre/Tel) o ver todos..."
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-600"
                                            value={clientSearch}
                                            onChange={e => setClientSearch(e.target.value)}
                                            onFocus={() => setIsClientInputFocused(true)}
                                            onBlur={() => setTimeout(() => setIsClientInputFocused(false), 200)}
                                        />
                                        <Search className="absolute right-4 top-3 h-4 w-4 text-gray-500" />

                                        {/* Mostrar dropdown solo cuando input está en focus */}
                                        {isClientInputFocused && clientes.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
                                                {clientes.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => {
                                                            setSelectedClient(c);
                                                            setClientSearch("");
                                                        }}
                                                        className="w-full text-left p-3 hover:bg-blue-600/20 border-b border-white/5 last:border-0 transition-colors flex justify-between items-center group"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium text-white group-hover:text-blue-200">{c.nombre} {c.apellido}</p>
                                                            <p className="text-xs text-gray-500 group-hover:text-blue-300/50">{c.telefono || c.email}</p>
                                                        </div>
                                                        <User className="h-4 w-4 text-gray-600 group-hover:text-blue-400" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <label className="block text-xs font-medium text-blue-200/60 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" /> Método de Pago
                                    </label>
                                    <select
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-white/5"
                                        value={selectedMetodoPago}
                                        onChange={e => setSelectedMetodoPago(e.target.value)}
                                    >
                                        {metodosPago.map(mp => (
                                            <option key={mp.id} value={mp.id} className="bg-slate-900 text-white py-2">
                                                {mp.nombre.charAt(0).toUpperCase() + mp.nombre.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dirección de Envío */}
                                {direccionesCliente.length > 0 && (
                                    <div className="pt-2">
                                        <label className="block text-xs font-medium text-blue-200/60 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Dirección de Envío
                                        </label>
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-white/5"
                                            value={selectedDireccion}
                                            onChange={e => setSelectedDireccion(e.target.value)}
                                        >
                                            {direccionesCliente.map(dir => (
                                                <option key={dir.id} value={dir.id} className="bg-slate-900 text-white py-2">
                                                    {dir.calle}, {dir.ciudad} - {dir.estado}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || cart.length === 0 || !selectedClient || !selectedDireccion || !user?.empleado_id}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                                >
                                    <Save className="h-5 w-5" />
                                    {loading ? "Procesando..." : "Registrar Venta"}
                                </button>

                                {!user?.empleado_id && (
                                    <p className="text-xs text-rose-400 text-center mt-2">Error: Usuario no identificado como vendedor.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <POSPage />
        </QueryClientProvider>
    );
}