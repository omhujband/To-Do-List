import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Subtask } from '../types';
import { useBoard } from '../context/BoardContext';

interface SubtaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    subtask: Subtask;
    workspaceId: string;
    sectionId: string;
    cardId: string;
}

export const SubtaskModal: React.FC<SubtaskModalProps> = ({ isOpen, onClose, subtask, workspaceId, sectionId, cardId }) => {
    const { renameSubtask, updateSubtaskDescription } = useBoard();
    const [title, setTitle] = useState(subtask.title);
    const [description, setDescription] = useState(subtask.description || '');

    useEffect(() => {
        setTitle(subtask.title);
        setDescription(subtask.description || '');
    }, [subtask]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (title.trim() !== subtask.title) {
            renameSubtask(workspaceId, sectionId, cardId, subtask.id, title.trim() || 'Untitled');
        }
        if (description !== (subtask.description || '')) {
            updateSubtaskDescription(workspaceId, sectionId, cardId, subtask.id, description);
        }
    };

    const handleClose = () => {
        handleSave();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative w-full max-w-lg bg-surface border border-border-main rounded-2xl shadow-2xl flex flex-col text-text-main animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-border-main flex items-center justify-between shrink-0 bg-surface-hover/50">
                    <h3 className="text-lg font-bold">Edit Subtask</h3>
                    <button onClick={handleClose} className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-text-muted mb-1.5">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleSave}
                            className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-primary transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-muted mb-1.5">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={handleSave}
                            placeholder="Add notes or details..."
                            className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-primary min-h-[120px] resize-y transition-colors custom-scrollbar text-sm"
                        />
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-border-main flex justify-end shrink-0">
                    <button onClick={handleClose} className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
