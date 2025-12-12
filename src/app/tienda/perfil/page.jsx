"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router";
import {
    User, Lock, ShieldAlert, LogOut, ShoppingBag,
    DollarSign, Star, ArrowLeft, Save, Eye, EyeOff,
    CreditCard, Clock, Activity, MapPin, Plus, Trash2, CheckCircle, Edit
} from "lucide-react";
import { toast } from "sonner";

import NebulaBackground from "@/components/NebulaBackground";
import MouseSpotlight from "@/components/MouseSpotlight";

export default function ProfilePage() {
    const { user, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("resumen");
    const [profileData, setProfileData] = useState(null);
    const [stats, setStats] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Form states
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        calle: "",
        ciudad: "",
        estado: "",
        pais: "Bolivia",
        foto_url: ""
    });
    const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "", confirm_password: "" });
    const [deactivatePassword, setDeactivatePassword] = useState("");

    // Address state
    const [addresses, setAddresses] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({ alias: "", calle: "", ciudad: "", estado: "", pais: "Bolivia", es_principal: false });

    // Reviews state
    const [editingReview, setEditingReview] = useState(null);

    // UI states
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false, deactivate: false });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login");
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user?.id) {
            fetchProfile();
            fetchAddresses();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/cliente/perfil?user_id=${user.id}`, { cache: 'no-store' });
            const data = await res.json();

            if (res.ok) {
                setProfileData({ ...data.profile, reviews: data.reviews });
                setStats(data.stats);
                setFormData({
                    nombre: data.profile.nombre || "",
                    apellido: data.profile.apellido || "",
                    email: data.profile.email || "",
                    telefono: data.profile.telefono || "",
                    calle: data.profile.calle || "",
                    ciudad: data.profile.ciudad || "",
                    estado: data.profile.estado || "",
                    pais: data.profile.pais || "Bolivia",
                    foto_url: data.profile.foto_url || ""
                });
            }
            setProfileLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            setProfileLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await fetch(`/api/cliente/direcciones?user_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/cliente/direcciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...addressForm, user_id: user.id })
            });
            if (res.ok) {
                toast.success("Dirección agregada");
                setShowAddressModal(false);
                setAddressForm({ alias: "", calle: "", ciudad: "", estado: "", pais: "Bolivia", es_principal: false });
                fetchAddresses();
                // Refresh profile to update "summary" address if principal changed
                if (addressForm.es_principal) fetchProfile();
            } else {
                toast.error("Error al agregar dirección");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm("¿Eliminar esta dirección?")) return;
        try {
            const res = await fetch(`/api/cliente/direcciones/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id })
            });
            if (res.ok) {
                toast.success("Dirección eliminada");
                fetchAddresses();
            } else {
                toast.error("Error al eliminar");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleSetPrincipal = async (id) => {
        try {
            const res = await fetch(`/api/cliente/direcciones/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, action: "set_principal" })
            });
            if (res.ok) {
                toast.success("Establecida como principal");
                fetchAddresses();
                fetchProfile(); // Update summary
            } else {
                toast.error("Error al actualizar");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setAddressForm({
            alias: address.alias || "",
            calle: address.calle,
            ciudad: address.ciudad,
            estado: address.estado,
            pais: address.pais || "Bolivia",
            es_principal: address.es_principal
        });
        setShowAddressModal(true);
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/cliente/direcciones/${editingAddress.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    action: "update",
                    ...addressForm
                })
            });
            if (res.ok) {
                toast.success("Dirección actualizada");
                setShowAddressModal(false);
                setEditingAddress(null);
                setAddressForm({ alias: "", calle: "", ciudad: "", estado: "", pais: "Bolivia", es_principal: false });
                fetchAddresses();
                fetchProfile();
            } else {
                toast.error("Error al actualizar dirección");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/cliente/perfil", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, user_id: user.id })
            });
            if (res.ok) {
                toast.success("Perfil actualizado");
                fetchProfile();
            } else {
                toast.error("Error al actualizar");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleUpdateReview = async () => {
        if (!editingReview) return;
        try {
            const res = await fetch("/api/cliente/perfil", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update_review",
                    user_id: user.id,
                    review_id: editingReview.id,
                    calificacion: editingReview.calificacion,
                    comentario: editingReview.comentario
                })
            });
            if (res.ok) {
                toast.success("Reseña actualizada");
                setEditingReview(null);
                fetchProfile();
            } else {
                toast.error("Error al actualizar reseña");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            return toast.error("Las contraseñas no coinciden");
        }
        try {
            const res = await fetch("/api/cliente/perfil", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "password",
                    user_id: user.id,
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Contraseña actualizada");
                setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Error al cambiar contraseña");
        }
    };

    const handleDeactivate = async () => {
        if (!confirm("¿Estás seguro? Esta acción no se puede deshacer fácilmente.")) return;
        try {
            const res = await fetch("/api/cliente/perfil", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "deactivate",
                    user_id: user.id,
                    password: deactivatePassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Cuenta desactivada");
                logout();
                window.location.href = "/";
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Error al desactivar cuenta");
        }
    };

    if (authLoading || profileLoading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 animate-pulse">Cargando perfil...</p>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-[#0B1120] text-white selection:bg-blue-500/30">
            <NebulaBackground />
            <MouseSpotlight />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0B1120]/0.1 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <Link to="/tienda" className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white group">
                                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    Mi Perfil
                                </h1>
                                <p className="text-xs text-gray-500">Gestiona tu cuenta y pedidos</p>
                            </div>
                        </div>
                        <button
                            onClick={async () => { await logout(); window.location.href = "/"; }}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-red-500/20"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-[2px] flex-shrink-0">
                                    <div className="h-full w-full rounded-full overflow-hidden bg-[#0B1120] flex items-center justify-center">
                                        {profileData?.foto_url ? (
                                            <img
                                                src={profileData.foto_url}
                                                alt={profileData.nombre}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                                {profileData?.nombre?.charAt(0) || "U"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-lg">{profileData?.nombre}</h3>
                                    <p className="text-xs text-gray-500">Cuenta Cliente</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab("resumen")}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === "resumen"
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Activity className="h-5 w-5" /> Resumen
                                </button>
                                <button
                                    onClick={() => setActiveTab("seguridad")}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === "seguridad"
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Lock className="h-5 w-5" /> Seguridad
                                </button>
                                <button
                                    onClick={() => setActiveTab("direcciones")}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === "direcciones"
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <MapPin className="h-5 w-5" /> Direcciones
                                </button>
                            </nav>
                        </div>

                        {/* Quick Stats Mini */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/5 text-center hover:bg-white/10 transition-colors">
                                <p className="text-xs text-gray-400">Total Pedidos</p>
                                <p className="text-xl font-bold text-white mt-1">{stats?.compras || 0}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/5 text-center hover:bg-white/10 transition-colors">
                                <p className="text-xs text-gray-400">Reseñas</p>
                                <p className="text-xl font-bold text-blue-400 mt-1">{stats?.reviews || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 space-y-6">
                        {activeTab === "resumen" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Extended Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 backdrop-blur-sm p-6 rounded-3xl border border-blue-500/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                            <ShoppingBag className="h-24 w-24 text-blue-400" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="h-10 w-10 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
                                                <ShoppingBag className="h-5 w-5" />
                                            </div>
                                            <p className="text-gray-400 text-sm font-medium">Pedidos Completados</p>
                                            <p className="text-3xl font-bold text-white mt-2">{stats?.compras || 0}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 backdrop-blur-sm p-6 rounded-3xl border border-emerald-500/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                            <DollarSign className="h-24 w-24 text-emerald-400" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="h-10 w-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-400">
                                                <DollarSign className="h-5 w-5" />
                                            </div>
                                            <p className="text-gray-400 text-sm font-medium">Total Gastado</p>
                                            <p className="text-3xl font-bold text-white mt-2">${Number(stats?.gastado || 0).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/10 backdrop-blur-sm p-6 rounded-3xl border border-yellow-500/20 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                            <Star className="h-24 w-24 text-yellow-400" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="h-10 w-10 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-4 text-yellow-400">
                                                <Star className="h-5 w-5" />
                                            </div>
                                            <p className="text-gray-400 text-sm font-medium">Reseñas Publicadas</p>
                                            <p className="text-3xl font-bold text-white mt-2">{stats?.reviews || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Card */}
                                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-lg font-bold text-white">Información Personal</h3>
                                        <button onClick={() => setActiveTab("seguridad")} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                            Editar datos
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="group">
                                                <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-blue-400 transition-colors">Nombre Completo</p>
                                                <p className="text-lg text-white font-medium">{profileData?.nombre} {profileData?.apellido}</p>
                                            </div>
                                            <div className="group">
                                                <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-blue-400 transition-colors">Email</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-lg text-white font-medium">{profileData?.email}</p>
                                                    {profileData?.activo && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Verificado</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="group">
                                                <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-blue-400 transition-colors">Teléfono</p>
                                                <p className="text-lg text-white font-medium">{profileData?.telefono || "No registrado"}</p>
                                            </div>
                                            {/* Address summary in Info Card */}
                                            <div className="group">
                                                <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-blue-400 transition-colors">Dirección</p>
                                                <p className="text-lg text-white font-medium">
                                                    {profileData?.calle ? (
                                                        <>
                                                            {profileData.calle}<br />
                                                            {profileData.ciudad}, {profileData.estado}<br />
                                                            {profileData.pais}
                                                        </>
                                                    ) : "No registrada"}
                                                </p>
                                            </div>
                                            <div className="group">
                                                <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-blue-400 transition-colors">Estado de Cuenta</p>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${profileData?.activo ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${profileData?.activo ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                                                    {profileData?.activo ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reviews Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-white">Mis Reseñas</h3>
                                        <span className="text-sm text-gray-500">{profileData?.reviews?.length || 0} publicaciones</span>
                                    </div>

                                    {!profileData?.reviews || profileData.reviews.length === 0 ? (
                                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                            <Star className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                            <h4 className="text-gray-300 font-medium mb-1">No tienes reseñas aún</h4>
                                            <p className="text-gray-500 text-sm">¡Compra productos y comparte tu opinión!</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {profileData.reviews.map((review) => (
                                                <div key={review.id} className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-4 w-4 ${i < review.calificacion ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="ml-2 text-xs font-bold text-yellow-500">{review.calificacion}.0</span>
                                                        </div>
                                                        <span className="text-gray-500 text-xs flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(review.fecha_review).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            {review.imagen_url && (
                                                                <img
                                                                    src={review.imagen_url}
                                                                    alt={review.producto_nombre}
                                                                    className="h-12 w-12 rounded-lg object-cover border border-white/10"
                                                                />
                                                            )}
                                                            <h4 className="font-semibold text-white text-base">{review.producto_nombre}</h4>
                                                        </div>
                                                        <button
                                                            onClick={() => setEditingReview(review)}
                                                            className="text-sm bg-white/5 hover:bg-blue-600 hover:text-white text-gray-400 px-3 py-1.5 rounded-lg transition-all border border-white/5 hover:border-blue-500/30"
                                                        >
                                                            Editar
                                                        </button>
                                                    </div>
                                                    <div className="bg-[#0B1120]/50 p-3 rounded-xl border border-white/5">
                                                        <p className="text-gray-300 text-sm leading-relaxed">{review.comentario}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "seguridad" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Update Details Form */}
                                <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/5 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                                        <div className="flex items-center gap-6 mb-4">
                                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-blue-500/20 flex-shrink-0">
                                                {profileData?.foto_url ? (
                                                    <img
                                                        src={profileData.foto_url}
                                                        alt={profileData.nombre}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <User className="h-10 w-10 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                                    <User className="h-5 w-5 text-blue-400" />
                                                    Datos Personales
                                                </h3>
                                                <p className="text-gray-500 text-sm mt-1">Actualiza tu información de contacto y dirección</p>
                                            </div>
                                        </div>
                                    </div>
                                    <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Nombre</label>
                                                <input
                                                    required
                                                    className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                                    value={formData.nombre}
                                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Apellido</label>
                                                <input
                                                    className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                                    value={formData.apellido}
                                                    onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Email</label>
                                                <input
                                                    required
                                                    type="email"
                                                    className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Foto de Perfil (URL)</label>
                                                <input
                                                    type="url"
                                                    className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                                    value={formData.foto_url}
                                                    onChange={e => setFormData({ ...formData, foto_url: e.target.value })}
                                                    placeholder="https://ejemplo.com/mi-foto.jpg"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Ingresa la URL de tu foto de perfil</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Teléfono</label>
                                                <input
                                                    className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                                    value={formData.telefono}
                                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                                />
                                            </div>

                                            {/* Address Fields */}
                                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                                <h4 className="md:col-span-2 text-white font-medium flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-blue-400" /> Dirección de Envío
                                                </h4>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400 ml-1">Calle / Avenida</label>
                                                    <input
                                                        className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                                        value={formData.calle || ''}
                                                        onChange={e => setFormData({ ...formData, calle: e.target.value })}
                                                        placeholder="Ej: Av. Principal 123"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400 ml-1">Ciudad</label>
                                                    <input
                                                        className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                                        value={formData.ciudad || ''}
                                                        onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                                                        placeholder="Ej: La Paz"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400 ml-1">Estado / Depto</label>
                                                    <input
                                                        className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                                        value={formData.estado || ''}
                                                        onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                                        placeholder="Ej: Murillo"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-400 ml-1">País</label>
                                                    <input
                                                        className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                                        value={formData.pais || ''}
                                                        onChange={e => setFormData({ ...formData, pais: e.target.value })}
                                                        placeholder="Ej: Bolivia"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95">
                                                <Save className="h-4 w-4" /> Guardar Cambios
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Password Change Form */}
                                <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/5 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                            <Lock className="h-5 w-5 text-purple-400" />
                                            Seguridad y Contraseña
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-1">Mantén tu cuenta segura</p>
                                    </div>
                                    <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Contraseña Actual</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        type={showPassword.current ? "text" : "password"}
                                                        className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12"
                                                        value={passwordData.current_password}
                                                        onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                                    >
                                                        {showPassword.current ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Nueva Contraseña</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        type={showPassword.new ? "text" : "password"}
                                                        className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12"
                                                        value={passwordData.new_password}
                                                        onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                                    >
                                                        {showPassword.new ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400 ml-1">Confirmar Contraseña</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        type={showPassword.confirm ? "text" : "password"}
                                                        className="w-full bg-[#0B1120] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12"
                                                        value={passwordData.confirm_password}
                                                        onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                                    >
                                                        {showPassword.confirm ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg active:scale-95">
                                                Actualizar Contraseña
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Danger Zone */}
                                <div className="bg-red-500/5 backdrop-blur-lg rounded-3xl border border-red-500/10 overflow-hidden">
                                    <div className="px-8 py-6 border-b border-red-500/10 bg-red-500/[0.02]">
                                        <h3 className="font-bold text-red-500 text-lg flex items-center gap-2">
                                            <ShieldAlert className="h-5 w-5" />
                                            Zona de Peligro
                                        </h3>
                                        <p className="text-red-400/60 text-sm mt-1">Acciones irreversibles para tu cuenta</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/10">
                                            <p className="text-sm text-red-300">
                                                <span className="font-bold block mb-1">Advertencia:</span>
                                                Si desactivas tu cuenta, perderás acceso inmediatamente. No podrás iniciar sesión ni ver tu historial.
                                            </p>
                                        </div>

                                        <div className="max-w-md space-y-3">
                                            <label className="text-sm font-medium text-red-400/80 ml-1">Confirma con tu contraseña actual</label>
                                            <div className="flex gap-4">
                                                <div className="relative flex-1">
                                                    <input
                                                        type={showPassword.deactivate ? "text" : "password"}
                                                        className="w-full bg-[#0B1120] border border-red-500/30 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                                        value={deactivatePassword}
                                                        onChange={e => setDeactivatePassword(e.target.value)}
                                                        placeholder="Contraseña actual"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({ ...showPassword, deactivate: !showPassword.deactivate })}
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-red-400/50 hover:text-red-400 transition-colors"
                                                    >
                                                        {showPassword.deactivate ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={handleDeactivate}
                                                    disabled={!deactivatePassword}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    Desactivar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "direcciones" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Mis Direcciones</h3>
                                    <button
                                        onClick={() => {
                                            setEditingAddress(null);
                                            setAddressForm({ alias: "", calle: "", ciudad: "", estado: "", pais: "Bolivia", es_principal: false });
                                            setShowAddressModal(true);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        <Plus className="h-4 w-4" /> Nueva Dirección
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {addresses.map((addr) => (
                                        <div key={addr.id} className={`bg-white/5 backdrop-blur-sm p-6 rounded-2xl border transition-all group ${addr.es_principal ? 'border-blue-500/50 bg-blue-900/10' : 'border-white/5 hover:border-white/10'}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-bold text-white text-lg">{addr.alias || 'Sin Alias'}</h4>
                                                        {addr.es_principal && (
                                                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
                                                                <CheckCircle className="h-3 w-3" /> Principal
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-300">{addr.calle}</p>
                                                    <p className="text-gray-400 text-sm">{addr.ciudad}, {addr.estado}, {addr.pais}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditAddress(addr)}
                                                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Editar dirección"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    {!addr.es_principal && (
                                                        <>
                                                            <button
                                                                onClick={() => handleSetPrincipal(addr.id)}
                                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                title="Establecer como principal"
                                                            >
                                                                <CheckCircle className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAddress(addr.id)}
                                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {addresses.length === 0 && (
                                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                            <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                            <h4 className="text-gray-300 font-medium mb-1">No tienes direcciones guardadas</h4>
                                            <p className="text-gray-500 text-sm">Agrega una dirección para facilitar tus pedidos</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0B1120] rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-white/10 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowAddressModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-6">{editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}</h3>

                        <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Alias (Ej: Casa, Trabajo)</label>
                                <input
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                    value={addressForm.alias}
                                    onChange={(e) => setAddressForm({ ...addressForm, alias: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Calle / Avenida</label>
                                <input
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                    value={addressForm.calle}
                                    onChange={(e) => setAddressForm({ ...addressForm, calle: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Ciudad</label>
                                    <input
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                        value={addressForm.ciudad}
                                        onChange={(e) => setAddressForm({ ...addressForm, ciudad: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Estado</label>
                                    <input
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                        value={addressForm.estado}
                                        onChange={(e) => setAddressForm({ ...addressForm, estado: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">País</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                    value={addressForm.pais}
                                    onChange={(e) => setAddressForm({ ...addressForm, pais: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="es_principal"
                                    checked={addressForm.es_principal}
                                    onChange={(e) => setAddressForm({ ...addressForm, es_principal: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="es_principal" className="text-white text-sm">Establecer como dirección principal</label>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                            >
                                {editingAddress ? 'Actualizar Dirección' : 'Guardar Dirección'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Review Edit Modal */}
            {editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0B1120] rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-white/10 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setEditingReview(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-2">Editar Reseña</h3>
                        <p className="text-gray-400 text-sm mb-6">Comparte tu opinión sobre <span className="text-blue-400">{editingReview.producto_nombre}</span></p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">Calificación</label>
                                <div className="flex gap-2 justify-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setEditingReview({ ...editingReview, calificacion: star })}
                                            className={`p-2 rounded-xl transition-all hover:scale-110 ${editingReview.calificacion >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                                        >
                                            <Star className={`h-8 w-8 ${editingReview.calificacion >= star ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Tu Comentario</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600 h-32 resize-none"
                                    value={editingReview.comentario}
                                    onChange={(e) => setEditingReview({ ...editingReview, comentario: e.target.value })}
                                    placeholder="Escribe aquí tu experiencia..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setEditingReview(null)}
                                    className="px-6 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdateReview}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
