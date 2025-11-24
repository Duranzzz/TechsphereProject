"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";
import {
  Package,
  Smartphone,
  Monitor,
  Gamepad2,
  Eye,
  EyeOff,
} from "lucide-react";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    try {
      const res = await signInWithCredentials({
        email,
        password,
        redirect: false, // Prevent automatic redirect to handle errors
      });

      if (res?.error) {
        // Map Auth.js error codes to user messages if needed, 
        // but since we throw Errors in auth.js, they might come through differently depending on the adapter.
        // However, with redirect: false, res.error usually contains the error message or code.
        // If we threw "El usuario no existe", it might show up here.

        // Note: In some Auth.js versions, custom errors are wrapped. 
        // Let's assume the error string is passed or we map it.
        // For now, we display the error returned.
        if (res.error.includes("usuario")) setError("El usuario no existe");
        else if (res.error.includes("contraseña")) setError("La contraseña es incorrecta");
        else setError("Credenciales incorrectas");
      } else {
        // Success
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl inline-block mb-4">
            <Package className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TechSphere Admin
          </h1>
          <p className="text-gray-600 mt-2">Panel de Administración</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Iniciar Sesión
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20">
                <input
                  required
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu email"
                  className="w-full bg-transparent text-lg outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 flex items-center gap-2">
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-lg outline-none"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}



            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-lg font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 shadow-lg"
            >
              {loading ? "Cargando..." : "Ingresar al Admin"}
            </button>

            <a
              href="/"
              className="block w-full rounded-xl bg-gradient-to-r from-red-500 to-purple-600 px-4 py-3 text-lg font-medium text-white text-center transition-all duration-200 hover:from-red-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg"
            >
              Volver a la tienda
            </a>
          </div>


        </form>

        {/* Decorative icons */}
        <div className="flex justify-center space-x-6 mt-8 opacity-60">
          <Smartphone className="h-8 w-8 text-blue-500" />
          <Monitor className="h-8 w-8 text-purple-500" />
          <Gamepad2 className="h-8 w-8 text-blue-500" />
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
