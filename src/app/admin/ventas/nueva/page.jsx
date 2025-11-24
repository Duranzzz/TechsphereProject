"use client";

import { useState } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Search, Plus, Trash2, User, ShoppingCart, Save, ArrowLeft } from "lucide-react";

const queryClient = new QueryClient();

function POSContent() {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmpleado, setSelectedEmpleado] = useState("");
    const [clientData, setClientData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
        metodo_pago: "efectivo"
    });
    const [loading, setLoading] = useState(false);

    // Fetch products
    const { data: productos = [] } = useQuery({
        queryKey: ["productos", searchTerm],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchTerm) params.append("search", searchTerm);
            const res = await fetch(`/api/productos?${params}`);
            if (!res.ok) throw new Error("Error");
            return res.json();
        }
    });

    // Fetch employees
    const { data: empleados = [] } = useQuery({
        queryKey: ["empleados"],
        queryFn: async () => {
            const res = await fetch("/api/empleados");
            if (!res.ok) throw new Error("Error");
            return res.json();
        }
    });

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p);
            }
            return [...prev, { ...product, cantidad: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(p => p.id !== id));
    };

    const updateQuantity = (id, qty) => {
        if (qty < 1) return;
        setCart(prev => prev.map(p => p.id === id ? { ...p, cantidad: qty } : p));
    };

    const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert("El carrito está vacío");
        if (!selectedEmpleado) return alert("Selecciona un vendedor");

        setLoading(true);
        try {
            const res = await fetch("/api/ventas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cliente: clientData,
                    productos: cart,
                    empleado_id: selectedEmpleado,
                    metodo_pago: clientData.metodo_pago
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Venta registrada con éxito! ID: " + data.data.ventaId);
                setCart([]);
                setClientData({
                    nombre: "",
                    apellido: "",
                    email: "",
                    telefono: "",
                    direccion: "",
                    metodo_pago: "efectivo"
                });
                setSelectedEmpleado("");
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error al registrar venta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <a href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="h-6 w-6 text-gray-600" />
                </a>
                <h1 className="text-2xl font-bold text-gray-800">Nueva Venta</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Products */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {productos.map(product => (
                            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <div className="h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                                        {product.imagen_url ? (
                                            <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="text-gray-400 h-10 w-10" />
                                        )}
                                    </div>
                                    <h3 className="font-medium text-gray-900 line-clamp-2">{product.nombre}</h3>
                                    <p className="text-blue-600 font-bold mt-1">${Number(product.precio).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                    className="mt-3 w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4" /> Agregar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Cart & Client */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 sticky top-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                            Carrito de Venta
                        </h2>

                        {/* Cart Items */}
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                            {cart.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">Carrito vacío</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-gray-900">{item.nombre}</p>
                                            <p className="text-xs text-gray-500">${item.precio}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-12 p-1 text-center border rounded text-sm"
                                                value={item.cantidad}
                                                onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                                            />
                                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t pt-4 mb-6">
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Client Form */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                <User className="h-4 w-4" /> Datos del Cliente
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    placeholder="Nombre"
                                    className="w-full p-2 border rounded text-sm"
                                    value={clientData.nombre}
                                    onChange={e => setClientData({ ...clientData, nombre: e.target.value })}
                                />
                                <input
                                    placeholder="Apellido"
                                    className="w-full p-2 border rounded text-sm"
                                    value={clientData.apellido}
                                    onChange={e => setClientData({ ...clientData, apellido: e.target.value })}
                                />
                                <input
                                    placeholder="Teléfono"
                                    className="w-full p-2 border rounded text-sm"
                                    value={clientData.telefono}
                                    onChange={e => setClientData({ ...clientData, telefono: e.target.value })}
                                />
                                <input
                                    placeholder="Dirección"
                                    className="w-full p-2 border rounded text-sm"
                                    value={clientData.direccion}
                                    onChange={e => setClientData({ ...clientData, direccion: e.target.value })}
                                />
                            </div>
                            <input
                                placeholder="Email (para auto-registro)"
                                className="w-full p-2 border rounded text-sm"
                                value={clientData.email}
                                onChange={e => setClientData({ ...clientData, email: e.target.value })}
                            />

                            {/* Seller Selection */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Vendedor</label>
                                <select
                                    className="w-full p-2 border rounded text-sm"
                                    value={selectedEmpleado}
                                    onChange={e => setSelectedEmpleado(e.target.value)}
                                >
                                    <option value="">Seleccionar Vendedor...</option>
                                    {empleados.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.nombre} {emp.apellido}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading || cart.length === 0 || !selectedEmpleado}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Save className="h-5 w-5" />
                                {loading ? "Procesando..." : "Registrar Venta"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function POSPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <POSContent />
        </QueryClientProvider>
    );
}
