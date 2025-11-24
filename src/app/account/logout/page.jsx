"use client";

import useAuth from "@/utils/useAuth";
import { Package } from "lucide-react";

function MainComponent() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl inline-block mb-4">
            <Package className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TechSphere
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cerrar Sesión
          </h2>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que quieres cerrar tu sesión de administrador?
          </p>

          <button
            onClick={handleSignOut}
            className="w-full rounded-xl bg-gradient-to-r from-red-500 to-purple-600 px-4 py-3 text-lg font-medium text-white transition-all duration-200 hover:from-red-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg"
          >
            Cerrar Sesión
          </button>

          <a
            href="/admin"
            className="block mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
