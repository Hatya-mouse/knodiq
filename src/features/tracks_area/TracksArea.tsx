import Track from "@lib/audio_api/track";
import TrackListItem from "@features/tracks_area/TrackListItem";

export default function TracksArea({
    tracks,
    onAddTrack
}: {
    tracks?: Track[],
    onAddTrack?: () => void,
}) {
    return (
        <div className="tracks-area">
            <div className="tracks-area-header">
                <h2>Tracks</h2>
                <button className="text-button" onClick={onAddTrack}>Add Track</button>
            </div>
            <div className="tracks-list">
                {(tracks ?? []).map((track, index) => (
                    <TrackListItem track={track} index={index} />
                ))}
            </div>
        </div>
    );
}