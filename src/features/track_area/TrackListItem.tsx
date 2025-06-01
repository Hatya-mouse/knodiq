import { TrackState } from "@/lib/audio_api/track_state";
import { Trash2 } from "lucide-react";

export default function TrackListItem({
    track,
    index,
    height = 50,
    onRemoveTrack,
}: {
    track: TrackState,
    index: number,
    height?: number,
    onRemoveTrack?: (index: number) => void | undefined,
}) {
    const handleRemoveTrack = () => {
        if (onRemoveTrack) {
            onRemoveTrack(index);
        }
    }

    return (
        <div className="bottom-border px-3 py-2 flex items-center" style={{ height: height }} key={index}>
            <div className="text-[var(--fg)] flex flex-row justify-between items-center gap-2 w-full">
                <h3>Track {index + 1}</h3>
                <button className="basic-button icon destructive" onClick={handleRemoveTrack}>
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
