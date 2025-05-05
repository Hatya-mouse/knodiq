use crate::api::mixing::{MixerState, RegionData, RegionType, TrackData};
use crate::api::AppState;
use crate::track::TrackType;
use segment_engine::mixing::region::BufferRegion;
use segment_engine::mixing::track::BufferTrack;
use segment_engine::{Mixer, NodeId, Sample};
use std::sync::{
    atomic::{AtomicBool, Ordering},
    mpsc, Arc, Mutex,
};
use tauri::State;

pub enum MixerCommand {
    /// Command to get the current state of the mixer, in serializable form.
    GetMixerState,
    /// Command to set the sample callback function for the mixer.
    Mix(Box<dyn FnMut(Sample) + Send>),
    /// Add a track to the mixer.
    AddTrack(TrackData),
    /// Add a region to the specified track.
    /// - track_id: `usize`,
    /// - region_data: `RegionData,
    AddRegion(u32, RegionData),
    /// Connect two nodes in the graph.
    /// - track_id: `u32`,
    /// - from: `segment_engine::NodeId`,
    /// - from_param: `String`,
    /// - to: `segment_engine::NodeId`,
    /// - to_param: `String`,
    ConnectGraph(
        u32,
        segment_engine::NodeId,
        String,
        segment_engine::NodeId,
        String,
    ),
    /// Get the input nodes of a track.
    GetInputNodes(u32),
    /// Get the output node of a track.
    GetOutputNode(u32),
}

pub enum MixerResult {
    /// Result of the `GetInputNodes` command.
    InputNodes(Vec<NodeId>),
    /// Result of the `GetOutputNode` command.
    OutputNode(NodeId),
    /// Result of the `GetMixerState` command.
    MixerState(MixerState),
}

pub fn start_mixer_thread(state: State<Mutex<AppState>>) {
    // Create a channel to communicate with the mixer
    let (command_sender, command_receiver) = mpsc::channel();
    let (result_sender, result_receiver) = mpsc::channel();
    let running = Arc::new(AtomicBool::new(true));

    // Set the sender in the app state
    let mut state = state.lock().unwrap();
    state.mixer_command_sender = Some(command_sender);
    state.mixer_result_receiver = Some(result_receiver);

    // Create a new thread for the mixer
    let running_clone = Arc::clone(&running);
    std::thread::spawn(move || {
        let tempo = 120.0;
        let sample_rate = 48000;
        let channels = 2;
        let mut mixer = Mixer::new(tempo, sample_rate, channels);

        while running_clone.load(Ordering::SeqCst) {
            process_mixer(&mut mixer, &command_receiver, &result_sender);
        }
    });

    // Quitting the app will stop the mixer thread
    std::thread::spawn(move || {
        running.store(false, Ordering::SeqCst);
    });
}

fn process_mixer(
    mixer: &mut Mixer,
    receiver: &mpsc::Receiver<MixerCommand>,
    result_sender: &mpsc::Sender<MixerResult>,
) {
    // Process the mixer commands here
    while let Ok(command) = receiver.recv() {
        match command {
            MixerCommand::GetMixerState => {
                // Get the current state of the mixer
                let state = MixerState::from_mixer(mixer);
                // Send the state back to the main thread
                let _ = result_sender.send(MixerResult::MixerState(state));
            }
            MixerCommand::Mix(callback) => {
                mixer.prepare();
                mixer.mix(callback);
            }
            MixerCommand::AddTrack(track_data) => {
                let track = match track_data.track_type {
                    TrackType::BufferTrack => BufferTrack::new(
                        track_data.id,
                        track_data.name.as_str(),
                        track_data.channels,
                    ),
                };
                // Add the track to the mixer
                mixer.add_track(Box::new(track));
            }
            MixerCommand::AddRegion(track_id, region_data) => {
                println!("Adding region: {:?}", region_data.name);
                let region = match region_data.region_type {
                    RegionType::BufferRegion(source) => BufferRegion::new(
                        region_data.id,
                        region_data.name.as_str().to_string(),
                        source,
                        region_data.samples_per_beat,
                    ),
                };
                // Add the region to the specified track
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    if let Some(buffer_track) = track.as_any_mut().downcast_mut::<BufferTrack>() {
                        buffer_track.add_region(
                            region,
                            region_data.start_time,
                            region_data.duration,
                        );
                    }
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                }
                println!("Region added: {:?}", region_data.name);
            }
            MixerCommand::ConnectGraph(track_id, from, from_param, to, to_param) => {
                // Connect the two nodes in the graph
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    track.graph().connect(from, from_param, to, to_param);
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                }
            }
            MixerCommand::GetInputNodes(track_id) => {
                // Get the input nodes of the track
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    let input_nodes = &track.graph().input_nodes;
                    let _ = result_sender.send(MixerResult::InputNodes(input_nodes.clone()));
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                }
            }
            MixerCommand::GetOutputNode(track_id) => {
                // Get the output node of the track
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    let output_node = track.graph().output_node;
                    let _ = result_sender.send(MixerResult::OutputNode(output_node));
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                }
            }
        }
    }
}
