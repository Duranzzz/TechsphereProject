import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import StarRating from '@/components/StarRating';
import NebulaBackground from '@/components/NebulaBackground';
import MouseSpotlight from '@/components/MouseSpotlight';
import { ShoppingCart, ArrowLeft, Star, Heart, Share2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ calificacion: 5, comentario: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ya no pasamos ubicacion_id, la API sumará todo el stock global
                const [prodRes, revRes] = await Promise.all([
                    fetch(`/api/products/${id}`),
                    fetch(`/api/products/${id}/reviews`)
                ]);

                if (prodRes.ok) setProduct(await prodRes.json());
                if (revRes.ok) setReviews(await revRes.json());
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar el producto');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product); // Usamos la función del contexto que ya maneja todo
        // El toast ya lo suele manejar el context, si no, descomenta la siguiente línea:
        // toast.success('Producto agregado al carrito');
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Debes iniciar sesión para dejar una reseña');
            navigate('/login');
            return;
        }
        setSubmittingReview(true);
        try {
            const res = await fetch(`/api/products/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newReview, userId: user.id }),
            });

            if (res.ok) {
                toast.success('Reseña publicada');
                setNewReview({ calificacion: 5, comentario: '' });
                const revRes = await fetch(`/api/products/${id}/reviews`);
                if (revRes.ok) setReviews(await revRes.json());
            } else {
                throw new Error('Error al publicar');
            }
        } catch (error) {
            toast.error('Error al publicar reseña');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">
            <NebulaBackground />
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-blue-300 animate-pulse">Cargando producto...</p>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">
            <NebulaBackground />
            <div className="relative z-10 text-center space-y-4">
                <h2 className="text-3xl font-bold">Producto no encontrado</h2>
                <button onClick={() => navigate('/tienda')} className="text-blue-400 hover:text-blue-300 underline">
                    Volver a la tienda
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B1120] text-white selection:bg-blue-500/30">
            <NebulaBackground />
            <MouseSpotlight />

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Navigation Back */}
                <button
                    onClick={() => navigate('/tienda')}
                    className="flex items-center text-gray-400 hover:text-white mb-0.1 group transition-colors px-4 py-2 rounded-xl hover:bg-white/5 w-fit"
                >
                    <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Volver a la tienda
                </button>

                {/* Product Header Section - Minimal */}
                <div className="mb-4 text-center max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight tracking-tight bg-gradient-to-br from-white via-white to-blue-200 bg-clip-text text-transparent">
                        {product.nombre}
                    </h1>

                    <p className="text-base text-gray-400 leading-relaxed font-light max-w-2xl mx-auto">
                        {product.descripcion}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Image Gallery Section */}
                    <div className="flex items-center">
                        <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden bg-[#0F1629]/60 backdrop-blur-xl border border-white/10 shadow-2xl group">
                            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />

                            {/* Floating Badges */}
                            <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                                <span className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20">
                                    Nuevo
                                </span>
                                {parseInt(product.stock) < 5 && parseInt(product.stock) > 0 && (
                                    <span className="bg-orange-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-orange-500/20">
                                        ¡Pocas unidades!
                                    </span>
                                )}
                            </div>

                            <div className="absolute top-6 right-6 z-20 flex gap-2">
                                <button className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-110">
                                    <Share2 className="h-5 w-5" />
                                </button>
                                <button className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-110">
                                    <Heart className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="relative h-full w-full flex items-center justify-center p-8">
                                {product.imagen_url ? (
                                    <img
                                        src={product.imagen_url}
                                        alt={product.nombre}
                                        className="max-h-full max-w-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="text-gray-600 text-6xl">📷</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Info Section */}
                    <div className="flex items-center">
                        <div className="w-full h-full min-h-[420px] bg-[#0F1629]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-center">

                            {/* Rating Badge */}
                            <div className="flex items-center justify-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5 mb-6 w-fit mx-auto">
                                <StarRating rating={Math.round(product.rating_promedio || 0)} />
                                <span className="text-sm text-gray-400 border-l border-white/10 pl-2 ml-1">
                                    {product.total_reviews || 0} reseñas
                                </span>
                            </div>

                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Precio Total</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-bold text-white">
                                            ${parseFloat(product.precio).toFixed(2)}
                                        </span>
                                        {parseInt(product.stock) > 0 ? (
                                            <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                                Disponible ({product.stock} unidades)
                                            </span>
                                        ) : (
                                            <span className="text-red-400 text-sm font-medium flex items-center gap-1">
                                                <div className="w-2 h-2 bg-red-400 rounded-full" />
                                                Agotado
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* Product Specifications */}
                            <div className="mb-8 grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">SKU</span>
                                    <span className="text-white font-mono">{product.sku || 'N/A'}</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Marca</span>
                                    <span className="text-white font-medium">{product.marca_nombre || 'Genérica'}</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Categoría</span>
                                    <span className="text-white font-medium">{product.categoria_nombre || 'General'}</span>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Stock</span>
                                    <span className={`font-medium ${parseInt(product.stock) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {parseInt(product.stock) > 0 ? `${product.stock} Disponibles` : 'Sin Stock'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={parseInt(product.stock) <= 0}
                                    className={`w-full py-4 px-8 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-[0.98] shadow-lg
                                        ${parseInt(product.stock) > 0
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                                        }`}
                                >
                                    <ShoppingCart className="h-6 w-6" />
                                    {parseInt(product.stock) > 0 ? "Agregar al Carrito" : "Agotado Temporalmente"}
                                </button>

                                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                                    <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                        <Truck className="h-6 w-6 text-blue-400" />
                                        <span className="text-xs text-gray-400">Envío Rápido</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                        <ShieldCheck className="h-6 w-6 text-purple-400" />
                                        <span className="text-xs text-gray-400">Garantía</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                        <RotateCcw className="h-6 w-6 text-green-400" />
                                        <span className="text-xs text-gray-400">Devoluciones</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section - More Visible */}
                <div className="border-t border-white/10 pt-8 mt-8">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                            <Star className="h-8 w-8 text-yellow-400" />
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Opiniones</span>
                            de Clientes
                        </h2>
                        <p className="text-gray-400 text-sm">Comparte tu experiencia o lee lo que otros dicen</p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Reviews Grid */}
                        <div className="lg:col-span-7 space-y-6">
                            {reviews.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                                    <Star className="h-12 w-12 text-gray-600 mx-auto mb-4 opacity-50" />
                                    <p className="text-gray-400 text-lg">Aún no hay reseñas.</p>
                                    <p className="text-gray-500 text-sm mt-2">¡Compra este producto y sé el primero en opinar!</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-[#0F1629]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-blue-500/20 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                                    {review.cliente_nombre.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{review.cliente_nombre}</h4>
                                                    <div className="flex gap-1 text-xs text-yellow-500">
                                                        <StarRating rating={review.calificacion} />
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                                                {new Date(review.fecha_review).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed font-light">{review.comentario}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Write Review Panel */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-24 bg-[#1A2035]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    Escribir una reseña
                                </h3>
                                {user ? (
                                    <form onSubmit={handleSubmitReview} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-3">Calificación General</label>
                                            <div className="flex gap-3">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewReview({ ...newReview, calificacion: star })}
                                                        className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${star <= newReview.calificacion ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-gray-700'
                                                            }`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Tu comentario</label>
                                            <textarea
                                                value={newReview.comentario}
                                                onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })}
                                                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all resize-none h-32"
                                                placeholder="¿Qué te pareció el producto?"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="w-full bg-white text-[#0B1120] px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submittingReview ? 'Publicando...' : 'Publicar mi opinión'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-white/5">
                                        <p className="text-gray-400 mb-6 px-4">Inicia sesión para compartir tu experiencia con la comunidad.</p>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
                                        >
                                            Iniciar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}