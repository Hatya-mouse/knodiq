use segment_engine::AudioSource;
use tauri::command;

#[command]
pub fn source_from_path(path: &str, track_number: usize) -> Option<AudioSource> {
    AudioSource::from_path(path, track_number).ok()
}
