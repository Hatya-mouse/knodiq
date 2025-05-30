import PaneHeader from "./PaneHeader";

export default function PaneView({
    title,
    children,
}: {
    title?: string,
    children?: React.ReactNode,
}) {
    return (
        <div className="flex flex-col h-full">
            <PaneHeader title={title} />
            <div className="flex-1 grow h-full overflow-y-auto">
                {children}
            </div>
        </div>
    );
}