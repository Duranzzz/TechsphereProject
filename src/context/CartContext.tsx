/**
 * CartContext - PROVIDER DE CARRITO DE COMPRAS GLOBAL
 * ====================================================
 * 
 * PROPÓSITO:
 * Gestionar el carrito de compras en TODA la aplicación.
 * Permite agregar/quitar productos, calcular totales, y persistir en localStorage.
 * 
 * CARACTERÍSTICAS:
 * • Estado global: Accesible desde cualquier componente
 * • Persistencia: Se guarda en localStorage (sobrevive a recargas)
 * • Sincronización: Se limpia automáticamente al cerrar sesión
 * • Notificaciones: Toast messages al agregar/quitar productos
 * 
 * PATRÓN: Context API + TypeScript
 * Similar a AuthProvider pero con lógica más compleja (carrito)
 */

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';  // Librería de notificaciones (toasts)
// @ts-ignore
import { useAuth } from '@/hooks/useAuth';

/**
 * TIPOS DE DATOS (TypeScript)
 * Define la "forma" de los datos para ayuda de autocompletado y errores
 */

// Producto en el carrito
interface CartItem {
    id: number | string;
    nombre: string;
    precio: number | string;
    cantidad: number;
    imagen_url?: string;
    categoria_nombre?: string;
    [key: string]: any;  // Permite propiedades adicionales
}

// Funciones y datos disponibles via useCart()
interface CartContextType {
    cart: CartItem[];                         // Array de productos
    addToCart: (product: any) => void;        // Agregar producto
    updateCartQuantity: (id: number | string, qty: number) => void;  // Cambiar cantidad
    removeFromCart: (id: number | string) => void;  // Quitar producto
    clearCart: () => void;                    // Limpiar todo el carrito
    getCartTotal: () => number;               // Calcular precio total
    getCartItemCount: () => number;           // Contar total de items
    isInitialized: boolean;                   // ¿Ya cargó de localStorage?
}

// Crear contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider - COMPONENTE PROVEEDOR
 * 
 * Gestiona todo el estado del carrito y lo comparte globalmente
 */
export function CartProvider({ children }: { children: ReactNode }) {
    // ESTADOS LOCALES (compartidos globalmente)
    const [cart, setCart] = useState<CartItem[]>([]);           // Productos en carrito
    const [isInitialized, setIsInitialized] = useState(false);  // Flag de inicialización

    // Acceso al usuario actual (necesario para limpiar al logout)
    const { user } = useAuth();
    const previousUser = useRef(user);  // Guardar usuario previo

    /**
     * EFECTO 1: Limpiar carrito al cerrar sesión
     * 
     * Compara usuario anterior vs actual
     * Si había usuario y ahora no → Logout → Limpiar carrito
     */
    useEffect(() => {
        if (previousUser.current && !user) {
            setCart([]);
            localStorage.removeItem('cart');
            toast.info('Carrito limpiado por cierre de sesión');
        }
        previousUser.current = user;
    }, [user]);  // Se ejecuta cada vez que user cambia

    /**
     * EFECTO 2: Cargar carrito desde localStorage al iniciar
     * 
     * Se ejecuta UNA SOLA VEZ al montar el componente
     * Restaura productos guardados previamente
     */
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));  // Parsear JSON a array
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
        } finally {
            setIsInitialized(true);  // Marcar como inicializado
        }
    }, []);  // [] = solo al montar

    /**
     * EFECTO 3: Guardar carrito en localStorage al cambiar
     * 
     * Se ejecuta cada vez que el carrito cambia
     * Pero SOLO después de la inicialización (evita sobrescribir con carrito vacío)
     */
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, isInitialized]);  // Se ejecuta cuando cart o isInitialized cambian

    /**
     * AGREGAR AL CARRITO
     * 
     * Lógica inteligente:
     * • Si el producto YA está en el carrito → Incrementa cantidad
     * • Si es nuevo → Agrega con cantidad 1
     * 
     * PATRÓN: Actualización inmutable de estado
     * setCart((prevCart) => ...) garantiza que usamos el valor más reciente
     */
    const addToCart = (product: any) => {
        setCart((prevCart) => {
            // Buscar si ya existe en el carrito
            const existingItem = prevCart.find((item) => item.id === product.id);

            if (existingItem) {
                // Ya existe → Incrementar cantidad
                toast.success(`Cantidad actualizada: ${product.nombre}`);
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, cantidad: item.cantidad + 1 }  // Incrementa
                        : item,  // Mantiene otros sin cambios
                );
            }

            // No existe → Agregar nuevo con cantidad 1
            toast.success(`Agregado al carrito: ${product.nombre}`);
            return [...prevCart, { ...product, cantidad: 1 }];
        });
    };

    /**
     * ACTUALIZAR CANTIDAD
     * 
     * Cambia la cantidad de un producto específico
     * Si la nueva cantidad es <= 0 → Quita el producto
     */
    const updateCartQuantity = (productId: number | string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId
                    ? { ...item, cantidad: newQuantity }
                    : item,
            ),
        );
    };

    /**
     * QUITAR DEL CARRITO
     * 
     * Filtra el array eliminando el producto con ese ID
     */
    const removeFromCart = (productId: number | string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    /**
     * LIMPIAR CARRITO COMPLETO
     * 
     * Útil después de completar una compra
     */
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    /**
     * CALCULAR TOTAL DEL CARRITO
     * 
     * Suma: (precio × cantidad) de cada producto
     * 
     * MÉTODO: Array.reduce()
     * • total: Acumulador (empieza en 0)
     * • item: Cada producto del carrito
     * • Retorna: total + (precio × cantidad)
     */
    const getCartTotal = () => {
        return cart.reduce(
            (total, item) => total + parseFloat(String(item.precio)) * item.cantidad,
            0,  // Valor inicial del acumulador
        );
    };

    /**
     * CONTAR ITEMS EN CARRITO
     * 
     * Suma todas las cantidades
     * Ejemplo: 2 iPhones + 3 MacBooks = 5 items
     */
    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.cantidad, 0);
    };

    /**
     * PROVIDER: Expone todas las funciones y datos
     * 
     * Todo lo que está en value={{ ... }} es accesible via useCart()
     */
    return (
        <CartContext.Provider
            value={{
                cart,                 // Array de productos
                addToCart,            // Función para agregar
                updateCartQuantity,   // Función para cambiar cantidad
                removeFromCart,       // Función para quitar
                clearCart,            // Función para limpiar todo
                getCartTotal,         // Función para calcular total
                getCartItemCount,     // Función para contar items
                isInitialized         // Flag de carga inicial
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

/**
 * useCart - HOOK PERSONALIZADO
 * 
 * Permite acceder al carrito desde cualquier componente
 * 
 * EJEMPLO DE USO:
 * ```tsx
 * function ProductCard({ producto }) {
 *     const { addToCart, cart } = useCart();
 *     
 *     const isInCart = cart.some(item => item.id === producto.id);
 *     
 *     return (
 *         <div>
 *             <h3>{producto.nombre}</h3>
 *             <button onClick={() => addToCart(producto)}>
 *                 {isInCart ? 'Ya en carrito' : 'Agregar'}
 *             </button>
 *         </div>
 *     );
 * }
 * ```
 * 
 * OTRO EJEMPLO (Navbar con contador):
 * ```tsx
 * function Navbar() {
 *     const { getCartItemCount } = useCart();
 *     const count = getCartItemCount();
 *     
 *     return (
 *         <Link to="/cart">
 *             🛒 Carrito ({count})
 *         </Link>
 *     );
 * }
 * ```
 */
export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }

    return context;
}
