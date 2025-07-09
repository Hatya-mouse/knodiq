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

import clsx from "clsx";
import { MouseEvent, ReactNode } from "react";

export enum ButtonType {
    Default,
    Primary,
    Destructive,
}

export default function BasicButton({
    className = "",
    type = ButtonType.Default,
    disabled = false,
    onClick = () => { },
    onMouseDown = () => { },
    children = null,
}: {
    className?: string;
    type?: ButtonType;
    disabled?: boolean;
    onClick?: (event: MouseEvent) => void;
    onMouseDown?: (event: MouseEvent) => void;
    children?: ReactNode;
}) {
    return (
        <button
            className={`text-sm h-5 font-medium whitespace-nowrap max-w-fit px-1 rounded flex-1 flex items-center justify-center select-none transition ${clsx(
                type === ButtonType.Default && "text-[var(--text)] hover:bg-[var(--bg-tertiary)]",
                type === ButtonType.Primary && "text-[var(--accent-color)] hover:bg-[var(--accent-color-transparent)]",
                type === ButtonType.Destructive && "text-[var(--destructive-color)] hover:bg-[var(--destructive-color-transparent)]",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            )} ${className}`}
            disabled={disabled}
            onClick={onClick}
            onMouseDown={onMouseDown}
        >
            {children}
        </button>
    );
}
