use crate::api::mixing::TrackState;
use knodiq_engine::Mixer;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct MixerState {
    pub tracks: Vec<TrackState>,
    pub bpm: f32,
    pub samples_per_beat: f32,
}

impl MixerState {
    pub fn from_mixer(mixer: &Mixer) -> Self {
        let tracks = mixer
            .tracks
            .iter()
            .map(|track| TrackState::from_track(track))
            .collect::<Vec<_>>();
        let bpm = mixer.tempo;
        let samples_per_beat = mixer.samples_per_beat();
        MixerState {
            tracks,
            bpm,
            samples_per_beat,
        }
    }
}

impl Clone for MixerState {
    fn clone(&self) -> Self {
        MixerState {
            tracks: self.tracks.clone(),
            bpm: self.bpm,
            samples_per_beat: self.samples_per_beat,
        }
    }
}
