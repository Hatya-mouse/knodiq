use crate::api::{
    mixing::{MixerCommand, MixerResult},
    AppState,
};
use segment_engine::NodeId;
use std::sync::Mutex;
use tauri::{command, State};

#[command]
pub fn connect_graph(
    track_id: u32,
    from: NodeId,
    from_param: String,
    to: NodeId,
    to_param: String,
    state: State<'_, Mutex<AppState>>,
) {
    let state = state.lock().unwrap();

    // Crate a connect command and send it to the mixer thread
    if let Some(mixer_command_sender) = state.mixer_command_sender.as_ref() {
        mixer_command_sender
            .send(MixerCommand::ConnectGraph(
                track_id, from, from_param, to, to_param,
            ))
            .unwrap();
    } else {
        eprintln!("Mixer thread not initialized.");
    }
}

#[command]
pub fn get_input_nodes(track_id: u32, state: State<'_, Mutex<AppState>>) -> Vec<NodeId> {
    let state = state.lock().unwrap();
    if let Some(mixer_command_sender) = state.mixer_command_sender.as_ref() {
        mixer_command_sender
            .send(MixerCommand::GetInputNodes(track_id))
            .unwrap();
        let mixer_result_receiver = state.mixer_result_receiver.as_ref().unwrap();
        if let MixerResult::InputNodes(input_nodes) = mixer_result_receiver.recv().unwrap() {
            input_nodes
        } else {
            vec![]
        }
    } else {
        vec![]
    }
}

#[command]
pub fn get_output_node(track_id: u32, state: State<'_, Mutex<AppState>>) -> Option<NodeId> {
    let state = state.lock().unwrap();
    if let Some(mixer_command_sender) = state.mixer_command_sender.as_ref() {
        mixer_command_sender
            .send(MixerCommand::GetOutputNode(track_id))
            .unwrap();
        let mixer_result_receiver = state.mixer_result_receiver.as_ref().unwrap();
        if let MixerResult::OutputNode(output_node) = mixer_result_receiver.recv().unwrap() {
            Some(output_node)
        } else {
            None
        }
    } else {
        None
    }
}
