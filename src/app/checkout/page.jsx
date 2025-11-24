"use client";

import { useState, useEffect } from "react";
import { Package, ArrowLeft, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
        metodo_pago: "efectivo"
    });

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/ventas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cliente: formData,
                    productos: cart,
                    metodo_pago: formData.metodo_pago
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                localStorage.removeItem('cart');
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error al procesar la venta");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Compra Exitosa!</h2>
                    <p className="text-gray-600 mb-8">
                        Tu pedido ha sido procesado correctamente.
                    </p>
                    <a
                        href="/"
                        className="block w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                    >
                        Volver a la Tienda
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <a href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Volver a la tienda
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Formulario */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-sm p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Package className="h-6 w-6 text-blue-600" />
                                Datos de Envío
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.nombre}
                                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.apellido}
                                            onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.telefono}
                                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                    <textarea
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows="3"
                                        value={formData.direccion}
                                        onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                    <select
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.metodo_pago}
                                        onChange={e => setFormData({ ...formData, metodo_pago: e.target.value })}
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                                        <option value="transferencia">Transferencia Bancaria</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || cart.length === 0}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Procesando..." : `Pagar $${getCartTotal().toFixed(2)}`}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Resumen de Compra */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-sm p-8 sticky top-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h3>

                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Tu carrito está vacío</p>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {item.imagen_url ? (
                                                    <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{item.nombre}</h4>
                                                <p className="text-sm text-gray-500">Cant: {item.cantidad}</p>
                                            </div>
                                            <p className="font-bold text-gray-900">${(item.precio * item.cantidad).toFixed(2)}</p>
                                        </div>
                                    ))}

                                    <div className="pt-4 mt-4 border-t border-gray-200">
                                        <div className="flex justify-between text-xl font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>${getCartTotal().toFixed(2)}</span>
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
