import React from 'react';
import { Layout, CheckCircle2, Folder, Settings, CheckSquare } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { clsx } from 'clsx';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
    const { openWorkspace } = useBoard();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Layout },
        { id: 'my-tasks', label: 'My Tasks', icon: CheckCircle2 },
        { id: 'projects', label: 'Projects', icon: Folder },
    ];

    const handleNavClick = (id: string) => {
        setActiveTab(id);
        if (id === 'dashboard') {
            openWorkspace(null); // Ensure we go back to the workspace list
        }
    };

    return (
        <aside className="w-64 h-screen flex flex-col bg-sidebar text-text-main border-r border-border-main shrink-0">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">To-Do-List</h1>
                    <p className="text-xs text-text-muted">Premium Workspace</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary-light text-primary"
                                    : "text-text-muted hover:text-text-main hover:bg-surface-hover"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Settings & Bottom Area */}
            <div className="p-4 space-y-2">
                <button
                    onClick={onOpenSettings}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    Settings
                </button>
            </div>
        </aside>
    );
};
