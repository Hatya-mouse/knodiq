import { TrackState } from './track_state';

export type MixerState = {
    tracks: TrackState[];
    bpm: number;
    samples_per_beat: number;
}