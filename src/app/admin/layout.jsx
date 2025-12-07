"use client";

import { useState, useEffect } from "react";
import NebulaBackground from "@/components/NebulaBackground";

export default function AdminLayout({ children }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative selection:bg-purple-500/30">
            {/* Nebula Background */}
            <NebulaBackground />

            {/* Mouse Tracking Gradient */}
            <div
                className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.15), transparent 70%)`,
                }}
            />

            {/* Content */}
            <div className="relative z-40">
                {children}
            </div>
        </div>
    );
}
