import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '../types';
import { useBoard } from '../context/BoardContext';
import { Trash2, GripVertical, CheckSquare, Pencil, X } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskCardProps {
    card: CardType;
    workspaceId: string;
    sectionId: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ card, workspaceId, sectionId }) => {
    const { deleteCard, renameCard, createSubtask, toggleSubtaskComplete, deleteSubtask } = useBoard();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(card.title);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
        data: {
            type: 'Card',
            card,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const completedSubtasks = card.subtasks.filter((st) => st.completed).length;
    const totalSubtasks = card.subtasks.length;
    const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const handleRenameSubmit = () => {
        if (editedTitle.trim()) {
            renameCard(workspaceId, sectionId, card.id, editedTitle.trim());
            setIsEditingTitle(false);
        }
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubtaskTitle.trim()) {
            createSubtask(workspaceId, sectionId, card.id, newSubtaskTitle.trim());
            setNewSubtaskTitle('');
        }
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-neutral-800 border-2 border-blue-500 rounded-xl p-4 opacity-50"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 group cursor-default hover:border-neutral-600 transition-colors shadow-sm"
        >
            <div className="flex items-start gap-2 mb-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-1 cursor-grab text-neutral-500 hover:text-white transition-colors"
                >
                    <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onBlur={handleRenameSubmit}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameSubmit();
                                    if (e.key === 'Escape') setIsEditingTitle(false);
                                }}
                                className="flex-1 bg-neutral-900 border border-blue-500 rounded px-2 py-1 text-white text-sm focus:outline-none"
                            />
                        </div>
                    ) : (
                        <h4
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-white font-medium text-sm break-words cursor-pointer hover:text-blue-400 transition-colors"
                        >
                            {card.title}
                        </h4>
                    )}
                </div>
                {!isEditingTitle && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditingTitle(true)}
                            className="p-1 text-neutral-500 hover:text-white hover:bg-neutral-700 rounded"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => deleteCard(workspaceId, sectionId, card.id)}
                            className="p-1 text-neutral-500 hover:text-red-400 hover:bg-neutral-700 rounded"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {totalSubtasks > 0 && (
                <div
                    className="flex items-center gap-2 text-xs font-medium cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <CheckSquare className="w-4 h-4 text-neutral-400" />
                    <span className={clsx(completedSubtasks === totalSubtasks ? 'text-green-500' : 'text-neutral-400')}>
                        {completedSubtasks}/{totalSubtasks}
                    </span>
                    <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                        <div
                            className={clsx('h-full transition-all', completedSubtasks === totalSubtasks ? 'bg-green-500' : 'bg-blue-500')}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-neutral-700">
                    <div className="space-y-2 mb-3">
                        {card.subtasks.map((st) => (
                            <div key={st.id} className="flex items-start gap-2 group/subtask">
                                <input
                                    type="checkbox"
                                    checked={st.completed}
                                    onChange={() => toggleSubtaskComplete(workspaceId, sectionId, card.id, st.id)}
                                    className="mt-1 flex-shrink-0 cursor-pointer w-4 h-4 rounded border-neutral-600 bg-neutral-700 checked:bg-blue-500 focus:ring-blue-500 focus:ring-offset-neutral-900"
                                />
                                <div className="flex-1">
                                    <span className={clsx('text-sm', st.completed ? 'text-neutral-500 line-through' : 'text-neutral-200')}>
                                        {st.title}
                                    </span>
                                </div>
                                <button
                                    onClick={() => deleteSubtask(workspaceId, sectionId, card.id, st.id)}
                                    className="p-1 text-neutral-600 hover:text-red-400 opacity-0 group-hover/subtask:opacity-100 transition-opacity"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddSubtask} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add subtask..."
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 text-white placeholder-neutral-500"
                        />
                        <button
                            type="submit"
                            disabled={!newSubtaskTitle.trim()}
                            className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                        >
                            Add
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
