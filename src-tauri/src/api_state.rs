pub struct APIState {
    pub audio_player: Option<segment_engine::AudioPlayer>,
}

impl APIState {
    pub fn new() -> Self {
        APIState { audio_player: None }
    }
}

unsafe impl Send for APIState {}
