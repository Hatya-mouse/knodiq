import { LucidePlay, LucidePause, LucideSkipBack } from "lucide-react";
import PlaybackControlButton from "@/components/PlaybackControlButton";
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
        <div className="bg-[var(--bg-secondary)] bottom-border flex justify-start px-3 py-2">
            <div className="border-rounded flex flex-row overflow-hidden p-0">
                <PlaybackControlButton
                    icon={isPlaying ? <LucidePause size={16} /> : <LucidePlay size={16} />}
                    onClick={handlePlayPause}
                />
                <PlaybackControlButton
                    icon={<LucideSkipBack size={16} />}
                    onClick={onSkipBack}
                />
            </div>
        </div>
    );
}