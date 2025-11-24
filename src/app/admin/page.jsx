"use client";

import { useState } from "react";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import useUser from "@/utils/useUser";
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
} from "recharts";

const queryClient = new QueryClient();

function ProductModal({ isOpen, onClose, product, categorias, marcas }) {
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
  }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                rows="3"
                value={formData.descripcion || ""}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.precio}
                onChange={e => setFormData({ ...formData, precio: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Costo</label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.precio_costo || ""}
                onChange={e => setFormData({ ...formData, precio_costo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                required
                type="number"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.stock_minimo || 5}
                onChange={e => setFormData({ ...formData, stock_minimo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.categoria_id || ""}
                onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.marca_id || ""}
                onChange={e => setFormData({ ...formData, marca_id: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.sku || ""}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen URL</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.imagen_url || ""}
                onChange={e => setFormData({ ...formData, imagen_url: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Activo</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.activo ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.activo ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMarca, setSelectedMarca] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
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
      window.location.href = "/account/signin?callbackUrl=/admin";
    }
    return null;
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl mb-4 inline-block">
            <Package className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Datos para gráficos
  const ventasData = (dashboardData?.salesHistory || []).map((dia) => ({
    name: new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
    ventas: parseFloat(dia.monto),
    fecha: dia.fecha,
  }));

  const productosStockBajo = productos.filter((p) => p.stock <= p.stock_minimo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TechSphere Admin
                </h1>
                <p className="text-gray-600">
                  Sistema de Gestión de Inventario
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/admin/ventas/nueva"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-bold"
              >
                <div className="bg-blue-200 p-1 rounded-full">
                  <Plus className="h-4 w-4 text-blue-700" />
                </div>
                <span className="ml-2">Nueva Venta</span>
              </a>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.[0] || "A"}
                </div>
                <span className="font-medium text-gray-700">
                  {user?.name || "Admin"}
                </span>
              </div>
              <a
                href="/account/logout"
                className="bg-red-500 text-white flex items-center gap-2 p-3 rounded-xl hover:bg-red-600 transition-colors duration-200 shadow-md"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
                <span>Salir</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ventas Hoy</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${dashboardData?.ventasHoy?.monto?.toFixed(2) || "0.00"}
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardData?.ventasHoy?.total || 0} transacciones
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Productos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {productos.length}
                </p>
                <p className="text-sm text-gray-500">En inventario</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Stock Bajo</p>
                <p className="text-3xl font-bold text-red-600">
                  {dashboardData?.productosStock || 0}
                </p>
                <p className="text-sm text-gray-500">Productos</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Ventas del Mes
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  ${dashboardData?.ventasMes?.monto?.toFixed(2) || "0.00"}
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardData?.ventasMes?.total || 0} ventas
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
              Ventas Recientes
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ventasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ventas"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: "#1d4ed8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Star className="h-6 w-6 mr-2 text-yellow-600" />
              Productos Más Vendidos
            </h3>
            <div className="space-y-4">
              {dashboardData?.topProductos
                ?.slice(0, 5)
                .map((producto, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">
                        {producto.nombre}
                      </span>
                    </div>
                    <span className="text-blue-600 font-bold">
                      {producto.vendidos} vendidos
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>



        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            <select
              value={selectedMarca}
              onChange={(e) => setSelectedMarca(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Todas las marcas</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="h-7 w-7 mr-3 text-blue-600" />
              Inventario de Productos
            </h2>
            <button
              onClick={handleAddProduct}
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2 font-bold"
            >
              <div className="bg-blue-200 p-1 rounded-full">
                <Plus className="h-3 w-3 text-blue-700" />
              </div>
              <span>Nuevo Producto</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Imagen
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Marca
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map((producto) => (
                  <tr
                    key={producto.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {producto.imagen_url ? (
                          <img
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {producto.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {producto.sku}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {producto.categoria_nombre}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {producto.marca_nombre}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        ${parseFloat(producto.precio).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${producto.stock <= producto.stock_minimo
                          ? "text-red-600"
                          : "text-gray-900"
                          }`}
                      >
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {producto.stock <= producto.stock_minimo ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Stock Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          En Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditProduct(producto)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(producto.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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
          <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Alertas de Stock Bajo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productosStockBajo.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white rounded-xl p-4 border border-red-200"
                >
                  <div className="font-semibold text-gray-900">
                    {producto.nombre}
                  </div>
                  <div className="text-sm text-gray-600">
                    {producto.categoria_nombre}
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-red-600 font-bold">
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
