use crate::app_state::{AppState, MixerCommand};
use segment_engine::{AudioPlayer, Mixer};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{mpsc, Arc, Mutex};
use tauri::{command, State};

#[command]
pub fn play_audio(state: State<'_, Mutex<AppState>>) {
    let mut state = state.lock().unwrap();

    let sample_rate = 48000;
    let channels = 2;
    let completion_handler = || { /* Handle completion */ };

    // Initialize the audio player with the given sample rate and channels
    let audio_player = AudioPlayer::new(sample_rate);
    state.set_audio_player(audio_player);

    // Get the audio player mutable reference from the app state
    let audio_player_mut = state.get_audio_player().unwrap();

    // Initialize the audio player and get the sender to pass samples to the audio player
    let sample_sender = match audio_player_mut.initialize_player(
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
            let mix_command = MixerCommand::Mix(Box::new(move |sample| {
                // Send the mixed sample to the audio player
                sample_sender.send(sample).unwrap_or_else(|e| {
                    eprintln!("Error sending sample to audio player: {}", e);
                });
            }));

            // Send the mix command to the mixer thread
            sender.send(mix_command).unwrap_or_else(|e| {
                eprintln!("Error sending mix command to mixer: {}", e);
            });
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
    if let Some(audio_player) = state.get_audio_player() {
        audio_player
            .pause()
            .unwrap_or_else(|e| eprintln!("Error pausing audio player: {}", e));
    } else {
        eprintln!("Audio player not initialized.");
    }
}

#[command]
pub fn start_mixer_thread(state: State<'_, Mutex<AppState>>) {
    // Create a channel to communicate with the mixer
    let (sender, receiver) = mpsc::channel();
    let running = Arc::new(AtomicBool::new(true));

    // Set the sender in the app state
    let mut state = state.lock().unwrap();
    state.mixer_sender = Some(sender);

    // Create a new thread for the mixer
    let running_clone = Arc::clone(&running);
    std::thread::spawn(move || {
        let tempo = 120.0;
        let sample_rate = 48000;
        let channels = 2;
        let mut mixer = Mixer::new(tempo, sample_rate, channels);

        while running_clone.load(Ordering::SeqCst) {
            process_mixer(&mut mixer, &receiver);
        }
    });

    // Quitting the app will stop the mixer thread
    std::thread::spawn(move || {
        running.store(false, Ordering::SeqCst);
    });
}

fn process_mixer(mixer: &mut Mixer, receiver: &mpsc::Receiver<MixerCommand>) {
    // Process the mixer commands here
    while let Ok(command) = receiver.recv() {
        match command {
            MixerCommand::Mix(callback) => {
                mixer.mix(callback);
            }
        }
    }
}
