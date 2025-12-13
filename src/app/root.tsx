/**
 * root.tsx - LAYOUT GLOBAL DE LA APLICACIÓN
 * ==========================================
 * 
 * Este archivo es el "esqueleto" de TODA la aplicación.
 * Se renderiza UNA SOLA VEZ y envuelve a todas las páginas.
 * 
 * CONCEPTOS CLAVE:
 * • Layout: Define <html>, <head>, <body> - estructura base
 * • Outlet: "Agujero" donde se inyectan las páginas (page.jsx)
 * • Providers: Contextos globales (Auth, Cart) que comparten estado
 * 
 * FLUJO:
 * 1. Usuario visita /productos
 * 2. React Router renderiza <Layout> (esto)
 * 3. Dentro de <Outlet />, inyecta productos/page.jsx
 * 4. Los providers rodean todo para compartir estado global
 */

import {
  Links,        // Inyecta <link> tags (CSS, preload)
  Meta,         // Inyecta <meta> tags (SEO, viewport)
  Outlet,       // 🔥 CLAVE: Aquí se renderizan las páginas hijas
  Scripts,      // Inyecta <script> tags (JavaScript de React)
  ScrollRestoration,  // Restaura posición de scroll al navegar
  useAsyncError,
  useLocation,  // Hook para obtener URL actual
  useRouteError,
} from 'react-router';

import { useButton } from '@react-aria/button';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FC,
  Component,
} from 'react';

// CSS global (Tailwind CSS)
import './global.css';

// Fetch customizado (polyfill o extensión)
import fetch from '@/__create/fetch';

// PROVIDERS GLOBALES (Context API)
// @ts-ignore
import { AuthProvider } from '@/hooks/useAuth';      // 🔐 Autenticación global
import { CartProvider } from '@/context/CartContext'; // 🛒 Carrito de compras global

import { useNavigate } from 'react-router';
// @ts-ignore
import { serializeError } from 'serialize-error';
import { Toaster } from 'sonner';  // 🔔 Notificaciones tipo toast
// @ts-ignore
import { LoadFonts } from 'virtual:load-fonts.jsx';
import { HotReloadIndicator } from '../__create/HotReload';
import { useSandboxStore } from '../__create/hmr-sandbox-store';
import type { Route } from './+types/root';
import { useDevServerHeartbeat } from '../__create/useDevServerHeartbeat';

export const links = () => [];

// POLYFILL: Reemplaza fetch nativo con versión customizada (si existe)
if (globalThis.window && globalThis.window !== undefined) {
  globalThis.window.fetch = fetch;
}

/**
 * ERROR BOUNDARY UI
 * Componente visual que aparece cuando hay un error en la app
 * (No confundir con la lógica de captura de errores)
 */
function SharedErrorBoundary({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children?: ReactNode;
}): React.ReactElement {
  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
    >
      <div className="bg-[#18191B] text-[#F2F2F2] rounded-lg p-4 max-w-md w-full mx-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-[#F2F2F2] rounded-full flex items-center justify-center">
              <span className="text-black text-[1.125rem] leading-none">⚠</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-col gap-1">
              <p className="font-light text-[#F2F2F2] text-sm">App Error Detected</p>
              <p className="text-[#959697] text-sm font-light">
                It looks like an error occurred while trying to use your app.
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ERROR BOUNDARY EXPORTADO
 * React Router llama esto automáticamente cuando hay un error
 * (Equivalente a try-catch pero para componentes React)
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <SharedErrorBoundary isOpen={true} />;
}

