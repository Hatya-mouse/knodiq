import { LucidePlay, LucidePause, LucideSkipBack } from "lucide-react";
import PlaybackControlButton from "@/components/PlaybackControlButton";
import "@/App.css";
import "@features/editor_header/editor_header.css";

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
        <div className="editor-header">
            <div className="header-button-group">
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