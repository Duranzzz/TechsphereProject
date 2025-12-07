"use client";

import { Link } from "react-router";
import { Package, ShieldCheck, Truck, Zap, Star, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import NebulaBackground from "@/components/NebulaBackground";

export default function LandingPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="fixed inset-0 overflow-hidden">
            <div className="min-h-screen bg-[#0B1120] text-white relative overflow-hidden selection:bg-blue-500/30">
                {/* Dynamic Background */}
                <NebulaBackground />
                <div className="fixed inset-0 pointer-events-none">
                    <div
                        className="absolute inset-0 opacity-100" // Increased opacity
                        style={{
                            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(56, 189, 248, 0.25), transparent 70%)` // Intensified gradient
                        }}
                    />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 animate-pulse delay-1000" />
                </div>

                {/* Logo Centered */}
                <div className="pt-10 flex justify-center relative z-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                            <Package className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            TechSphere
                        </span>
                    </div>
                </div>

                {/* Hero Section */}
                <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="space-y-8"
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Nueva Colección 2025 Disponible
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold leading-tight">
                                Tecnología del <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-gradient bg-300%">
                                    Futuro, Hoy.
                                </span>
                            </motion.h1>

                            <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-xl leading-relaxed">
                                Descubre la selección más exclusiva de gadgets y dispositivos. Calidad premium, envíos rápidos y garantía asegurada.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/registro"
                                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative flex items-center gap-2">
                                        Empezar Ahora <ArrowRight className="h-5 w-5" />
                                    </span>
                                </Link>
                                <Link
                                    to="/login"
                                    className="group relative px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg text-white shadow-xl shadow-white/5 hover:shadow-white/20 transition-all hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        Ya tengo cuenta
                                    </span>
                                </Link>
                            </motion.div>

                            <motion.div variants={itemVariants} className="pt-8 flex items-center gap-8 text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className={`h-8 w-8 rounded-full border-2 border-[#0B1120] bg-gray-700 flex items-center justify-center text-xs text-white z-${10 - i}`}>
                                                {/* Placeholder avatars */}
                                                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-white font-bold block">+10k</span>
                                        Clientes felices
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right Side Visuals */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-2 shadow-2xl">
                                <div className="bg-[#0B1120] rounded-[2rem] overflow-hidden relative aspect-4/3 group">
                                    <img
                                        src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2670&auto=format&fit=crop"
                                        alt="Latest Tech"
                                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-80" />

                                    {/* Floating Cards */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-lg">MacBook Pro M3</h3>
                                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">New</span>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-4">Potencia sin límites para profesionales.</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-white">$1,299</span>
                                            <div className="flex gap-1">
                                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -top-12 -right-12 h-64 w-64 bg-purple-500/30 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute -bottom-12 -left-12 h-64 w-64 bg-blue-500/30 rounded-full blur-[80px] pointer-events-none" />
                        </motion.div>
                    </div>

                    {/* Features Grid Removed */}
                </main>
            </div>
        </div>
    );
}
