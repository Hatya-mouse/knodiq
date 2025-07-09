//
// Copyright 2025 Shuntaro Kasatani
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

use tauri::{AppHandle, WebviewUrl, WebviewWindowBuilder, command};

#[command]
pub async fn open_track_config_window(app: AppHandle) -> Result<(), String> {
    WebviewWindowBuilder::new(
        &app,
        "track_config",
        WebviewUrl::App("window/track_config.html".into()),
    )
    .title("Track Configuration")
    .build()
    .map_err(|e| e.to_string())?;
    Ok(())
}
