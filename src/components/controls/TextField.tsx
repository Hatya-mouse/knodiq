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

export default function TextField({
    className = "",
    value = "",
    onChange = () => { },
    onBlur = () => { },
    placeholder = "",
}: {
    className?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <input
            type="text"
            className={`text-sm h-6 font-medium px-1 rounded flex-1 bg-[var(--bg-primary)] text-[var(--text)] border-[var(--border-color)] border focus:outline-[var(--accent-color))] focus:border-[var(--accent-color)] ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => onBlur(value)}
            placeholder={placeholder}
        />
    );
}