function InternalErrorBoundary({ error: errorArg }: Route.ErrorBoundaryProps) {
  const routeError = useRouteError();
  const asyncError = useAsyncError();
  const error = errorArg ?? asyncError ?? routeError;
  const [isOpen, setIsOpen] = useState(false);

  // Animar entrada del error
  useEffect(() => {
    const animateTimer = setTimeout(() => setIsOpen(true), 100);
    return () => clearTimeout(animateTimer);
  }, []);

  // Botón: Mostrar logs (solo en iframe - desarrollo)
  const { buttonProps: showLogsButtonProps } = useButton(
    {
      onPress: useCallback(() => {
        window.parent.postMessage(
          {
            type: 'sandbox:web:show-logs',
          },
          '*'
        );
      }, []),
    },
    useRef<HTMLButtonElement>(null)
  );

  // Botón: Intentar arreglar con IA (desarrollo)
  const { buttonProps: fixButtonProps } = useButton(
    {
      onPress: useCallback(() => {
        window.parent.postMessage(
          {
            type: 'sandbox:web:fix',
            error: serializeError(error),
          },
          '*'
        );
        setIsOpen(false);
      }, [error]),
      isDisabled: !error,
    },
    useRef<HTMLButtonElement>(null)
  );

  // Botón: Copiar error
  const { buttonProps: copyButtonProps } = useButton(
    {
      onPress: useCallback(() => {
        navigator.clipboard.writeText(JSON.stringify(serializeError(error)));
      }, [error]),
    },
    useRef<HTMLButtonElement>(null)
  );

  function isInIframe() {
    try {
      return window.parent !== window;
    } catch {
      return true;
    }
  }

  return (
    <SharedErrorBoundary isOpen={isOpen}>
      {isInIframe() ? (
        <div className="flex gap-2">
          {!!error && (
            <button
              className="flex flex-row items-center justify-center gap-[4px] outline-none transition-colors rounded-[8px] border-[1px] bg-[#f9f9f9] hover:bg-[#dbdbdb] active:bg-[#c4c4c4] border-[#c4c4c4] text-[#18191B] text-sm px-[8px] py-[4px] cursor-pointer"
              type="button"
              {...fixButtonProps}
            >
              Try to fix
            </button>
          )}

          <button
            className="flex flex-row items-center justify-center gap-[4px] outline-none transition-colors rounded-[8px] border-[1px] bg-[#2C2D2F] hover:bg-[#414243] active:bg-[#555658] border-[#414243] text-white text-sm px-[8px] py-[4px]"
            type="button"
            {...showLogsButtonProps}
          >
            Show logs
          </button>
        </div>
      ) : (
        <button
          className="flex flex-row items-center justify-center gap-[4px] outline-none transition-colors rounded-[8px] border-[1px] bg-[#2C2D2F] hover:bg-[#414243] active:bg-[#555658] border-[#414243] text-white text-sm px-[8px] py-[4px] w-fit"
          type="button"
          {...copyButtonProps}
        >
          Copy error
        </button>
      )}
    </SharedErrorBoundary>
  );
}

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = { hasError: boolean; error: unknown | null };

/**
 * ERROR BOUNDARY CLASS
 * Captura errores de JavaScript que ocurren en componentes hijos
 * Similar a try-catch pero para React components
 */
class ErrorBoundaryWrapper extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  // Se llama cuando un componente hijo lanza un error
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <InternalErrorBoundary error={this.state.error} params={{}} />;
    }
    return this.props.children;
  }
}

function LoaderWrapper({ loader }: { loader: () => React.ReactNode }) {
  return <>{loader()}</>;
}

type ClientOnlyProps = {
  loader: () => React.ReactNode;
};

/**
 * CLIENT ONLY COMPONENT
 * Solo renderiza en el navegador (NO en servidor)
 * Útil para componentes que usan window, localStorage, etc.
 * 
 * PATRÓN: SSR (Server-Side Rendering)
 * 1. Primera carga: Renderiza en servidor (HTML estático)
 * 2. Hydration: React "cobra vida" en cliente
 * 3. ClientOnly se salta paso 1 y solo hace paso 2
 */
export const ClientOnly: React.FC<ClientOnlyProps> = ({ loader }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <ErrorBoundaryWrapper>
      <LoaderWrapper loader={loader} />
    </ErrorBoundaryWrapper>
  );
};

/**
 * HMR CONNECTION MONITOR
 * Detecta si la conexión WebSocket con Vite está activa
 * (Hot Module Replacement = cambios sin recargar página)
 * 
 * @returns true si conectado, false si desconectado
 */
export function useHmrConnection(): boolean {
  const [connected, setConnected] = useState(() => !!import.meta.hot);

  useEffect(() => {
    // Solo funciona en desarrollo
    if (!import.meta.hot) return;

    const onDisconnect = () => setConnected(false);
    const onConnect = () => setConnected(true);

    import.meta.hot.on('vite:ws:disconnect', onDisconnect);
    import.meta.hot.on('vite:ws:connect', onConnect);

    const onFullReload = () => setConnected(false);
    import.meta.hot.on('vite:beforeFullReload', onFullReload);

    return () => {
      import.meta.hot?.off('vite:ws:disconnect', onDisconnect);
      import.meta.hot?.off('vite:ws:connect', onConnect);
      import.meta.hot?.off('vite:beforeFullReload', onFullReload);
    };
  }, []);

  return connected;
}

