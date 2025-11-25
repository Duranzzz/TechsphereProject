"use client";

import useAuth from "@/utils/useAuth";
import { Package, LogOut, ArrowLeft, Smartphone, Monitor, Gamepad2 } from "lucide-react";

function MainComponent() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-pink-600/20 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl inline-block mb-4 shadow-lg shadow-purple-500/20">
            <Package className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            TechSphere
          </h1>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10 text-center">
          <div className="bg-rose-500/20 p-4 rounded-full inline-block mb-6">
            <LogOut className="h-8 w-8 text-rose-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Cerrar Sesión
          </h2>
          <p className="text-blue-200/60 mb-8 text-lg">
            ¿Estás seguro de que quieres cerrar tu sesión de administrador?
          </p>

          <button
            onClick={handleSignOut}
            className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-4 py-3.5 text-lg font-bold text-white transition-all duration-200 shadow-lg shadow-rose-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>

          <a
            href="/admin"
            className="w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-sm font-medium text-blue-200 hover:text-white flex items-center justify-center gap-2 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </a>
        </div>

        {/* Decorative icons */}
        <div className="flex justify-center space-x-8 mt-12">
          <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors duration-300">
            <Smartphone className="h-6 w-6 text-blue-400" />
          </div>
          <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors duration-300">
            <Monitor className="h-6 w-6 text-purple-400" />
          </div>
          <div className="bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors duration-300">
            <Gamepad2 className="h-6 w-6 text-pink-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
