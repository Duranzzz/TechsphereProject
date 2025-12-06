"use client";

import { useState } from "react";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  DollarSign,
  Calendar,
  Star,
  LogOut,
  Pencil,
  Trash2,
  X,
  Save,
  History,
  ArrowRightLeft,
  Menu,
  Truck,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";

const queryClient = new QueryClient();

function ProductModal({ isOpen, onClose, product, categorias, marcas }) {
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    precio_costo: "",
    stock: "",
    stock_minimo: "",
    categoria_id: "",
    marca_id: "",
    sku: "",
    imagen_url: "",
    activo: true,
  });

  // Load product data when opening for edit
  if (isOpen && product && formData.id !== product.id) {
    setFormData({ ...product, id: product.id });
  }
  // Reset when opening for new
  if (isOpen && !product && formData.id) {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      precio_costo: "",
      stock: "",
      stock_minimo: "",
      categoria_id: "",
      marca_id: "",
      sku: "",
      imagen_url: "",
      activo: true,
    });
    if (activeTab !== 'details') setActiveTab('details');
  }

  // Fetch Kardex
  const { data: kardex = [], isLoading: loadingKardex } = useQuery({
    queryKey: ["kardex", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const res = await fetch(`/api/kardex?producto_id=${product.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!product?.id && activeTab === 'kardex',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = product ? "PUT" : "POST";

    try {
      const res = await fetch("/api/productos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        queryClient.invalidateQueries(["productos"]);
        onClose();
      } else {
        alert("Error al guardar producto");
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar producto");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60 p-4">
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 custom-scrollbar">
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/95 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {product ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            {product && (
              <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/5">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'details' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white'}`}
                >
                  Detalles
                </button>
                <button
                  onClick={() => setActiveTab('kardex')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'kardex' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'text-gray-400 hover:text-white'}`}
                >
                  Historial
                </button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {activeTab === 'details' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-blue-200/80">Nombre</label>
                <input
                  required
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-blue-200/80">Descripción</label>
                <textarea
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-gray-500"
                  rows="3"
                  value={formData.descripcion || ""}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción detallada..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200/80">Precio Venta</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                    value={formData.precio}
                    onChange={e => setFormData({ ...formData, precio: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200/80">Precio Costo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                    value={formData.precio_costo || ""}
                    onChange={e => setFormData({ ...formData, precio_costo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200/80">Stock</label>
                <input
                  required
                  type="number"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                  value={formData.stock}
                  onChange={e => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200/80">Stock Mínimo</label>
                <input
                  type="number"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                  value={formData.stock_minimo || 5}
                  onChange={e => setFormData({ ...formData, stock_minimo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200/80">Categoría</label>
                <select
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all appearance-none"
                  value={formData.categoria_id || ""}
                  onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
                >
                  <option value="" className="bg-slate-900">Seleccionar...</option>
                  {categorias.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.nombre}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200/80">Marca</label>
                <select
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all appearance-none"
                  value={formData.marca_id || ""}
                  onChange={e => setFormData({ ...formData, marca_id: e.target.value })}
                >
                  <option value="" className="bg-slate-900">Seleccionar...</option>
                  {marcas.map(m => <option key={m.id} value={m.id} className="bg-slate-900">{m.nombre}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200/80">SKU</label>
                <input
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                  value={formData.sku || ""}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200/80">Imagen URL</label>
                <input
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                  value={formData.imagen_url || ""}
                  onChange={e => setFormData({ ...formData, imagen_url: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <label className="text-sm font-medium text-blue-200/80">Estado:</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.activo ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.activo ? 'left-7' : 'left-1'}`} />
                </button>
                <span className={`text-sm font-medium ${formData.activo ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {formData.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-purple-500/25 hover:scale-105 transition-all"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            {loadingKardex ? (
              <div className="text-center py-12 text-blue-200/50 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                Cargando historial...
              </div>
            ) : kardex.length === 0 ? (
              <div className="text-center py-12 text-blue-200/50 flex flex-col items-center">
                <History className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg">No hay movimientos registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-blue-200/50 text-sm uppercase tracking-wider">
                      <th className="pb-4 font-semibold">Fecha</th>
                      <th className="pb-4 font-semibold">Tipo</th>
                      <th className="pb-4 font-semibold">Referencia</th>
                      <th className="pb-4 font-semibold text-right">Cantidad</th>
                      <th className="pb-4 font-semibold text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {kardex.map((mov) => (
                      <tr key={mov.id} className="text-sm hover:bg-white/5 transition-colors">
                        <td className="py-4 text-blue-100/80">
                          {new Date(mov.fecha).toLocaleDateString()} <span className="text-gray-500 text-xs">{new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${mov.tipo_movimiento === 'compra' || mov.tipo_movimiento === 'ajuste_entrada'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                            {mov.tipo_movimiento}
                          </span>
                        </td>
                        <td className="py-4 text-gray-400">
                          {mov.observacion || '-'}
                        </td>
                        <td className={`py-4 text-right font-bold font-mono ${mov.cantidad > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                          {mov.cantidad > 0 ? '+' : ''}{mov.cantidad}
                        </td>
                        <td className="py-4 text-right font-bold text-white font-mono">
                          {mov.saldo_actual}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { user, loading: userLoading, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMarca, setSelectedMarca] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/productos?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        queryClient.invalidateQueries(["productos"]);
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error(error);
      alert("Error al eliminar");
    }
  };

  // Fetch dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Error fetching dashboard data");
      return response.json();
    },
    enabled: !!user, // Only run if user is authenticated
  });

  // Fetch productos
  const { data: productos = [] } = useQuery({
    queryKey: ["productos", searchTerm, selectedCategory, selectedMarca],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("categoria", selectedCategory);
      if (selectedMarca) params.append("marca", selectedMarca);

      const response = await fetch(`/api/productos?${params}`);
      if (!response.ok) throw new Error("Error fetching productos");
      return response.json();
    },
    enabled: !!user, // Only run if user is authenticated
  });

  // Fetch categorias
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const response = await fetch("/api/categorias");
      if (!response.ok) throw new Error("Error fetching categorias");
      return response.json();
    },
    enabled: !!user, // Only run if user is authenticated
  });

  // Fetch marcas
  const { data: marcas = [] } = useQuery({
    queryKey: ["marcas"],
    queryFn: async () => {
      const response = await fetch("/api/marcas");
      if (!response.ok) throw new Error("Error fetching marcas");
      return response.json();
    },
    enabled: !!user, // Only run if user is authenticated
  });

  // Fetch ventas
  const { data: ventas = [] } = useQuery({
    queryKey: ["ventas"],
    queryFn: async () => {
      const response = await fetch("/api/ventas");
      if (!response.ok) throw new Error("Error fetching ventas");
      return response.json();
    },
    enabled: !!user, // Only run if user is authenticated
  });

  // Redirect to login if not authenticated
  if (!userLoading && !user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl mb-6 inline-block shadow-lg shadow-purple-500/25">
            <Package className="h-10 w-10 text-white animate-pulse" />
          </div>
          <p className="text-blue-200 text-lg font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Datos para gráficos
  const ventasData = (dashboardData?.salesHistory || []).map((dia) => {
    const [year, month, day] = dia.fecha.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      name: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
      ventas: parseFloat(dia.monto),
      fecha: dia.fecha,
    };
  });

  const productosStockBajo = productos.filter((p) => p.stock <= p.stock_minimo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg shadow-purple-500/20">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  TechSphere Admin
                </h1>
                <p className="text-blue-200/60 text-sm">
                  Sistema de Gestión de Inventario
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-inner">
                  {user?.name?.[0] || "A"}
                </div>
                <span className="font-medium text-blue-100">
                  {user?.name || "Admin"}
                </span>
              </div>
              <button
                onClick={async () => {
                  await logout();
                  window.location.href = "/";
                }}
                className="bg-rose-500/10 text-rose-400 flex items-center gap-2 p-3 rounded-xl hover:bg-rose-500/20 transition-colors duration-200 border border-rose-500/20"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>

              {/* Hamburger Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="bg-gradient-to-r from-orange-500 to-purple-600 p-3 rounded-xl text-white shadow-lg shadow-purple-500/25 hover:scale-105 transition-all"
                >
                  <Menu className="h-6 w-6" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-4 w-72 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-200">
                    <div className="p-2 space-y-1">


                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleAddProduct();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors group"
                      >
                        <div className="bg-purple-500/20 p-2 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                          <Plus className="h-5 w-5 text-purple-400" />
                        </div>
                        <span className="font-medium">Nuevo Producto</span>
                      </button>

                      <a
                        href="/admin/compras"
                        className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors group"
                      >
                        <div className="bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                          <ShoppingCart className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="font-medium">Compras</span>
                      </a>

                      <a
                        href="/admin/proveedores"
                        className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-colors group"
                      >
                        <div className="bg-orange-500/20 p-2 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                          <Truck className="h-5 w-5 text-orange-400" />
                        </div>
                        <span className="font-medium">Proveedores</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200/60 text-sm font-medium mb-1">Ventas Hoy</p>
                <p className="text-3xl font-bold text-white mb-1">
                  ${dashboardData?.ventasHoy?.monto?.toFixed(2) || "0.00"}
                </p>
                <div className="flex items-center text-emerald-400 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  {dashboardData?.ventasHoy?.total || 0} transacciones
                </div>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <DollarSign className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200/60 text-sm font-medium mb-1">Productos</p>
                <p className="text-3xl font-bold text-white mb-1">
                  {productos.length}
                </p>
                <p className="text-sm text-blue-200/40">En inventario</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Package className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200/60 text-sm font-medium mb-1">Stock Bajo</p>
                <p className="text-3xl font-bold text-rose-400 mb-1">
                  {dashboardData?.productosStock || 0}
                </p>
                <p className="text-sm text-blue-200/40">Productos</p>
              </div>
              <div className="bg-rose-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-8 w-8 text-rose-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200/60 text-sm font-medium mb-1">
                  Ventas del Mes
                </p>
                <p className="text-3xl font-bold text-white mb-1">
                  ${dashboardData?.ventasMes?.monto?.toFixed(2) || "0.00"}
                </p>
                <p className="text-sm text-blue-200/40">
                  {dashboardData?.ventasMes?.total || 0} ventas
                </p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-400" />
              Ventas Recientes
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ventasData}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    }}
                    itemStyle={{ color: "#60a5fa" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ventas"
                    stroke="#60a5fa"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVentas)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Star className="h-6 w-6 mr-2 text-yellow-400" />
              Productos Más Vendidos
            </h3>
            <div className="space-y-4">
              {dashboardData?.topProductos
                ?.slice(0, 5)
                .map((producto, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                          index === 2 ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-orange-900' :
                            'bg-slate-700 text-gray-400'
                        }`}>
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">
                          {producto.nombre}
                        </span>
                        <span className="text-xs text-blue-200/50">Top Seller</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-400 font-bold block text-lg">
                        {producto.vendidos}
                      </span>
                      <span className="text-xs text-gray-500 uppercase">Vendidos</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300/50 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-blue-300/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
            >
              <option value="" className="bg-slate-900">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id} className="bg-slate-900">
                  {categoria.nombre}
                </option>
              ))}
            </select>
            <select
              value={selectedMarca}
              onChange={(e) => setSelectedMarca(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
            >
              <option value="" className="bg-slate-900">Todas las marcas</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id} className="bg-slate-900">
                  {marca.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Package className="h-6 w-6 mr-3 text-blue-400" />
              Inventario de Productos
            </h2>
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 text-blue-200/70 text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Imagen</th>
                  <th className="px-6 py-4 text-left font-semibold">Producto</th>
                  <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                  <th className="px-6 py-4 text-left font-semibold">Marca</th>
                  <th className="px-6 py-4 text-left font-semibold">Precio</th>
                  <th className="px-6 py-4 text-left font-semibold">Stock</th>
                  <th className="px-6 py-4 text-left font-semibold">Estado</th>
                  <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {productos.map((producto) => (
                  <tr
                    key={producto.id}
                    className="hover:bg-white/5 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                        {producto.imagen_url ? (
                          <img
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-white">
                          {producto.nombre}
                        </div>
                        <div className="text-sm text-gray-400 font-mono">
                          {producto.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-blue-200/80">
                      {producto.categoria_nombre}
                    </td>
                    <td className="px-6 py-4 text-blue-200/80">
                      {producto.marca_nombre}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-400">
                        ${parseFloat(producto.precio).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${producto.stock <= producto.stock_minimo
                          ? "text-rose-400"
                          : "text-white"
                          }`}
                      >
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {producto.stock <= producto.stock_minimo ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Stock Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          En Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditProduct(producto)}
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(producto.id)}
                          className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alerts */}
        {productosStockBajo.length > 0 && (
          <div className="mt-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Alertas de Stock Bajo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productosStockBajo.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-slate-900/80 rounded-xl p-4 border border-rose-500/20 shadow-lg"
                >
                  <div className="font-semibold text-white">
                    {producto.nombre}
                  </div>
                  <div className="text-sm text-gray-400">
                    {producto.categoria_nombre}
                  </div>
                  <div className="mt-3 flex justify-between items-center bg-rose-500/5 p-2 rounded-lg">
                    <span className="text-rose-400 font-bold">
                      Stock: {producto.stock}
                    </span>
                    <span className="text-xs text-gray-500">
                      Mín: {producto.stock_minimo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={editingProduct}
          categorias={categorias}
          marcas={marcas}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  );
}
