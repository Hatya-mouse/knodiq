use super::mixing::mixer::MixerResult;
use crate::api::mixing::MixerCommand;
use knodiq_engine::AudioPlayer;
use std::sync::mpsc;

pub struct AppState {
    /// Mixer mspc sender to communicate with the mixer.
    pub mixer_command_sender: Option<mpsc::Sender<MixerCommand>>,
    /// Mixer mspc receiver to receive results from the mixer.
    pub mixer_result_receiver: Option<mpsc::Receiver<MixerResult>>,
    /// Audio player to handle audio playback.
    pub audio_player: Option<AudioPlayer>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            mixer_command_sender: None,
            mixer_result_receiver: None,
            audio_player: None,
        }
    }

    pub fn set_audio_player(&mut self, player: AudioPlayer) {
        self.audio_player = Some(player);
    }

    pub fn get_audio_player(&mut self) -> Option<&mut AudioPlayer> {
        self.audio_player.as_mut()
    }

    pub fn clear_audio_player(&mut self) {
        self.audio_player = None;
    }
}
