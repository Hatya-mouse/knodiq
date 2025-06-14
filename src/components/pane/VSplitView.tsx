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
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newTopHeight = e.clientY - rect.top;
            setTopHeight(newTopHeight);
        };

        const stopResize = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", stopResize);
        };

        const startResize = () => {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", stopResize);
        };

        const hitArea = document.getElementById("split-handle-hit");
        hitArea?.addEventListener("mousedown", startResize);

        return () => {
            hitArea?.removeEventListener("mousedown", startResize);
        };
    }, []);

    return (
        <div ref={containerRef} className={`flex relative ${doesStrech ? "items-strech" : ""} ${className}`}>
            <div style={{ height: topHeight }} className="shrink-0 overflow-hidden">
                {top}
            </div>
            <div
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
                id="split-handle-hit"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div
                    id="split-handle"
                    className={`w-0.5 cursor-ew-resize ${isHovered ? "bg-[var(--accent-color)]" : "bg-gray-400"} shrink-0 transition-all`}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        transform: "translateX(-50%)",
                        pointerEvents: "auto",
                    }}
                />
            </div>
            <div className="min-h-full flex-1 overflow-hidden min-w-0">
                {bottom}
            </div>
        </div>
    );
}