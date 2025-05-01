use crate::api::mixing::mixer::start_mixer_thread;
use crate::api::AppState;
use serde::ser::StdError;
use std::sync::Mutex;
use tauri::{App, Manager, State};

pub fn setup(app: &mut App) -> Result<(), Box<(dyn StdError + 'static)>> {
    let state: State<Mutex<AppState>> = app.state();
    start_mixer_thread(state);
    Ok(())
}
