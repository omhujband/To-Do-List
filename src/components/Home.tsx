import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { Plus, Settings, Trash2, Search, MoreVertical, Rocket } from 'lucide-react';
import { clsx } from 'clsx';

// Predefined gradient classes for workspace cards to give that premium look
const gradients = [
    'from-blue-600 to-indigo-600',
    'from-purple-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
];

interface HomeProps {
    setActiveTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
    const { state, createWorkspace, deleteWorkspace, openWorkspace, renameWorkspace } = useBoard();
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim()) {
            createWorkspace(newTitle.trim());
            setNewTitle('');
            setIsCreating(false);
        }
    };

    const handleRename = (id: string) => {
        if (editingTitle.trim()) {
            renameWorkspace(id, editingTitle.trim());
            setEditingId(null);
            setActiveMenuId(null);
        }
    };

    return (
        <div className="min-h-full flex flex-col bg-base text-text-main">
            {/* Top Navigation Bar */}
            <header className="px-8 h-20 flex items-center justify-between border-b border-border-main shrink-0">
                <div className="flex-1 max-w-xl relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search tasks, teams, or documents..."
                        className="w-full bg-surface border border-border-main rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-text-main placeholder-text-muted transition-colors"
                    />
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setActiveTab('my-tasks')}
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" />
                        New Task
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full custom-scrollbar">
                {/* Greeting Area */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back 👋</h1>
                        <p className="text-text-muted">Here's what's happening in your workspaces today.</p>
                    </div>
                    {isCreating ? (
                        <form onSubmit={handleCreate} className="flex gap-2 items-center">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Workspace Name..."
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="bg-surface border border-primary text-text-main rounded-lg px-4 py-2 focus:outline-none"
                            />
                            <button type="submit" disabled={!newTitle.trim()} className="bg-primary hover:bg-primary-hover text-white disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-semibold">
                                Create
                            </button>
                            <button type="button" onClick={() => setIsCreating(false)} className="text-text-muted hover:text-text-main px-2 py-2 text-sm font-semibold">
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 border border-primary/50 text-primary hover:bg-primary-light px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Create New Workspace
                        </button>
                    )}
                </div>

                {/* Workspaces Section */}
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">Active Workspaces</h2>
                        <span className="bg-surface-hover text-text-muted border border-border-main text-[10px] font-bold px-2 py-1 rounded-full tracking-wide">
                            {state.workspaces.length} ACTIVE
                        </span>
                    </div>
                    <button className="text-primary hover:text-primary-hover text-sm font-semibold transition-colors">
                        View all
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                    {state.workspaces.map((ws, i) => {
                        const gradient = gradients[i % gradients.length];
                        const itemsCount = ws.sections.reduce((acc, s) => acc + s.cards.length, 0);

                        return (
                            <div
                                key={ws.id}
                                className="group relative bg-surface border border-border-main rounded-2xl p-4 cursor-pointer hover:border-primary/50 transition-all hover:bg-surface-hover shadow-sm"
                                onClick={() => openWorkspace(ws.id)}
                            >
                                <div className={`h-36 rounded-xl bg-gradient-to-br ${gradient} mb-4 relative overflow-hidden flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity`}>
                                    <div className="absolute inset-0 bg-white/5 mix-blend-overlay"></div>

                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === ws.id ? null : ws.id);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors text-white"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {activeMenuId === ws.id && (
                                            <div className="absolute top-10 right-0 w-40 bg-surface border border-border-main rounded-lg shadow-xl overflow-hidden z-20">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingId(ws.id);
                                                        setEditingTitle(ws.title);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-surface-hover hover:text-text-main flex items-center gap-2"
                                                >
                                                    <Settings className="w-4 h-4" /> Rename
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteWorkspace(ws.id);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 border-t border-border-main"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    {editingId === ws.id ? (
                                        <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); handleRename(ws.id); }}>
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                onBlur={() => handleRename(ws.id)}
                                                className="w-full bg-surface-hover border border-primary text-text-main rounded px-2 py-1 text-lg font-bold focus:outline-none mb-1"
                                            />
                                        </form>
                                    ) : (
                                        <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                                            {ws.title}
                                        </h3>
                                    )}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={clsx("w-2 h-2 rounded-full", itemsCount > 0 ? "bg-emerald-500" : "bg-neutral-500")}></span>
                                        <p className="text-sm text-text-muted">
                                            {itemsCount} {itemsCount === 1 ? 'task' : 'tasks'} in progress
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Banner block */}
                <div className="bg-surface border border-border-main border-dashed rounded-3xl p-10 flex flex-col items-center text-center mb-12 relative overflow-hidden">
                    <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center mb-6 border border-border-main">
                        <Rocket className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Ready for a new project?</h2>
                    <p className="text-text-muted max-w-md mb-8">
                        Track your progress and hit milestones faster by creating a dedicated workspace for your next big idea.
                    </p>

                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                        >
                            Create Workspace
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};
