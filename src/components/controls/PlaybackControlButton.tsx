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

import { ReactNode } from "react";
import "@/App.css";

export default function PlaybackControlButton({
    className = "",
    icon,
    defaultBg = "",
    hoverBg = "",
    activeBg = "",
    onClick,
}: {
    className?: string;
    icon: ReactNode;
    defaultBg?: string;
    hoverBg?: string;
    activeBg?: string;
    onClick?: () => void;
}) {
    return (
        <button
            className={`large-icon-button p-1 flex justify-center items-center box-border cursor-pointer duration-150 ${defaultBg} ${hoverBg} ${activeBg} ${className} `}
            onClick={onClick}
        >
            <div className="flex justify-center items-center">
                {icon}
            </div>
        </button>
    );
}
