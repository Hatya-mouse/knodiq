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

export default function SectionGroup({
    className = "",
    title = "",
    children = null,
}: {
    className?: string;
    title?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className={`flex flex-col ${className}`}>
            <div
                className="px-2 py-0.5 text-sm font-semibold bg-[var(--bg-tertiary)] "
                style={{
                    borderBottomColor: 'var(--border-color)',
                    borderBottomWidth: '1px',
                }}
            >
                {title}
            </div>

            <div
                className="px-2 py-1.5 bg-[var(--bg-secondary)] flex-1"
                style={{
                    borderBottomColor: 'var(--border-color)',
                    borderBottomWidth: '1px',
                }}
            >
                {children}
            </div>
        </div>
    );
}