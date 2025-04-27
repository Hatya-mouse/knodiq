use segment_engine::{AudioPlayer, Sample};
use std::sync::mpsc;

pub enum MixerCommand {
    /// Command to set the sample callback function for the mixer.
    Mix(Box<dyn FnMut(Sample) + Send>),
}

pub struct AppState {
    /// Mixer mspc sender to communicate with the mixer.
    pub mixer_sender: Option<mpsc::Sender<MixerCommand>>,
    /// Audio player to handle audio playback.
    pub audio_player: Option<AudioPlayer>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            mixer_sender: None,
            audio_player: None,
        }
    }
}
