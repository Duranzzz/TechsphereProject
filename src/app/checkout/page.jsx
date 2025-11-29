"use client";

import { useState, useEffect } from "react";
import { Package, ArrowLeft, CheckCircle, CreditCard, Truck, Mail, Phone, User, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function CheckoutPage() {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        metodo_pago: 'efectivo'
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nombre: user.nombre || '',
                email: user.email || '',
                // If we had more user details in the auth token/context, we'd map them here
            }));
        }
    }, [user]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente: {
                        nombre: formData.nombre,
                        apellido: formData.apellido,
                        email: formData.email,
                        telefono: formData.telefono,
                        direccion: formData.direccion
                    },
                    productos: cart.map(item => ({
                        id: item.id,
                        cantidad: item.cantidad
                    })),
                    metodo_pago: formData.metodo_pago
                })
            });

            if (res.ok) {
                setLoading(false);
                setSuccess(true);
                localStorage.removeItem('cart');
                setCart([]);
            } else {
                const error = await res.json();
                setLoading(false);
                alert('Error: ' + (error.error || 'Error al procesar la venta'));
            }
        } catch (error) {
            console.error('Error procesando venta:', error);
            setLoading(false);
            alert('Error al procesar la venta');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/10 animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                        <CheckCircle className="h-12 w-12 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">¡Compra Exitosa!</h2>
                    <p className="text-blue-200/60 mb-8 text-lg">
                        Tu pedido ha sido procesado correctamente.
                    </p>
                    <a
                        href="/"
                        className="block w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/25"
                    >
                        Volver a la Tienda
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <a href="/" className="inline-flex items-center text-blue-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/10">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Volver a la tienda
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Formulario */}
                    <div className="animate-in slide-in-from-left-5 duration-500">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-xl">
                                    <Truck className="h-6 w-6 text-blue-400" />
                                </div>
                                Datos de Envío
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-blue-200/80 ml-1">Nombre</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500"
                                                value={formData.nombre}
                                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                placeholder="Tu nombre"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-blue-200/80 ml-1">Apellido</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500"
                                            value={formData.apellido}
                                            onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                                            placeholder="Tu apellido"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-blue-200/80 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-blue-200/80 ml-1">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="tel"
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500"
                                            value={formData.telefono}
                                            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                            placeholder="+54 9 11..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-blue-200/80 ml-1">Dirección</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                        <textarea
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500"
                                            rows="3"
                                            value={formData.direccion}
                                            onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                            placeholder="Calle, número, ciudad..."
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-blue-200/80 ml-1">Método de Pago</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <select
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all appearance-none"
                                            value={formData.metodo_pago}
                                            onChange={e => setFormData({ ...formData, metodo_pago: e.target.value })}
                                        >
                                            <option value="efectivo" className="bg-slate-900">Efectivo</option>
                                            <option value="tarjeta" className="bg-slate-900">Tarjeta de Crédito/Débito</option>
                                            <option value="transferencia" className="bg-slate-900">Transferencia Bancaria</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || cart.length === 0}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Pagar ${getCartTotal().toFixed(2)}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Resumen de Compra */}
                    <div className="animate-in slide-in-from-right-5 duration-500">
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10 sticky top-8">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="bg-purple-500/20 p-2 rounded-xl">
                                    <Package className="h-6 w-6 text-purple-400" />
                                </div>
                                Resumen del Pedido
                            </h3>

                            {cart.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                    <Package className="h-12 w-12 text-gray-500 mx-auto mb-3 opacity-50" />
                                    <p className="text-gray-400">Tu carrito está vacío</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 py-4 border-b border-white/10 last:border-0 group">
                                            <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                                                {item.imagen_url ? (
                                                    <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="text-gray-600 h-8 w-8" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors">{item.nombre}</h4>
                                                <p className="text-sm text-blue-200/60">Cant: {item.cantidad}</p>
                                            </div>
                                            <p className="font-bold text-emerald-400 text-lg">${(item.precio * item.cantidad).toFixed(2)}</p>
                                        </div>
                                    ))}

                                    <div className="pt-6 mt-6 border-t border-white/10">
                                        <div className="flex justify-between text-xl font-bold text-white">
                                            <span>Total</span>
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                                ${getCartTotal().toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
