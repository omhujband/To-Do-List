import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { Plus, Settings, Trash2, Layout } from 'lucide-react';

export const Home: React.FC = () => {
    const { state, createWorkspace, deleteWorkspace, openWorkspace, renameWorkspace } = useBoard();
    const [newTitle, setNewTitle] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim()) {
            createWorkspace(newTitle.trim());
            setNewTitle('');
        }
    };

    const handleRename = (id: string) => {
        if (editingTitle.trim()) {
            renameWorkspace(id, editingTitle.trim());
            setEditingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-xl">
                        <Layout className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white">To Do Workspaces</h1>
                </header>

                <form onSubmit={handleCreate} className="mb-10 flex gap-4">
                    <input
                        type="text"
                        placeholder="Create a new workspace..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-neutral-400"
                    />
                    <button
                        type="submit"
                        disabled={!newTitle.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create
                    </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {state.workspaces.map((ws) => (
                        <div
                            key={ws.id}
                            className="group bg-neutral-800 border border-neutral-700 hover:border-blue-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/10 flex flex-col justify-between"
                            onClick={(e) => {
                                // Ignore clicks if they originated from buttons inside the card
                                const target = e.target as HTMLElement;
                                if (!target.closest('button') && !target.closest('input')) {
                                    openWorkspace(ws.id);
                                }
                            }}
                        >
                            <div>
                                {editingId === ws.id ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleRename(ws.id);
                                        }}
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onBlur={() => handleRename(ws.id)}
                                            className="w-full bg-neutral-900 border border-blue-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                                        />
                                    </form>
                                ) : (
                                    <h3 className="text-2xl font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">
                                        {ws.title}
                                    </h3>
                                )}
                                <p className="text-neutral-400 text-sm">
                                    {ws.sections.length} {ws.sections.length === 1 ? 'section' : 'sections'},{' '}
                                    {ws.sections.reduce((acc, s) => acc + s.cards.length, 0)} cards
                                </p>
                            </div>

                            <div className="mt-6 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingId(ws.id);
                                        setEditingTitle(ws.title);
                                    }}
                                    className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                                    title="Rename"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                                {confirmDeleteId === ws.id ? (
                                    <div className="flex items-center gap-2 bg-red-900/50 rounded-lg px-2" onClick={(e) => e.stopPropagation()}>
                                        <span className="text-sm font-medium text-red-200">Delete?</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteWorkspace(ws.id);
                                                setConfirmDeleteId(null);
                                            }}
                                            className="px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmDeleteId(null);
                                            }}
                                            className="px-2 py-1 text-sm bg-neutral-600 hover:bg-neutral-500 text-white rounded transition-colors"
                                        >
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDeleteId(ws.id);
                                        }}
                                        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-700 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {state.workspaces.length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-neutral-700 rounded-2xl">
                            <p className="text-neutral-400 text-lg">No workspaces yet. Create one above to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
