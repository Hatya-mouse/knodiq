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

import { ChevronDown } from "lucide-react";
import { PaneContentType } from "../../lib/type/PaneNode";
import DropdownMenu from "../button/DropdownMenu";
import { useEffect, useRef, useState } from "react";

export default function PaneHeader({
    selectedPane,
    onPaneSelect = () => { },
    controls,
}: {
    selectedPane?: PaneContentType,
    onPaneSelect?: (pane: PaneContentType) => void,
    controls?: React.ReactNode,
}) {
    let [isMenuOpen, setIsMenuOpen] = useState(false);
    let dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (<>
        <div className="flex px-2 h-7 items-center bg-[var(--bg-secondary)] justify-between" style={{
            borderBottomColor: "var(--border-color)",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",

        }}>
            <div className="flex flex-col gap-0" ref={dropdownRef}>
                <button
                    className="text-sm font-medium max-w-fit px-1 rounded flex-1 flex select-none hover:bg-[var(--bg-tertiary)] transition cursor-pointer"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {selectedPane?.toString() || "Select a pane"}
                    <ChevronDown height={20} width={20} />
                </button>

                <DropdownMenu
                    options={Object.values(PaneContentType).map((pane) => ({
                        label: pane.toString(),
                        value: pane,
                    }))}
                    isOpen={isMenuOpen}
                    onSelect={(value) => {
                        setIsMenuOpen(false);
                        onPaneSelect(value as PaneContentType);
                    }}
                    className="mt-0"
                />
            </div>

            <div>{controls}</div>
        </div>
    </>)
}
