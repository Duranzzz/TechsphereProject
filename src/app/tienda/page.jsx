"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import NebulaBackground from "@/components/NebulaBackground";
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
  LogOut,
  User,
  Grid,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const queryClient = new QueryClient();

// Three.js Background Component


export default function TechStore() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMarca, setSelectedMarca] = useState("");
  const { logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { cart, addToCart, updateCartQuantity, removeFromCart, getCartTotal, getCartItemCount } = useCart();

  // Mouse move effect for background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  // Category icons helper
  const getCategoryIcon = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case "smartphones": return <Smartphone className="h-5 w-5" />;
      case "laptops": return <Laptop className="h-5 w-5" />;
      case "gaming": return <Gamepad2 className="h-5 w-5" />;
      case "audio": return <Headphones className="h-5 w-5" />;
      case "accesorios": return <Cable className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const ratingValue = parseFloat(rating || 0);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(ratingValue) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white selection:bg-blue-500/30 font-sans">

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background: `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(56, 189, 248, 0.25), transparent 70%)`
          }}
        />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>
      <NebulaBackground />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-12">

        {/* Navigation Bar */}
        <header className="py-6 flex flex-col md:flex-row gap-6 items-center justify-between sticky top-0 z-50 pointer-events-none">
          {/* Logo Area */}
          <div className="pointer-events-auto bg-[#0F1629]/60 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent pr-2">
              TechSphere
            </span>
          </div>

          {/* Desktop Search Center */}
          <div className="hidden md:flex flex-1 max-w-xl px-8 pointer-events-auto">
            <div className="relative w-full group">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar el futuro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0F1629]/80 backdrop-blur-md border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-500 text-white shadow-lg"
              />
            </div>
          </div>

          {/* Actions Right */}
          <div className="flex items-center gap-3 pointer-events-auto">

            <Link to="/tienda/perfil" className="group">
              <div className="relative overflow-hidden bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 p-3 rounded-xl backdrop-blur-md transition-all shadow-lg hover:shadow-purple-500/20 text-purple-300 hover:text-white">
                <User className="h-5 w-5" />
              </div>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-gradient-to-br from-blue-600/10 to-blue-400/10 border border-blue-500/30 p-3 rounded-xl backdrop-blur-md hover:bg-blue-500/20 transition-all group shadow-lg"
            >
              <ShoppingCart className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg ring-2 ring-[#0B1120]">
                  {getCartItemCount()}
                </span>
              )}
            </button>



            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-3 bg-white/5 border border-white/10 rounded-xl">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Categories Bar (Horizontal) */}
        <section className="mb-8 flex overflow-x-auto pb-4 gap-3 no-scrollbar mask-gradient-x">
          <button
            onClick={() => setSelectedCategory("")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all whitespace-nowrap backdrop-blur-md font-medium text-sm
                ${selectedCategory === ""
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            <Grid className="h-4 w-4" /> Todo
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id.toString())}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all whitespace-nowrap backdrop-blur-md font-medium text-sm
                    ${selectedCategory === cat.id.toString()
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
              {getCategoryIcon(cat.nombre)} {cat.nombre}
            </button>
          ))}
        </section>

        {/* Main Glass Panel Container */}
        <div className="bg-[#0F1629]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 md:p-8 min-h-[80vh] shadow-2xl relative overflow-hidden">

          {/* Background Decoration inside glass */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-50" />

          {/* New Season Banner - Colored Glass */}
          {!searchTerm && !selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-10 relative rounded-3xl overflow-hidden p-[1px] bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30"
            >
              <div className="relative bg-[#0F1629]/80 backdrop-blur-xl rounded-[23px] overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" /> Nueva Colección
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                      El Futuro es <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Ahora</span>
                    </h2>
                    <p className="text-gray-300 max-w-lg mx-auto md:mx-0 text-lg">
                      Explora los dispositivos que están redefiniendo los límites de la tecnología.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                    <Package className="relative z-10 w-32 h-32 text-blue-400 drop-shadow-[0_0_15px_rgba(60,130,246,0.5)]" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Products Grid Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {searchTerm ? "Resultados de búsqueda" : "Catálogo Exclusivo"}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Mostrando {productos.length} productos disponibles
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden md:block">Filtrar por marca:</span>
              <select
                value={selectedMarca}
                onChange={(e) => setSelectedMarca(e.target.value)}
                className="bg-[#131B2E] border border-white/10 text-gray-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:bg-[#1C253B] transition-colors cursor-pointer min-w-[150px]"
              >
                <option value="">Todas</option>
                {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* Products */}
          {productosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-3xl h-[400px] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {productos.map((producto) => (
                <motion.div
                  key={producto.id}
                  variants={itemVariants}
                  className="group relative flex flex-col bg-gradient-to-br from-[#1A2333] to-[#0F1629] border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1"
                >
                  {/* Glass Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="relative h-64 p-8 flex items-center justify-center bg-[#0B1120]/30">
                    {/* Actions Overlay */}
                    <div className="absolute right-4 top-4 flex flex-col gap-2 z-20">
                      <button className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-gray-400 hover:text-white hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button onClick={() => navigate(`/producto/${producto.id}`)} className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-gray-400 hover:text-white hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300 delay-75">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="relative z-10 w-full h-full group-hover:scale-110 transition-transform duration-500 cursor-pointer" onClick={() => navigate(`/producto/${producto.id}`)}>
                      {producto.imagen_url ? (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-30">
                          {getCategoryIcon(producto.categoria_nombre)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/10">
                        {producto.marca_nombre}
                      </span>
                      <div className="flex gap-0.5">
                        {renderStars(producto.rating_promedio)}
                      </div>
                    </div>

                    <Link to={`/producto/${producto.id}`} className="mb-2">
                      <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {producto.nombre}
                      </h3>
                    </Link>

                    <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Precio</span>
                        <span className="text-2xl font-bold text-white">${parseFloat(producto.precio).toFixed(2)}</span>
                      </div>

                      <button
                        onClick={() => addToCart(producto)}
                        disabled={producto.stock <= 0}
                        className={`
                                            relative overflow-hidden pl-4 pr-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 group/btn
                                            ${producto.stock <= 0
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-blue-500 hover:text-white shadow-lg hover:shadow-blue-500/25'}
                                        `}
                      >
                        <span className="relative z-10 font-bold">{producto.stock <= 0 ? "Agotado" : "Agregar"}</span>
                        {producto.stock > 0 && <Plus className="h-4 w-4 relative z-10" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!productosLoading && productos.length === 0 && (
            <div className="text-center py-20">
              <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white">Sin resultados</h3>
              <p className="text-gray-500">Intenta con otros filtros.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0F1629] border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white">Carrito</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <ShoppingCart className="h-16 w-16 mb-4" />
                    <p>Tu carrito está vacío</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-colors">
                      <div className="h-20 w-20 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                        {item.imagen_url ? (
                          <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                        ) : <Package className="h-8 w-8 text-gray-500" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white line-clamp-1">{item.nombre}</h4>
                        <p className="text-blue-400 font-bold mt-1">${parseFloat(item.precio).toFixed(2)}</p>

                        <div className="flex items-center gap-3 mt-3">
                          <button onClick={() => updateCartQuantity(item.id, item.cantidad - 1)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-medium text-white w-6 text-center">{item.cantidad}</span>
                          <button onClick={() => updateCartQuantity(item.id, item.cantidad + 1)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white">
                            <Plus className="h-4 w-4" />
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-auto p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white/5 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-xl font-bold text-white">
                    <span>Total</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <Link
                    to="/tienda/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-center rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all transform active:scale-95"
                  >
                    Proceder al Pago
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu (Optional if needed, but actions are in header now) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B1120] p-6 lg:hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Menú</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-xl"><X className="text-white" /></button>
          </div>
          <div className="space-y-4">
            <Link to="/tienda/perfil" className="block p-4 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-xl font-bold text-center">Mi Perfil</Link>
            <button onClick={logout} className="block w-full p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold text-center">Cerrar Sesión</button>
          </div>
        </div>
      )}

    </div>
  );
}
