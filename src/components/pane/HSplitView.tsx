import React, { useRef, useState, useEffect } from "react";

export default function HSplitView({
    left,
    right,
    className = "",
    doesStrech = false,
    leftWidth = 200,
    setLeftWidth = () => { },
}: {
    left: React.ReactNode,
    right: React.ReactNode,
    className?: string,
    doesStrech?: boolean,
    leftWidth?: number,
    setLeftWidth?: (width: number) => void,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = e.clientX - rect.left;
            setLeftWidth(newLeftWidth);
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
            <div style={{ width: leftWidth }} className="shrink-0 overflow-hidden">
                {left}
            </div>
            <div
                style={{
                    width: 16,
                    cursor: "ew-resize",
                    position: "absolute",
                    left: leftWidth - 8,
                    top: 0,
                    bottom: 0,
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
                        left: "50%",
                        top: 0,
                        bottom: 0,
                        transform: "translateX(-50%)",
                        pointerEvents: "auto",
                    }}
                />
            </div>
            <div className="min-h-full flex-1 overflow-hidden min-w-0">
                {right}
            </div>
        </div>
    );
}