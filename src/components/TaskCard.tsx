import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '../types';
import { useBoard } from '../context/BoardContext';
import { Trash2, GripVertical, CheckSquare, Pencil } from 'lucide-react';
import { clsx } from 'clsx';
import { TaskModal } from './TaskModal';

interface TaskCardProps {
    card: CardType;
    workspaceId: string;
    sectionId: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ card, workspaceId, sectionId }) => {
    const { deleteCard, renameCard } = useBoard();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(card.title);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-surface border-2 border-primary rounded-xl p-4 opacity-50"
            />
        );
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                onClick={() => !isEditingTitle && setIsModalOpen(true)}
                className="bg-surface border border-border-main rounded-xl p-4 group cursor-pointer hover:border-border-hover transition-colors shadow-sm"
            >
                <div className="flex items-start gap-2 mb-3">
                    <div
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 cursor-grab text-text-muted hover:text-text-main transition-colors"
                    >
                    <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                                className="flex-1 bg-surface-hover border border-primary rounded px-2 py-1 text-text-main text-sm focus:outline-none"
                            />
                        </div>
                    ) : (
                        <h4 className="text-text-main font-medium text-sm break-words transition-colors">
                            {card.title}
                        </h4>
                    )}
                </div>
                {!isEditingTitle && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setIsEditingTitle(true)}
                            className="p-1 text-text-muted hover:text-text-main hover:bg-surface-hover rounded"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => deleteCard(workspaceId, sectionId, card.id)}
                            className="p-1 text-text-muted hover:text-red-500 hover:bg-surface-hover rounded"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {totalSubtasks > 0 && (
                <div className="flex items-center gap-2 text-xs font-medium mt-1">
                    <CheckSquare className="w-4 h-4 text-text-muted" />
                    <span className={clsx(completedSubtasks === totalSubtasks ? 'text-emerald-500' : 'text-text-muted')}>
                        {completedSubtasks}/{totalSubtasks}
                    </span>
                    <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden border border-border-main">
                        <div
                            className={clsx('h-full transition-all', completedSubtasks === totalSubtasks ? 'bg-emerald-500' : 'bg-primary')}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}
            </div>

            {isModalOpen && (
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    card={card}
                    workspaceId={workspaceId}
                    sectionId={sectionId}
                />
            )}
        </>
    );
};
