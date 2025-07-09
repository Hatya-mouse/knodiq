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

import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export function openWindow({
    id,
    url,
    title,
    x = 100,
    y = 100,
    width = 800,
    height = 600
}: {
    id: string,
    url: string,
    title: string,
    x?: number,
    y?: number,
    width?: number,
    height?: number
}) {
    const configWindow = new WebviewWindow(id, {
        url: url,
        title: title,
        decorations: false,
        x: x,
        y: y,
        width: width,
        height: height,
    });

    configWindow.once("tauri://error", (e) => {
        console.error("Webview error:", e);
    });

    return configWindow;
}