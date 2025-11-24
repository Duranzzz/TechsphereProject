"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { Package, Eye, EyeOff } from "lucide-react";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signUpWithCredentials } = useAuth();

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
      await signUpWithCredentials({
        email,
        password,
        callbackUrl: "/admin",
        redirect: true,
      });
    } catch (err) {
      setError("Error al crear la cuenta. Intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl inline-block mb-4">
            <Package className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TechSphere Admin
          </h1>
          <p className="text-gray-600 mt-2">Crear Cuenta de Administrador</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Registro
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
                  placeholder="Crea una contraseña"
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
              {loading ? "Cargando..." : "Crear Cuenta"}
            </button>

            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <a
                href="/account/signin"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Iniciar sesión
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MainComponent;
