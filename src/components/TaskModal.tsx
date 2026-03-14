import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlignLeft, ListTodo } from 'lucide-react';
import type { Card, Subtask } from '../types';
import { useBoard } from '../context/BoardContext';
import { clsx } from 'clsx';
import { SubtaskModal } from './SubtaskModal';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: Card;
    workspaceId: string;
    sectionId: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, card, workspaceId, sectionId }) => {
    const { renameCard, updateCardDescription, createSubtask, deleteSubtask, toggleSubtaskComplete } = useBoard();
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || '');
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [activeSubtask, setActiveSubtask] = useState<Subtask | null>(null);

    useEffect(() => {
        setTitle(card.title);
        setDescription(card.description || '');
    }, [card]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (title.trim() !== card.title) {
            renameCard(workspaceId, sectionId, card.id, title.trim() || 'Untitled Task');
        }
        if (description !== (card.description || '')) {
            updateCardDescription(workspaceId, sectionId, card.id, description);
        }
    };

    const handleClose = () => {
        handleSave();
        onClose();
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubtaskTitle.trim()) {
            createSubtask(workspaceId, sectionId, card.id, newSubtaskTitle.trim());
            setNewSubtaskTitle('');
        }
    };

    const completedSubtasks = card.subtasks.filter((st) => st.completed).length;
    const totalSubtasks = card.subtasks.length;
    const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-surface border border-border-main rounded-2xl shadow-2xl flex flex-col text-text-main animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-border-main flex items-center justify-between shrink-0 bg-surface-hover/50">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSave}
                        className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1 -ml-2 w-full max-w-[80%]"
                        placeholder="Task Title"
                    />
                    <button onClick={handleClose} className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8">
                    {/* Description Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3 text-text-main font-semibold">
                            <AlignLeft className="w-5 h-5" />
                            <h3>Description</h3>
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={handleSave}
                            placeholder="Add a more detailed description..."
                            className="w-full bg-surface-hover border border-border-main rounded-lg px-4 py-3 text-sm text-text-main focus:outline-none focus:border-primary min-h-[120px] resize-y transition-colors custom-scrollbar"
                        />
                    </section>

                    {/* Subtasks Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-text-main font-semibold flex-shrink-0">
                            <ListTodo className="w-5 h-5" />
                            <h3>Subtasks</h3>
                        </div>

                        {totalSubtasks > 0 && (
                            <div className="mb-4 flex items-center gap-3">
                                <span className={clsx('text-xs font-semibold w-8', completedSubtasks === totalSubtasks ? 'text-emerald-500' : 'text-text-muted')}>
                                    {Math.round(progressPercent)}%
                                </span>
                                <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden border border-border-main">
                                    <div
                                        className={clsx('h-full transition-all duration-300', completedSubtasks === totalSubtasks ? 'bg-emerald-500' : 'bg-primary')}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 mb-4">
                            {card.subtasks.map((st) => (
                                <div key={st.id} className="flex items-center gap-3 group bg-surface-hover border border-border-main rounded-lg p-2.5 hover:border-border-hover transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={st.completed}
                                        onChange={() => toggleSubtaskComplete(workspaceId, sectionId, card.id, st.id)}
                                        className="flex-shrink-0 cursor-pointer w-4 h-4 rounded border-border-hover bg-surface checked:bg-primary focus:ring-primary focus:ring-offset-base"
                                    />
                                    <div
                                        className="flex-1 cursor-pointer min-w-0 flex flex-col justify-center"
                                        onClick={() => setActiveSubtask(st)}
                                    >
                                        <span className={clsx('text-sm block truncate transition-colors', st.completed ? 'text-text-muted line-through' : 'text-text-main group-hover:text-primary')}>
                                            {st.title}
                                        </span>
                                        {st.description && !st.completed && (
                                            <span className="text-xs text-text-muted truncate block mt-0.5">
                                                {st.description}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => deleteSubtask(workspaceId, sectionId, card.id, st.id)}
                                        className="p-1.5 text-text-muted hover:text-red-500 hover:bg-surface rounded opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddSubtask} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a new subtask..."
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                className="flex-1 bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-text-main placeholder-text-muted transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!newSubtaskTitle.trim()}
                                className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </form>
                    </section>
                </div>
            </div>

            {activeSubtask && (
                <SubtaskModal
                    isOpen={!!activeSubtask}
                    onClose={() => setActiveSubtask(null)}
                    subtask={activeSubtask}
                    workspaceId={workspaceId}
                    sectionId={sectionId}
                    cardId={card.id}
                />
            )}
        </div>
    );
};
