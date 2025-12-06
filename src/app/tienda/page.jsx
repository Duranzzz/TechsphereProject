"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  ShoppingCart,
  Package,
  Search,
  Filter,
  Plus,
  Minus,
  Star,
  Heart,
  Eye,
  Smartphone,
  Laptop,
  Gamepad2,
  Headphones,
  Cable,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const queryClient = new QueryClient();

function TechStore() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMarca, setSelectedMarca] = useState("");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const { logout } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);




  // Fetch productos
  const { data: productos = [], isLoading: productosLoading } = useQuery({
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
  });

  // Fetch categorias
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const response = await fetch("/api/categorias");
      if (!response.ok) throw new Error("Error fetching categorias");
      return response.json();
    },
  });

  // Fetch marcas
  const { data: marcas = [] } = useQuery({
    queryKey: ["marcas"],
    queryFn: async () => {
      const response = await fetch("/api/marcas");
      if (!response.ok) throw new Error("Error fetching marcas");
      return response.json();
    },
  });

  // Cart functions
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, cantidad: 1 }];
    });
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, cantidad: newQuantity } : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + parseFloat(item.precio) * item.cantidad,
      0,
    );
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  };

  // WhatsApp integration
  const sendToWhatsApp = () => {
    const total = getCartTotal();
    const itemsList = cart
      .map(
        (item) =>
          `${item.cantidad}x ${item.nombre} - $${(parseFloat(item.precio) * item.cantidad).toFixed(2)}`,
      )
      .join("\n");

    const message = encodeURIComponent(
      `🛒 *Nuevo Pedido - TechSphere*\n\n` +
      `📦 *Productos:*\n${itemsList}\n\n` +
      `💰 *Total: $${total.toFixed(2)}*\n\n` +
      `¡Hola! Me gustaría hacer este pedido. ¿Podrían confirmar la disponibilidad?`,
    );

    window.open(`https://wa.me/1234567890?text=${message}`, "_blank");
  };

  // Category icons
  const getCategoryIcon = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case "smartphones":
        return <Smartphone className="h-6 w-6" />;
      case "laptops":
        return <Laptop className="h-6 w-6" />;
      case "gaming":
        return <Gamepad2 className="h-6 w-6" />;
      case "audio":
        return <Headphones className="h-6 w-6" />;
      case "accesorios":
        return <Cable className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  const featuredProducts = productos.slice(0, 8);
  const newProducts = productos.slice(-4);

  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TechSphere
                </h1>
                <p className="text-sm text-gray-600">Tu tienda de tecnología</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Carrito</span>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {getCartItemCount()}
                  </span>
                )}
              </button>

              <Link
                to="/tienda/perfil"
                className="text-gray-600 hover:text-blue-600 font-medium flex items-center space-x-1"
              >
                <div className="bg-gray-100 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <span>Perfil</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Menú</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Carrito ({getCartItemCount()})</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full block text-center text-gray-600 hover:text-blue-600 font-medium py-2"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Bienvenido a TechSphere
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            La mejor tecnología al mejor precio
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl">
              <Smartphone className="h-5 w-5" />
              <span>Smartphones</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl">
              <Laptop className="h-5 w-5" />
              <span>Laptops</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl">
              <Gamepad2 className="h-5 w-5" />
              <span>Gaming</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl">
              <Headphones className="h-5 w-5" />
              <span>Audio</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-600" />
                Filtros
              </h3>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las marcas</option>
                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>

              {(selectedCategory || selectedMarca || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedMarca("");
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      {/* Products Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {searchTerm
              ? `Resultados para "${searchTerm}"`
              : selectedCategory || selectedMarca
                ? "Productos Filtrados"
                : "Todos los Productos"}
          </h3>

          {productosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 animate-pulse"
                >
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative p-6 bg-gradient-to-br from-gray-50 to-blue-50 h-48 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {producto.imagen_url ? (
                      <img
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        onClick={() => navigate(`/producto/${producto.id}`)}
                        className="cursor-pointer"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          console.error("Error loading image:", producto.imagen_url);
                          e.target.onerror = null;
                          e.target.style.display = 'none'; // Hide broken image
                          e.target.nextSibling.style.display = 'block'; // Show fallback
                        }}
                      />
                    ) : (
                      <div className="text-6xl opacity-20">
                        {getCategoryIcon(producto.categoria_nombre)}
                      </div>
                    )}
                    {/* Fallback for broken images (hidden by default if image exists) */}
                    {producto.imagen_url && (
                      <div className="text-6xl opacity-20 hidden">
                        {getCategoryIcon(producto.categoria_nombre)}
                      </div>
                    )}

                    {producto.stock <= producto.stock_minimo && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10">
                        Stock Bajo
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex space-x-1 z-10">
                      <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-red-500" />
                      </button>
                      <button
                        onClick={() => navigate(`/producto/${producto.id}`)}
                        className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                        {producto.categoria_nombre}
                      </span>
                      <span className="text-sm text-gray-500">
                        {producto.marca_nombre}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 mb-2 text-lg leading-tight">
                      {producto.nombre}
                    </h4>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {producto.descripcion}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          ${parseFloat(producto.precio).toFixed(2)}
                        </span>
                        {producto.precio_costo && (
                          <span className="text-sm text-gray-500 ml-2">
                            SKU: {producto.sku}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4" />
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(producto)}
                      disabled={producto.stock <= 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>
                        {producto.stock <= 0
                          ? "Sin Stock"
                          : "Agregar al Carrito"}
                      </span>
                    </button>

                    <div className="mt-2 text-center">
                      <span className="text-sm text-gray-500">
                        Stock: {producto.stock} disponibles
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {productos.length === 0 && !productosLoading && (
            <div className="text-center py-12">
              <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-600">
                Intenta cambiar los filtros o buscar algo diferente
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      < section className="py-12 bg-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Explora por Categorías
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => setSelectedCategory(categoria.id.toString())}
                className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-200 text-center group hover:scale-105"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl inline-block mb-3 group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">
                  {getCategoryIcon(categoria.nombre)}
                  <span className="text-white">
                    {getCategoryIcon(categoria.nombre)}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900">{categoria.nombre}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {categoria.descripcion}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="bg-gray-900 text-white py-12" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">TechSphere</h3>
              </div>
              <p className="text-gray-400">
                Tu tienda de confianza para la mejor tecnología
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contacto</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone className="h-4 w-4" />
                  <span>+1 (234) 567-8900</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>info@techsphere.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>123 Tech Street, Digital City</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Categorías</h4>
              <div className="space-y-2">
                {categorias.slice(0, 4).map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => setSelectedCategory(categoria.id.toString())}
                    className="block text-gray-400 hover:text-white transition-colors"
                  >
                    {categoria.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Información</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Envíos
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Devoluciones
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Garantía
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Soporte
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TechSphere. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer >

      {/* Cart Sidebar */}
      {
        isCartOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsCartOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Carrito de Compras
                    </h2>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 mt-1">
                    {getCartItemCount()}{" "}
                    {getCartItemCount() === 1 ? "producto" : "productos"}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Tu carrito está vacío
                      </h3>
                      <p className="text-gray-600">
                        Agrega algunos productos para empezar
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl"
                        >
                          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl flex items-center justify-center overflow-hidden">
                            {item.imagen_url ? (
                              <img
                                src={item.imagen_url}
                                alt={item.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getCategoryIcon(item.categoria_nombre)
                            )}
                          </div>

                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {item.nombre}
                            </h4>
                            <p className="text-blue-600 font-bold">
                              ${parseFloat(item.precio).toFixed(2)}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                updateCartQuantity(item.id, item.cantidad - 1)
                              }
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="w-8 text-center font-medium">
                              {item.cantidad}
                            </span>

                            <button
                              onClick={() =>
                                updateCartQuantity(item.id, item.cantidad + 1)
                              }
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        * El envío se calcula en el siguiente paso
                      </p>
                      <Link
                        to="/tienda/checkout"
                        className="block w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-center"
                      >
                        Comprar Ahora
                      </Link>
                    </div>   <p className="text-xs text-gray-500 mt-2 text-center">
                      Te redirigiremos a WhatsApp para completar tu pedido
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Product Detail Modal */}
      {
        selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSelectedProduct(null)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProduct.nombre}
                  </h2>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-12 mb-6 flex items-center justify-center">
                  {selectedProduct.imagen_url ? (
                    <img
                      src={selectedProduct.imagen_url}
                      alt={selectedProduct.nombre}
                      className="w-full h-64 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-8xl opacity-30">
                      {getCategoryIcon(selectedProduct.categoria_nombre)}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-600 mb-4">
                      {selectedProduct.descripcion ||
                        "Sin descripción disponible"}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoría:</span>
                        <span className="font-medium">
                          {selectedProduct.categoria_nombre}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Marca:</span>
                        <span className="font-medium">
                          {selectedProduct.marca_nombre}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-medium">{selectedProduct.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span
                          className={`font-medium ${selectedProduct.stock <= selectedProduct.stock_minimo
                            ? "text-red-600"
                            : "text-green-600"
                            }`}
                        >
                          {selectedProduct.stock} disponibles
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="text-3xl font-bold text-green-600 mb-4">
                        ${parseFloat(selectedProduct.precio).toFixed(2)}
                      </div>

                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-500 mr-2">
                          <Star className="h-5 w-5 fill-current" />
                          <Star className="h-5 w-5 fill-current" />
                          <Star className="h-5 w-5 fill-current" />
                          <Star className="h-5 w-5 fill-current" />
                          <Star className="h-5 w-5" />
                        </div>
                        <span className="text-gray-600 text-sm">
                          (4.0 estrellas)
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          addToCart(selectedProduct);
                          setSelectedProduct(null);
                        }}
                        disabled={selectedProduct.stock <= 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-5 w-5" />
                        <span>
                          {selectedProduct.stock <= 0
                            ? "Sin Stock"
                            : "Agregar al Carrito"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Lightbox Modal */}
      {
        lightboxImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-opacity duration-300">
            <div className="relative max-w-4xl w-full max-h-screen flex flex-col items-center">
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={lightboxImage}
                alt="Vista previa"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div
              className="absolute inset-0 -z-10"
              onClick={() => setLightboxImage(null)}
            />
          </div>
        )
      }
    </div >
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TechStore />
    </QueryClientProvider>
  );
}
