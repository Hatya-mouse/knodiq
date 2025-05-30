use crate::api::{
    mixing::{MixerCommand, MixerResult},
    AppState,
};
use std::sync::MutexGuard;
use tauri::{AppHandle, Emitter};

pub fn emit_mixer_state(state: MutexGuard<'_, AppState>, app: AppHandle) {
    if let Some(mixer_command_sender) = state.mixer_command_sender.as_ref() {
        mixer_command_sender.send(MixerCommand::GetMixerState).ok();
        if let Some(mixer_result_receiver) = state.mixer_result_receiver.as_ref() {
            match mixer_result_receiver.recv() {
                Ok(MixerResult::MixerState(mixer_state)) => {
                    app.emit("mixer_state", mixer_state).unwrap();
                }
                Ok(_) => {
                    eprintln!("Unexpected result from mixer.");
                }
                Err(_) => {
                    eprintln!("Error receiving mixer state.");
                }
            }
        }
    }
}
