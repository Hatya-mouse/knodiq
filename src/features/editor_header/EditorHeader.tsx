import { LucidePlay, LucidePause, LucideSkipBack, LucideSkipForward } from "lucide-react";
import PlaybackControlButton from "@components/button/PlaybackControlButton";
import "@/App.css";

export default function EditorHeader({
    isPlaying,
    onPlay,
    onPause,
    onSkipBack,
}: {
    isPlaying: boolean;
    onPlay?: () => void;
    onPause?: () => void;
    onSkipBack?: () => void;
}) {
    const handlePlayPause = () => {
        if (isPlaying) {
            onPause?.();
        } else {
            onPlay?.();
        }
    };

    return (
        <div className="bottom-border flex justify-start px-3 py-2">
            <div className="border-rounded flex gap-2 flex-row overflow-hidden p-0">
                <PlaybackControlButton
                    icon={<LucideSkipBack size={16} />}
                    onClick={onSkipBack}
                />
                <PlaybackControlButton
                    icon={isPlaying ? <LucidePause size={16} /> : <LucidePlay size={16} />}
                    onClick={handlePlayPause}
                    defaultBg="bg-[var(--button-default)]"
                    hoverBg="hover:bg-[var(--button-hover)]"
                    activeBg="active:bg-[var(--button-active)]"
                    className="rounded-full"
                />
                <PlaybackControlButton
                    icon={<LucideSkipForward size={16} />}
                    onClick={onSkipBack}
                />
            </div>
        </div>
    );
}