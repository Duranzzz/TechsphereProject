"use client";

import { useState } from "react";
import { Link } from "react-router";
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
  ArrowDownRight,
  User
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
import ProductModal from "@/components/admin/ProductModal";

const queryClient = new QueryClient();

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


  return (
    <>
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
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user?.foto_url ? (
                    <img
                      src={user.foto_url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
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

          <Link
            to="/admin/stock-bajo"
            className="block bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-rose-500/30 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200/60 text-sm font-medium mb-1">Stock Bajo</p>
                <p className="text-3xl font-bold text-rose-400 mb-1">
                  {dashboardData?.productosStock || 0}
                </p>
                <p className="text-sm text-blue-200/40">Ubicaciones en riesgo</p>
              </div>
              <div className="bg-rose-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-8 w-8 text-rose-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-rose-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Ver detalles
            </div>
          </Link>

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
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-400" />
              Ventas (Últimos 7 Días)
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
                    type="linear"
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
                ?.slice(0, 3)
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
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '';
                              e.target.style.display = 'none';
                            }}
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
                        className={`font-semibold ${producto.stock <= producto.cantidad_minima
                          ? "text-rose-400"
                          : "text-white"
                          }`}
                      >
                        {producto.stock}
                      </span>
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



        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={editingProduct}
          categorias={categorias}
          marcas={marcas}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  );
}
