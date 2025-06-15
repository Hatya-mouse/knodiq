import React, { useRef, useState, useEffect } from "react";

export default function VSplitView({
    top,
    bottom,
    className = "",
    doesStrech = false,
    topHeight = 200,
    setTopHeight = () => { },
}: {
    top: React.ReactNode,
    bottom: React.ReactNode,
    className?: string,
    doesStrech?: boolean,
    topHeight?: number,
    setTopHeight?: (height: number) => void,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const splitHandleRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newTopHeight = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
            setTopHeight(newTopHeight);

            e.preventDefault();
        };

        const stopResize = (e: MouseEvent) => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", stopResize);

            e.preventDefault();
        };

        const startResize = (e: MouseEvent) => {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", stopResize);

            e.preventDefault();
        };

        splitHandleRef.current?.addEventListener("mousedown", startResize);

        return () => {
            splitHandleRef.current?.removeEventListener("mousedown", startResize);
        };
    }, []);

    return (
        <div ref={containerRef} className={`flex flex-col relative ${doesStrech ? "items-strech" : ""} ${className}`}>
            <div style={{ height: topHeight }} className="shrink-0 overflow-hidden">
                {top}
            </div>
            <div
                ref={splitHandleRef}
                style={{
                    height: 16,
                    cursor: "ns-resize",
                    position: "absolute",
                    top: topHeight - 8,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    background: "transparent",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div
                    className={`cursor-ns-resize ${isHovered ? "bg-[var(--accent-color)] h-1.5 z-100" : "bg-gray-400 h-0.5 z-50"} shrink-0 transition-all`}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        transform: "translateY(-50%)",
                        pointerEvents: "auto",
                    }}
                />
            </div>
            <div className="min-w-full flex-1 overflow-hidden min-h-full">
                {bottom}
            </div>
        </div>
    );
}
