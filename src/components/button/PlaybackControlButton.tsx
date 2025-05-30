import { ReactNode } from "react";
import "@/App.css";

export default function PlaybackControlButton({
    className = "",
    icon,
    defaultBg = "",
    hoverBg = "",
    activeBg = "",
    onClick,
}: {
    className?: string;
    icon: ReactNode;
    defaultBg?: string;
    hoverBg?: string;
    activeBg?: string;
    onClick?: () => void;
}) {
    return (
        <button
            className={`large-icon-button aspect-square p-2 flex justify-center items-center box-border cursor-pointer duration-150 ${defaultBg} ${hoverBg} ${activeBg} ${className} `}
            onClick={onClick}
        >
            <div className="flex justify-center items-center lucide-icon">
                {icon}
            </div>
        </button>
    );
}
