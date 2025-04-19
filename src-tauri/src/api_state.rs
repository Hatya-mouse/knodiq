use segment_engine::Mixer;
use std::sync::Mutex;

pub struct APIState {
    pub mixer: Mutex<Mixer>,
    pub sample_rate: usize,
    pub channels: usize,
}

impl APIState {
    pub fn new(sample_rate: usize, channels: usize) -> Self {
        let mixer = Mixer::new(sample_rate, channels);
        APIState {
            mixer: Mutex::new(mixer),
            sample_rate,
            channels,
        }
    }
}
