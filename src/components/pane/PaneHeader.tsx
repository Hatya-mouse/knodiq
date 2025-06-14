import { ChevronDown } from "lucide-react";
import { PaneContentType } from "./PaneData";
import DropdownMenu from "../button/DropdownMenu";
import { useEffect, useRef, useState } from "react";

export default function PaneHeader({
    selectedPane,
    onPaneSelect = () => { },
}: {
    selectedPane?: PaneContentType,
    onPaneSelect?: (pane: PaneContentType) => void,
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
            borderBottom: "var(--border)",
        }}>
            <div className="flex-col gap-0" ref={dropdownRef}>
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
        </div>
    </>)
}
