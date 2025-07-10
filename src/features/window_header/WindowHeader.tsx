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

import { LucideMinus, LucideSquare, LucideX } from "lucide-react";
import { platform } from '@tauri-apps/plugin-os';
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function WindowHeader({
    className = "",
    children = null,
}: {
    className?: string;
    children?: React.ReactNode;
}) {
    let isWindows = platform() === 'windows';

    useEffect(() => {
        const appWindow = getCurrentWindow();
        document
            .getElementById('titlebar-minimize')
            ?.addEventListener('click', () => appWindow.minimize());
        document
            .getElementById('titlebar-maximize')
            ?.addEventListener('click', () => appWindow.toggleMaximize());
        document
            .getElementById('titlebar-close')
            ?.addEventListener('click', () => appWindow.close());
    }, []);

    return (
        <div data-tauri-drag-region className={`flex justify-between align-middle bg-[var(--bg-tertiary)] ${className}`} style={{
            borderBottom: '1px solid var(--border-color)',
        }}>
            {children}

            {isWindows && (
                <div className="flex gap-0" style={{ width: '108px', height: '36px' }}>
                    <div className="flex justify-center items-center hover:bg-[var(--bg-secondary)] aspect-square transition-all duration-150" id="titlebar-minimize">
                        <LucideMinus width={14} />
                    </div>
                    <div className="flex justify-center items-center hover:bg-[var(--bg-secondary)] aspect-square transition-all duration-150" id="titlebar-maximize">
                        <LucideSquare width={14} />
                    </div>
                    <div className="flex justify-center items-center hover:bg-[var(--destructive-color-transparent)] aspect-square transition-all duration-150" id="titlebar-close">
                        <LucideX width={18} />
                    </div>
                </div>
            )}
        </div>
    );
}
