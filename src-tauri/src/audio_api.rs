use crate::app_state::{AppState, MixerCommand};
use segment_engine::{AudioPlayer, Mixer};
use std::sync::{mpsc, Mutex};
use tauri::{command, State};

#[command]
pub fn play_audio(state: State<'_, Mutex<AppState>>) {
    let mut state = state.lock().unwrap();

    let sample_rate = 48000;
    let channels = 2;
    let completion_handler = || { /* Handle completion */ };

    // Initialize the audio player with the given sample rate and channels
    let audio_player = AudioPlayer::new(sample_rate);
    state.audio_player = Some(audio_player);

    // Initialize the audio player and get the sender to pass samples to the audio player
    let sample_sender = match state.audio_player.as_mut().unwrap().initialize_player(
        sample_rate,
        channels,
        Some(Box::new(completion_handler)),
    ) {
        Ok(sender) => sender,
        Err(e) => {
            eprintln!("Error initializing audio player: {}", e);
            return;
        }
    };

    // Start mixing the audio
    match &state.mixer_sender {
        Some(sender) => {
            // Send the mix command to the mixer
            let mix_command = MixerCommand::Mix(Box::new(move |sample| {
                // Send the mixed sample to the audio player
                sample_sender.send(sample).unwrap();
            }));
            sender.send(mix_command).unwrap();
        }
        None => {
            eprintln!("Mixer thread not initialized.");
            return;
        }
    }
}

#[command]
pub fn pause_audio(state: State<'_, Mutex<AppState>>) {
    let mut state = state.lock().unwrap();
    if let Some(audio_player) = &mut state.audio_player {
        audio_player.pause().unwrap();
    } else {
        eprintln!("Audio player not initialized.");
    }
}

#[command]
pub fn start_mixer_thread(state: State<'_, Mutex<AppState>>) {
    // Create a channel to communicate with the mixer
    let (sender, receiver) = mpsc::channel();

    // Set the sender in the app state
    let mut state = state.lock().unwrap();
    state.mixer_sender = Some(sender);

    // Create a new thread for the mixer
    std::thread::spawn(move || {
        // Initialize the mixer
        let tempo = 120.0;
        let sample_rate = 48000;
        let channels = 2;
        let mut mixer = Mixer::new(tempo, sample_rate, channels);

        process_mixer(&mut mixer, receiver);
    });
}

fn process_mixer(mixer: &mut Mixer, receiver: mpsc::Receiver<MixerCommand>) {
    // Process the mixer commands here
    while let Ok(command) = receiver.recv() {
        match command {
            MixerCommand::Mix(callback) => {
                mixer.mix(callback);
            }
        }
    }
}
