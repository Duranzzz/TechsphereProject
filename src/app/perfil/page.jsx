import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';

export default function Perfil() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [ventas, setVentas] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user?.id) {
            const fetchData = async () => {
                try {
                    const [statsRes, ventasRes, reviewsRes] = await Promise.all([
                        fetch(`/api/users/${user.id}/stats`),
                        fetch(`/api/users/${user.id}/ventas`),
                        fetch(`/api/users/${user.id}/reviews`)
                    ]);

                    if (statsRes.ok) setStats(await statsRes.json());
                    if (ventasRes.ok) setVentas(await ventasRes.json());
                    if (reviewsRes.ok) setReviews(await reviewsRes.json());
                } catch (error) {
                    console.error('Error fetching profile data:', error);
                    toast.error('Error al cargar datos del perfil');
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchData();
        }
    }, [user]);

    if (loading || !user) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Mi Perfil</h1>
                        <p className="text-gray-400">Bienvenido, {user.nombre}</p>
                    </div>
                    <div className="flex gap-4">
                        {(user.rol === 'admin' || user.rol === 'empleado') && (
                            <Link to="/admin" className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition">
                                Panel Admin
                            </Link>
                        )}
                        <button onClick={logout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-gray-400 text-sm font-medium">Total Compras</h3>
                        <p className="text-2xl font-bold mt-2">{stats?.ventas || 0}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-gray-400 text-sm font-medium">Total Gastado</h3>
                        <p className="text-2xl font-bold mt-2">${stats?.total_gastado?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h3 className="text-gray-400 text-sm font-medium">Mis Reseñas</h3>
                        <p className="text-2xl font-bold mt-2">{stats?.reviews || 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order History */}
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold">Historial de Compras</h2>
                        </div>
                        <div className="p-6">
                            {ventas.length === 0 ? (
                                <p className="text-gray-400">No has realizado compras aún.</p>
                            ) : (
                                <div className="space-y-4">
                                    {ventas.map((venta) => (
                                        <div key={venta.id} className="border border-gray-700 rounded p-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-indigo-400">#{venta.codigo_venta}</span>
                                                <span className="text-sm text-gray-400">{new Date(venta.fecha).toLocaleDateString()}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {venta.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span>{item.cantidad}x {item.producto}</span>
                                                        <span>${item.precio}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between font-bold">
                                                <span>Total</span>
                                                <span>${venta.total}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold">Mis Reseñas</h2>
                        </div>
                        <div className="p-6">
                            {reviews.length === 0 ? (
                                <p className="text-gray-400">No has escrito reseñas aún.</p>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border border-gray-700 rounded p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <img src={review.producto_imagen} alt={review.producto_nombre} className="w-10 h-10 object-cover rounded" />
                                                <div>
                                                    <h4 className="font-medium">{review.producto_nombre}</h4>
                                                    <div className="flex text-yellow-400 text-sm">
                                                        {'★'.repeat(review.calificacion)}{'☆'.repeat(5 - review.calificacion)}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm">{review.comentario}</p>
                                            <p className="text-xs text-gray-500 mt-2">{new Date(review.fecha_review).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
