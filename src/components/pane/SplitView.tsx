import React, { useRef, useState, useEffect } from "react";

export default function SplitView({
    left,
    right,
    className = "",
    doesStrech = false,
    initialLeftWidth = 200,
    minLeftWidth = 100,
    minRightWidth = 100,
}: {
    left: React.ReactNode,
    right: React.ReactNode,
    className?: string,
    doesStrech?: boolean
    initialLeftWidth?: number,
    minLeftWidth?: number,
    minRightWidth?: number,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [leftWidth, setLeftWidth] = useState(initialLeftWidth);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = e.clientX - rect.left;
            const maxLeft = rect.width - minRightWidth;
            const clamped = Math.max(minLeftWidth, Math.min(maxLeft, newLeftWidth));
            setLeftWidth(clamped);
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
    }, [minLeftWidth, minRightWidth]);

    return (
        <div ref={containerRef} className={`flex relative ${doesStrech ? "items-strech" : ""} ${className}`}>
            <div style={{ width: leftWidth }} className="shrink-0 overflow-hidden">
                {left}
            </div>
            {/* Absolutely positioned invisible hit area for the handle */}
            <div
                style={{
                    width: 16,
                    cursor: "ew-resize",
                    position: "absolute",
                    left: leftWidth - 8, // Center the hit area on the split
                    top: 0,
                    bottom: 0,
                    zIndex: 10,
                    background: "transparent", // invisible
                }}
                id="split-handle-hit"
            >
                <div
                    id="split-handle"
                    className="w-0.5 cursor-ew-resize bg-gray-400 hover:bg-[var(--accent-color)] shrink-0 transition-all"
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