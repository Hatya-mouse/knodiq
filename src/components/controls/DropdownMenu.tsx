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

export default function DropdownMenu({
    options = [],
    isOpen = false,
    onSelect = () => { },
    className = '',
    align = 'left',
}: {
    options?: { label: string, key: any }[],
    isOpen?: boolean,
    onSelect?: (value: any) => void,
    className?: string,
    align?: 'left' | 'right',
}) {
    const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

    return (
        <div className={`relative ${className}`}>
            <ul
                className={`absolute mt-2 p-1 bg-[var(--bg-primary)] rounded-[var(--border-radius)] shadow-lg overflow-hidden transition-all duration-100 ease-in-out ${isOpen ? "pointer-events-auto" : "opacity-0 pointer-events-none"} ${alignmentClass}`}
                style={{
                    borderColor: "var(--border-color)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    zIndex: 9
                }}
            >
                {options.map((option) => (
                    <li
                        key={option.key}
                        className="px-1 py-0.5 hover:bg-[var(--bg-secondary)] rounded cursor-pointer text-nowrap text-left text-sm"
                        onClick={() => onSelect(option.key)}
                    >
                        {option.label}
                    </li>
                ))}
            </ul>
        </div >
    );
}
