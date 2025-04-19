import Track from "@lib/audio_api/track";

export default function TrackListItem({
    track,
    index,
}: {
    track: Track,
    index: number,
}) {
    return (
        <div className="track-list-item" key={index}>
            <div className="track-list-item-header">
                <h3>Track {index + 1}</h3>
                <button className="text-button">Remove</button>
            </div>
            <div className="track-list-item-content">
                <p>{track.name}</p>
            </div>
        </div>
    );
}