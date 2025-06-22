use crate::api::{
    mixing::{send_mixer_command, MixerCommand},
    AppState,
};
use knodiq_engine::NodeId;
use std::sync::Mutex;
use tauri::{command, State};

#[command]
pub fn move_node(
    track_id: u32,
    node_id: NodeId,
    position: (f32, f32),
    state: State<'_, Mutex<AppState>>,
) {
    send_mixer_command(MixerCommand::MoveNode(track_id, node_id, position), &state);
}
