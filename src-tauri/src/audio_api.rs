use segment_engine::mixing::{region::BufferRegion, track::BufferTrack};
use segment_engine::{AudioPlayer, AudioSource, Graph, Mixer};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{command, State};

// Define a shared state for the audio player
pub struct AppState {
    pub audio_player: Arc<Mutex<Option<AudioPlayer>>>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            audio_player: Arc::new(Mutex::new(None)),
        }
    }
}

#[command]
pub fn play_audio(path: String, state: State<'_, Mutex<AppState>>) {
    let mut unlocked_state = state.lock().unwrap();

    // Create the audio player and initialize it
    let mut audio_player = AudioPlayer::new(48000);
    let sender = audio_player.initialize_player(48000, 2).unwrap();

    // Store the audio player in the shared state
    {
        unlocked_state.audio_player = Arc::new(Mutex::new(Some(audio_player)));
    }

    // Spawn a thread to handle audio playback
    let audio_player_clone = Arc::clone(&unlocked_state.audio_player);
    thread::spawn(move || {
        // Initialize the audio source
        let mut audio_source = AudioSource::from_path(&path, 0).unwrap();
        audio_source.sample_rate = 44100;

        // Create a new track and region for the audio source
        let region = BufferRegion::new(audio_source, 22050.0);
        let mut track = BufferTrack::new(0, "", 2);
        track.add_region(region);

        // Build the graph of the track
        track.graph.connect(
            track.graph.input_nodes[0],
            "output".to_string(),
            track.graph.output_node,
            "input".to_string(),
        );

        let mut mixer = Mixer::new(120.0, 48000, 2);
        mixer.add_track(Box::new(track));

        mixer.prepare();
        mixer.mix(Box::new(move |sample| {
            let _ = sender.send(sample).unwrap();
        }));
    });

    // Spawn another thread to call `update` on the audio player
    thread::spawn(move || loop {
        let mut player_guard = audio_player_clone.lock().unwrap();
        if let Some(audio_player) = player_guard.as_mut() {
            audio_player.update();
        }
    });
}

#[command]
pub fn get_tracks() {}
