"use client";

import { Link } from "react-router";
import { Package } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 text-white">
            <div className="max-w-4xl w-full text-center space-y-12">
                {/* Logo/Brand */}
                <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl shadow-blue-500/20">
                        <Package className="h-16 w-16 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent bg-300% animate-gradient">
                        TechSphere
                    </h1>
                    <p className="text-xl text-gray-400 max-w-lg mx-auto">
                        Entrada al sistema
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                    <Link
                        to="/registro"
                        className="group px-8 py-4 bg-gray-800 border border-gray-700 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto text-gray-300 hover:text-white flex justify-center"
                    >
                        Empezar
                    </Link>

                    <Link
                        to="/login"
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto overflow-hidden flex justify-center"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative">Ya tengo cuenta</span>
                    </Link>
                </div>
            </div>

            {/* Background Decor */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>
        </div>
    );
}
