import React from 'react';
import { Layout, CheckCircle2, Folder, Settings, CheckSquare } from 'lucide-react';
import { useBoard } from '../context/BoardContext';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
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
        <aside className="w-64 h-screen flex flex-col bg-[#11121A] text-white border-r border-neutral-800 shrink-0">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">To-Do-List</h1>
                    <p className="text-xs text-neutral-400">Premium Workspace</p>
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
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-blue-600/10 text-blue-500'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Settings & Bottom Area */}
            <div className="p-4 space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors">
                    <Settings className="w-5 h-5" />
                    Settings
                </button>
            </div>
        </aside>
    );
};
