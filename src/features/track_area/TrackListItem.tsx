import { TrackState } from "@/lib/audio_api/track_state";
import { Trash2 } from "lucide-react";

export default function TrackListItem({
    track,
    height = 50,
    onRemoveTrack,
}: {
    track: TrackState,
    height?: number,
    onRemoveTrack?: (index: number) => void | undefined,
}) {
    const handleRemoveTrack = () => {
        if (onRemoveTrack) {
            onRemoveTrack(track.id);
        }
    }

    return (
        <div
            className="text-[var(--fg)] flex flex-row justify-between items-center gap-2 bottom-border px-3 py-2"
            style={{ height: height, overflow: "hidden" }}
        >
            <h3 className="text-ellipsis whitespace-nowrap overflow-hidden">{track.name}</h3>
            <button className="basic-button icon destructive" onClick={handleRemoveTrack}>
                <Trash2 size={16} />
            </button>
        </div>
    );
}
