use crate::api::TrackState;
use knodiq_engine::{audio_utils::Beats, Mixer};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct MixerState {
    pub tracks: Vec<TrackState>,
    pub bpm: f32,
    pub samples_per_beat: f32,
    pub duration: Beats,
}

impl MixerState {
    pub fn from_mixer(mixer: &mut Mixer) -> Self {
        let tracks = mixer
            .tracks
            .iter_mut()
            .map(|track| TrackState::from_track(track))
            .collect::<Vec<_>>();
        let bpm = mixer.tempo;
        let samples_per_beat = mixer.samples_per_beat();
        let duration = mixer.duration();
        MixerState {
            tracks,
            bpm,
            samples_per_beat,
            duration,
        }
    }
}

impl Clone for MixerState {
    fn clone(&self) -> Self {
        MixerState {
            tracks: self.tracks.clone(),
            bpm: self.bpm,
            samples_per_beat: self.samples_per_beat,
            duration: self.duration,
        }
    }
}
