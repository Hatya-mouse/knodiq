import { useState, useRef, useEffect } from "react";

export default function PaneDragZone({
    className = "",
    direction,
    onMouseEnter = () => { },
    onMouseLeave = () => { },
    onDragMove = () => { },
    onDragEnd = () => { },
}: {
    className?: string,
    direction: "top" | "bottom" | "left" | "right",
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onDragMove?: (amount: number) => void;
    onDragEnd?: () => void;
}) {
    const [isHovered, setIsHovered] = useState(false);

    const hitArea = useRef<HTMLDivElement>(null);
    const startMousePos = useRef(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            let newDragAmount = 0;
            if (direction === "top" || direction === "bottom") {
                newDragAmount = e.clientY - startMousePos.current;
            } else {
                newDragAmount = e.clientX - startMousePos.current;
            }
            onDragMove(newDragAmount);

            e.preventDefault();
        };

        const handleMouseUp = (e: MouseEvent) => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            onDragEnd();

            e.preventDefault();
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (direction === "top" || direction === "bottom") {
                startMousePos.current = e.clientY;
            } else {
                startMousePos.current = e.clientX;
            }

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);

            e.preventDefault();
        };

        const hitAreaElement = hitArea.current;
        hitAreaElement?.addEventListener("mousedown", handleMouseDown);

        return () => {
            hitAreaElement?.removeEventListener("mousedown", handleMouseDown);
        }
    }, [direction, onDragMove, onDragEnd]);

    const edgeSvg = (<svg className="absolute" viewBox="0 0 3 1">
        <path
            d="
            M 0 0
            H 3
            V 1
            C 3 0, 2 0, 0 0
            z
            "
            fill="var(--accent-blue)"
        />
    </svg>);

    const edgeSvgReverse = (<svg className="absolute" viewBox="0 0 3 1">
        <path
            d="
            M 3 0
            H 0
            V 1
            C 0 0, 1 0, 3 0
            z
            "
            fill="var(--accent-blue)"
        />
    </svg>);

    return (
        <div
            ref={hitArea}
            className={`absolute ${className}`}
            style={{
                zIndex: 5,
            }}
            onMouseEnter={() => {
                setIsHovered(true);
                onMouseEnter();
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                onMouseLeave();
            }}
        >
            {/* Drag zone for the {direction} edge */}
            <div
                className={`absolute transition-all duration-150 ease-out ${isHovered ? "bg-[var(--accent-blue)]" : "opacity-0"}`}
                style={{
                    transformOrigin: direction,
                    transform: direction === "top" || direction === "bottom" ?
                        isHovered ? "scaleY(1)" : "scaleY(0)" :
                        isHovered ? "scaleX(1)" : "scaleX(0)",
                    top: direction === "top" ? -6 : "auto",
                    bottom: direction === "bottom" ? -6 : "auto",
                    left: direction === "left" ? -6 : "auto",
                    right: direction === "right" ? -6 : "auto",
                    width: direction === "top" || direction === "bottom" ? "100%" : "6px",
                    height: direction === "left" || direction === "right" ? "100%" : "6px",
                }}
            >
                <div className="absolute" style={{
                    top: direction === "top" ? 6 :
                        direction === "left" ? 0 : "auto",
                    bottom: direction === "bottom" ? 6 :
                        direction === "right" ? 0 : "auto",
                    left: direction === "left" ? 6 :
                        direction === "bottom" ? 0 : "auto",
                    right: direction === "right" ? 6 :
                        direction === "top" ? 0 : "auto",
                    width: "20px",
                    height: "20px",
                    transform: direction === "top" ? "rotate(0deg)" :
                        direction === "bottom" ? "rotate(180deg)" :
                            direction === "left" ? "rotate(-90deg)" :
                                "rotate(90deg)",
                }}>
                    {edgeSvg}
                </div>

                <div className="absolute" style={{
                    top: direction === "top" ? 6 :
                        direction === "right" ? 0 : "auto",
                    bottom: direction === "bottom" ? 6 :
                        direction === "left" ? 0 : "auto",
                    left: direction === "left" ? 6 :
                        direction === "top" ? 0 : "auto",
                    right: direction === "right" ? 6 :
                        direction === "bottom" ? 0 : "auto",
                    width: "20px",
                    height: "20px",
                    transform: direction === "top" ? "rotate(0deg)" :
                        direction === "bottom" ? "rotate(180deg)" :
                            direction === "left" ? "rotate(-90deg)" :
                                "rotate(90deg)",
                }}>
                    {edgeSvgReverse}
                </div>
            </div>
        </div>
    )
}
