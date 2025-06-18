import React, { useRef, useState, useEffect } from "react";

export default function HSplitView({
    left,
    right,
    className = "",
    doesStrech = false,
    leftWidth = 200,
    onDragMove = () => { },
    onDragEnd = () => { },
}: {
    left: React.ReactNode,
    right: React.ReactNode,
    className?: string,
    doesStrech?: boolean,
    leftWidth?: number,
    onDragMove?: (width: number) => void,
    onDragEnd?: () => void,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const splitHandleRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            onDragMove(newLeftWidth);

            e.preventDefault();
        };

        const stopResize = (e: MouseEvent) => {
            onDragEnd();

            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", stopResize);
            setIsDragging(false);

            e.preventDefault();
        };

        const startResize = (e: MouseEvent) => {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", stopResize);
            setIsDragging(true);

            e.preventDefault();
        };

        splitHandleRef.current?.addEventListener("mousedown", startResize);

        return () => {
            splitHandleRef.current?.removeEventListener("mousedown", startResize);
        };
    }, []);

    return (
        <div ref={containerRef} className={`flex relative ${doesStrech ? "items-strech" : ""} ${className}`}>
            <div style={{ width: leftWidth }} className="shrink-0 overflow-hidden">
                {left}
            </div>
            <div
                ref={splitHandleRef}
                style={{
                    width: 16,
                    cursor: "ew-resize",
                    position: "absolute",
                    left: leftWidth - 8,
                    top: 0,
                    bottom: 0,
                    zIndex: 5,
                    background: "transparent",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div
                    className={`cursor-ew-resize ${isHovered || isDragging ? "bg-[var(--accent-color)] w-1.5 z-100" : "bg-gray-400 w-0.5 z-50"} shrink-0 transition-all`}
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
            <div className="min-h-full flex-1 overflow-hidden min-w-full">
                {right}
            </div>
        </div>
    );
}