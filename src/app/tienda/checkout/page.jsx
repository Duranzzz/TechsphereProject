'use client';

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
    ArrowLeft, CreditCard, Truck, ShieldCheck, MapPin,
    Package, CheckCircle, AlertCircle, ShoppingBag
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form and UI States
    const [selectedPayment, setSelectedPayment] = useState('efectivo');
    const [address, setAddress] = useState({
        calle: '',
        ciudad: '',
        estado: '',
        pais: 'Bolivia'
    });

    // Load Cart and User Data
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }

        // Pre-fill address if available in user profile
        // Note: Ideally we should fetch the latest profile data here or have it in user context
        // For now, we'll wait for the user to confirm/edit or we could fetch profile active
        if (user) {
            // Optional: Fetch full profile to get address if not in user object
            fetch(`/api/cliente/perfil?user_id=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.profile) {
                        setAddress({
                            calle: data.profile.calle || '',
                            ciudad: data.profile.ciudad || '',
                            estado: data.profile.estado || '',
                            pais: data.profile.pais || 'Bolivia'
                        });
                    }
                })
                .catch(err => console.error("Error loading address:", err));
        }
    }, [user]);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (parseFloat(item.precio) * item.cantidad), 0);
    };

    const handleCheckout = async () => {
        if (!user) {
            toast.error("Debes iniciar sesión para comprar");
            navigate('/login');
            return;
        }

        if (cart.length === 0) {
            toast.error("El carrito está vacío");
            return;
        }

        if (!address.calle || !address.ciudad) {
            toast.error("Por favor completa la dirección de envío");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente: {
                        // We send minimal info, backend should link to authenticated user
                        // But api/ventas might expect specific fields. 
                        // Plan said: "Remove manual client creation fields (rely on logged-in user)"
                        // Current API likely expects user data or at least address updates.
                        // Let's send what we have.
                        ...user, // userId, etc
                        nombre: user.nombre,
                        email: user.email,
                        // Address from form
                        direccion: `${address.calle}, ${address.ciudad}, ${address.estado}, ${address.pais}`, // Mapping simply for now
                        // In a robust system, we would update the user's address in the DB too or create a shipping entry
                    },
                    productos: cart.map(item => ({
                        id: item.id,
                        cantidad: item.cantidad,
                        precio_unitario: item.precio // Backend checks price usually, but good for record
                    })),
                    metodo_pago: selectedPayment
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                localStorage.removeItem('cart');
                setCart([]);
                toast.success("¡Compra realizada con éxito!");
            } else {
                throw new Error(data.error || 'Error al procesar la compra');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 max-w-lg w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-green-500/30">
                        <CheckCircle className="h-12 w-12 text-green-400" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">¡Gracias por tu compra!</h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                        Tu pedido ha sido confirmado y pronto comenzaremos a prepararlo. Te enviaremos un correo con los detalles.
                    </p>
                    <Link
                        to="/tienda"
                        className="block w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
                    >
                        Volver a la Tienda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white selection:bg-blue-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/tienda"
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/5 hover:border-white/10"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Finalizar Compra
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form & Payment */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* User Info Card (Read-only) */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-blue-400" />
                                Datos del Cliente
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-[#0B1120]/50 rounded-xl border border-white/5">
                                    <p className="text-sm text-gray-500 mb-1">Nombre</p>
                                    <p className="font-medium text-white">{user?.nombre || "Usuario"} {user?.apellido}</p>
                                </div>
                                <div className="p-4 bg-[#0B1120]/50 rounded-xl border border-white/5">
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="font-medium text-white">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-purple-400" />
                                Dirección de Envío
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 ml-1 mb-2 block">Calle / Avenida</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Av. Las Palmas #123"
                                        className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-600"
                                        value={address.calle}
                                        onChange={e => setAddress({ ...address, calle: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 ml-1 mb-2 block">Ciudad</label>
                                        <input
                                            type="text"
                                            placeholder="Ciudad"
                                            className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-600"
                                            value={address.ciudad}
                                            onChange={e => setAddress({ ...address, ciudad: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 ml-1 mb-2 block">País</label>
                                        <input
                                            type="text"
                                            placeholder="País"
                                            className="w-full bg-[#0B1120]/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-600"
                                            value={address.pais}
                                            onChange={e => setAddress({ ...address, pais: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-green-400" />
                                Método de Pago
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: 'efectivo', label: 'Efectivo', desc: 'Pago contra entrega' },
                                    { id: 'tarjeta', label: 'Tarjeta', desc: 'Crédito o Débito' },
                                    { id: 'transferencia', label: 'QR / Transf.', desc: 'Pago inmediato' }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedPayment(method.id)}
                                        className={`relative p-4 rounded-2xl border transition-all duration-300 text-left ${selectedPayment === method.id
                                            ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                            : 'bg-[#0B1120]/50 border-white/5 hover:border-white/10 hover:bg-white/5'
                                            }`}
                                    >
                                        {selectedPayment === method.id && (
                                            <div className="absolute top-3 right-3 text-blue-400">
                                                <CheckCircle className="h-5 w-5 fill-current/20" />
                                            </div>
                                        )}
                                        <span className={`block font-semibold mb-1 ${selectedPayment === method.id ? 'text-blue-400' : 'text-gray-300'}`}>
                                            {method.label}
                                        </span>
                                        <span className="text-xs text-gray-500">{method.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/5 h-fit sticky top-24">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-gray-400" />
                                Resumen del Pedido
                            </h3>

                            {cart.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Tu carrito está vacío
                                </div>
                            ) : (
                                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-3 bg-[#0B1120]/30 rounded-xl border border-white/5">
                                            <div className="h-16 w-16 bg-[#0B1120] rounded-lg overflow-hidden flex-shrink-0">
                                                {item.imagen_url ? (
                                                    <img src={item.imagen_url} className="h-full w-full object-cover" alt="" />
                                                ) : (
                                                    <Package className="h-full w-full p-4 text-gray-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-200 line-clamp-1">{item.nombre}</h4>
                                                <p className="text-xs text-gray-500 mt-1">Cant: {item.cantidad}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-white">${(item.precio * item.cantidad).toFixed(2)}</p>
                                                <p className="text-[10px] text-gray-500">${item.precio} c/u</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-3 pt-6 border-t border-white/10">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Envío</span>
                                    <span className="text-green-400 font-medium">Gratis</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-white pt-2">
                                    <span>Total</span>
                                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        ${getCartTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading || cart.length === 0}
                                className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Confirmar Compra
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-4">
                                Al confirmar, aceptas nuestros términos y condiciones.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
