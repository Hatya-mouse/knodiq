use segment_engine::{AudioPlayer, AudioSource};
use std::thread;
use tauri::command;

#[command]
pub fn play_audio(path: String) {
    let audio_source = AudioSource::from_path(&path, 0).unwrap();
    let mut audio_player = AudioPlayer::new();
    let sender = audio_player.initialize_player(48000, 2).unwrap();

    // Create a new thread to play the audio
    thread::spawn(move || {
        for sample_index in 0..audio_source.samples() {
            for channel_index in 0..1 {
                let _ = sender
                    .send(audio_source.data[channel_index][sample_index])
                    .unwrap();
            }
        }
    });

    loop {
        audio_player.update();
    }
}

#[command]
pub fn get_tracks() {}
