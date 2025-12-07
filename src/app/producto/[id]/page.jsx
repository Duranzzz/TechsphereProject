import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import StarRating from '@/components/StarRating';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ calificacion: 5, comentario: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
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
        const savedCart = localStorage.getItem('cart');
        const cart = savedCart ? JSON.parse(savedCart) : [];
        const existingItem = cart.find((item) => item.id === product.id);

        let newCart;
        if (existingItem) {
            newCart = cart.map((item) =>
                item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
            );
        } else {
            newCart = [...cart, { ...product, cantidad: 1 }];
        }

        localStorage.setItem('cart', JSON.stringify(newCart));
        toast.success('Producto agregado al carrito');
        // Dispatch event to update cart count in header (if listening)
        window.dispatchEvent(new Event('storage'));
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
                // Refresh reviews
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Producto no encontrado</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => navigate('/tienda')} className="flex items-center text-gray-600 hover:text-gray-900 mb-8">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Volver a la tienda
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="md:flex">
                        {/* Image Section */}
                        <div className="md:w-1/2 bg-gray-100 p-12 flex items-center justify-center">
                            {product.imagen_url ? (
                                <img src={product.imagen_url} alt={product.nombre} className="max-h-96 object-contain" />
                            ) : (
                                <div className="text-gray-400 text-6xl">📷</div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="md:w-1/2 p-8 md:p-12">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nombre}</h1>
                                    <p className="text-sm text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full">
                                        {product.categoria_nombre}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-gray-900">${parseFloat(product.precio).toFixed(2)}</p>
                                    <div className="flex items-center justify-end mt-1">
                                        <StarRating rating={Math.round(product.rating_promedio || 0)} />
                                        <span className="ml-2 text-sm text-gray-500">({product.total_reviews} reseñas)</span>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-6 text-gray-600 leading-relaxed">{product.descripcion}</p>

                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    <ShoppingCart className="h-6 w-6" />
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas de Clientes</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Reviews List */}
                        <div className="space-y-6">
                            {reviews.length === 0 ? (
                                <p className="text-gray-500 italic">No hay reseñas todavía. ¡Sé el primero!</p>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900">{review.cliente_nombre}</h4>
                                            <span className="text-xs text-gray-400">{new Date(review.fecha_review).toLocaleDateString()}</span>
                                        </div>
                                        <StarRating rating={review.calificacion} />
                                        <p className="mt-3 text-gray-600">{review.comentario}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Write Review Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg h-fit">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Escribir una reseña</h3>
                            {user ? (
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Calificación</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setNewReview({ ...newReview, calificacion: star })}
                                                    className={`text-2xl focus:outline-none ${star <= newReview.calificacion ? 'text-yellow-400' : 'text-gray-300'}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
                                        <textarea
                                            value={newReview.comentario}
                                            onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            rows={4}
                                            placeholder="Comparte tu experiencia..."
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50"
                                    >
                                        {submittingReview ? 'Publicando...' : 'Publicar Reseña'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-600 mb-4">Inicia sesión para compartir tu opinión</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
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
    );
}