// COMUNICACIÓN CON IFRAME PADRE (desarrollo)
// Si la app corre dentro de un iframe, se comunica con el padre
const healthyResponseType = 'sandbox:web:healthcheck:response';
const useHandshakeParent = () => {
  const isHmrConnected = useHmrConnection();
  useEffect(() => {
    const healthyResponse = {
      type: healthyResponseType,
      healthy: isHmrConnected,
    };
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sandbox:web:healthcheck') {
        window.parent.postMessage(healthyResponse, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    window.parent.postMessage(healthyResponse, '*');
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isHmrConnected]);
};

// CODEGEN: Generación de código con IA (desarrollo)
const useCodeGen = () => {
  const { startCodeGen, setCodeGenGenerating, completeCodeGen, errorCodeGen, stopCodeGen } =
    useSandboxStore();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type } = event.data;

      switch (type) {
        case 'sandbox:web:codegen:started':
          startCodeGen();
          break;
        case 'sandbox:web:codegen:generating':
          setCodeGenGenerating();
          break;
        case 'sandbox:web:codegen:complete':
          completeCodeGen();
          break;
        case 'sandbox:web:codegen:error':
          errorCodeGen();
          break;
        case 'sandbox:web:codegen:stopped':
          stopCodeGen();
          break;
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [startCodeGen, setCodeGenGenerating, completeCodeGen, errorCodeGen, stopCodeGen]);
};

// REFRESH: Recargar página desde padre
const useRefresh = () => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sandbox:web:refresh:request') {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        window.parent.postMessage({ type: 'sandbox:web:refresh:complete' }, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
};

/**
 * LAYOUT - COMPONENTE PRINCIPAL
 * ==============================
 * Este es el "esqueleto" HTML de toda la app.
 * Se renderiza UNA SOLA VEZ y nunca cambia.
 * 
 * ESTRUCTURA:
 * <html>
 *   <head>
 *     <Meta />    - SEO tags
 *     <Links />   - CSS imports
 *   </head>
 *   <body>
 *     <AuthProvider>      - 🔐 Estado de autenticación global
 *       <CartProvider>    - 🛒 Estado del carrito global
 *         {children}      - 🔥 Aquí va el contenido de cada página
 *       </CartProvider>
 *     </AuthProvider>
 *     <Scripts />         - JavaScript de React
 *   </body>
 * </html>
 */
export function Layout({ children }: { children: ReactNode }) {
  useHandshakeParent();
  useCodeGen();
  useRefresh();
  useDevServerHeartbeat();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname;

  // Sincronizar navegación con iframe padre
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sandbox:navigation') {
        navigate(event.data.pathname);
      }
    };
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'sandbox:web:ready' }, '*');
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate]);

  // Notificar cambios de ruta al padre
  useEffect(() => {
    if (pathname) {
      window.parent.postMessage(
        {
          type: 'sandbox:web:navigation',
          pathname,
        },
        '*'
      );
    }
  }, [pathname]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />    {/* SEO tags dinámicos */}
        <Links />   {/* CSS imports */}
        <script type="module" src="/src/__create/dev-error-overlay.js"></script>
        <link rel="icon" href="/src/__create/favicon.png" />
        <LoadFonts /> {/* Cargar fuentes personalizadas */}
      </head>
      <body>
        {/* 
          ClientOnly: Solo renderiza en navegador (no en servidor)
          Necesario porque AuthProvider y Cart usan localStorage/window 
        */}
        <ClientOnly loader={() => (
          <AuthProvider>     {/* 🔐 Compartir usuario logueado en TODA la app */}
            <CartProvider>   {/* 🛒 Compartir carrito en TODA la app */}
              {children}     {/* 🔥 AQUÍ SE INYECTAN LAS PÁGINAS (<Outlet />) */}
            </CartProvider>
          </AuthProvider>
        )} />
        <HotReloadIndicator />      {/* Indicador de HMR */}
        <Toaster position="bottom-right" richColors />  {/* Notificaciones toast */}
        <ScrollRestoration />        {/* Guardar posición de scroll */}
        <Scripts />                  {/* JavaScript de React */}
        <script src="https://kit.fontawesome.com/2c15cc0cc7.js" crossOrigin="anonymous" async />
      </body>
    </html>
  );
}

/**
 * APP - COMPONENTE RAÍZ
 * =====================
 * Es el componente más simple pero MÁS IMPORTANTE.
 * <Outlet /> es el "agujero" donde React Router inyecta las páginas.
 * 
 * EJEMPLO:
 * Usuario visita /productos
 * → React Router busca src/app/productos/page.jsx
 * → Lo renderiza DENTRO de este <Outlet />
 * → Resultado: Layout global + página específica
 */
export default function App() {
  return <Outlet />;  // 🔥 AQUÍ SE RENDERIZAN TODAS LAS PÁGINAS
}
