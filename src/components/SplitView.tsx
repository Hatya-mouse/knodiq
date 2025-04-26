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

        const handle = document.getElementById("split-handle");
        handle?.addEventListener("mousedown", startResize);

        return () => {
            handle?.removeEventListener("mousedown", startResize);
        };
    }, [minLeftWidth, minRightWidth]);

    return (
        <div ref={containerRef} className={`flex ${doesStrech ? "items-strech" : ""} ${className}`}>
            <div style={{ width: leftWidth }} className="shrink-0 overflow-hidden">
                {left}
            </div>
            <div
                id="split-handle"
                className=" w-1 cursor-ew-resize bg-gray-400 hover:bg-gray-500 shrink-0"
            />
            <div className="min-h-full flex-1 overflow-hidden min-w-0">
                {right}
            </div>
        </div>
    );
}