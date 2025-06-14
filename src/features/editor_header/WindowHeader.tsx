import { LucidePlay, LucidePause, LucideSkipBack, LucideSkipForward, LucideMinus, LucideSquare, LucideX } from "lucide-react";
import PlaybackControlButton from "@components/button/PlaybackControlButton";
import { platform } from '@tauri-apps/plugin-os';
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function WindowHeader({
    isPlaying,
    onPlay,
    onPause,
    onSkipBack,
    onSkipForward,
}: {
    isPlaying: boolean;
    onPlay?: () => void;
    onPause?: () => void;
    onSkipBack?: () => void;
    onSkipForward?: () => void;
}) {
    let isWindows = platform() === 'windows';

    useEffect(() => {
        const appWindow = getCurrentWindow();
        document
            .getElementById('titlebar-minimize')
            ?.addEventListener('click', () => appWindow.minimize());
        document
            .getElementById('titlebar-maximize')
            ?.addEventListener('click', () => appWindow.toggleMaximize());
        document
            .getElementById('titlebar-close')
            ?.addEventListener('click', () => appWindow.close());
    }, []);

    const handlePlayPause = () => {
        if (isPlaying) {
            onPause?.();
        } else {
            onPlay?.();
        }
    };

    return (
        <div data-tauri-drag-region className="bottom-border flex justify-between align-middle bg-[var(--bg-tertiary)]">
            <div className="flex gap-2 overflow-hidden px-3 py-2">
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
                    onClick={onSkipForward}
                />
            </div>

            {isWindows && (
                <div className="flex gap-0 w-36">
                    <div className="flex justify-center items-center hover:bg-[var(--bg-secondary)] aspect-square" id="titlebar-minimize">
                        <LucideMinus width={14} />
                    </div>
                    <div className="flex justify-center items-center hover:bg-[var(--bg-secondary)] aspect-square" id="titlebar-maximize">
                        <LucideSquare width={14} />
                    </div>
                    <div className="flex justify-center items-center hover:bg-[var(--destructive-color)] aspect-square" id="titlebar-close">
                        <LucideX width={18} />
                    </div>
                </div>
            )}
        </div>
    );
}
