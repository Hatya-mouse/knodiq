export default function DropdownMenu({
    options = [],
    isOpen = false,
    onSelect = () => { },
    className = "",
}: {
    options?: { label: string, value: any }[],
    isOpen?: boolean,
    onSelect?: (value: any) => void,
    className?: string,
}) {
    let handleOptionClick = (value: any) => {
        onSelect(value);
    }

    return (
        <div className={`relative ${className}`}>
            <ul
                className={`absolute left-0 mt-2 z-50 p-1 bg-[var(--bg-primary)] rounded-[var(--border-radius)] shadow-lg overflow-hidden transition-all duration-100 ease-in-out ${isOpen ? "pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                style={{ border: "var(--border)" }}
            >
                {options.map((option) => (
                    <li
                        key={option.value}
                        className="px-1 py-0.5 hover:bg-[var(--bg-secondary)] rounded cursor-pointer text-nowrap text-left text-sm"
                        onClick={() => handleOptionClick(option.value)}
                    >
                        {option.label}
                    </li>
                ))}
            </ul>
        </div >
    );
}
