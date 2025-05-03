import { RegionState } from '@/lib/audio_api/region_state';

export type TrackState = {
    /** The ID of the track. */
    id: number;
    /** The name of the track, specified by the user. */
    name: string;
    /** Number of channels in the track. */
    channels: number;
    /** The type of the track. This is used to determine how to process the track. */
    track_type: string;
    /** The regions in the track. */
    regions: RegionState[];
}