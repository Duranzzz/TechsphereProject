import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
// @ts-ignore
import { useAuth } from '@/hooks/useAuth';

interface CartItem {
    id: number | string;
    nombre: string;
    precio: number | string;
    cantidad: number;
    imagen_url?: string;
    categoria_nombre?: string;
    [key: string]: any;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any) => void;
    updateCartQuantity: (productId: number | string, newQuantity: number) => void;
    removeFromCart: (productId: number | string) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartItemCount: () => number;
    isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const { user } = useAuth();
    const previousUser = useRef(user);

    // Clear cart on logout
    useEffect(() => {
        if (previousUser.current && !user) {
            setCart([]);
            localStorage.removeItem('cart');
            toast.info('Carrito limpiado por cierre de sesión');
        }
        previousUser.current = user;
    }, [user]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    // Save to localStorage whenever cart changes, but only after initialization
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, isInitialized]);

    const addToCart = (product: any) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                toast.success(`Cantidad actualizada: ${product.nombre}`);
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item,
                );
            }
            toast.success(`Agregado al carrito: ${product.nombre}`);
            return [...prevCart, { ...product, cantidad: 1 }];
        });
    };

    const updateCartQuantity = (productId: number | string, newQuantity: number) => {
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

    const removeFromCart = (productId: number | string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    const getCartTotal = () => {
        return cart.reduce(
            (total, item) => total + parseFloat(String(item.precio)) * item.cantidad,
            0,
        );
    };

    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.cantidad, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                updateCartQuantity,
                removeFromCart,
                clearCart,
                getCartTotal,
                getCartItemCount,
                isInitialized
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
