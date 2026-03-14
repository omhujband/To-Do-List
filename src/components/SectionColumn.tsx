import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Section as SectionType } from '../types';
import { useBoard } from '../context/BoardContext';
import { TaskCard } from './TaskCard';
import { MoreHorizontal, Plus, Trash2, Pencil } from 'lucide-react';

interface SectionColumnProps {
    section: SectionType;
    workspaceId: string;
    columnWidthClass?: string;
    searchQuery?: string;
}

export const SectionColumn: React.FC<SectionColumnProps> = ({ section, workspaceId, columnWidthClass = 'w-[320px]', searchQuery = '' }) => {
    const { createCard, deleteSection, renameSection } = useBoard();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(section.title);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: section.id,
        data: {
            type: 'Section',
            section,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const handleRenameSubmit = () => {
        if (editedTitle.trim()) {
            renameSection(workspaceId, section.id, editedTitle.trim());
            setIsEditingTitle(false);
            setMenuOpen(false);
        }
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCardTitle.trim()) {
            createCard(workspaceId, section.id, newCardTitle.trim());
            setNewCardTitle('');
            setIsAddingCard(false);
        }
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`flex-shrink-0 ${columnWidthClass} rounded-2xl opacity-50 flex flex-col max-h-full border border-border-hover bg-surface transition-all duration-300`}
            />
        );
    }

    const filteredCards = section.cards.filter(c => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        if (c.title.toLowerCase().includes(query)) return true;
        if (c.subtasks.some(st => st.title.toLowerCase().includes(query))) return true;
        return false;
    });

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex-shrink-0 ${columnWidthClass} rounded-2xl flex flex-col max-h-full transition-all duration-300`}
        >
            <div
                {...attributes}
                {...listeners}
                className="pb-4 flex items-center justify-between cursor-grab group transition-colors"
            >
                <div className="flex items-center gap-3">
                    {isEditingTitle ? (
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
                            className="bg-surface-hover border border-primary rounded px-2 py-1 text-text-main font-bold text-lg focus:outline-none w-32"
                        />
                    ) : (
                        <h3 className="font-bold text-lg text-text-main">{section.title}</h3>
                    )}
                    <span className="bg-surface border border-border-main text-text-muted text-xs font-bold px-2 py-0.5 rounded-full">
                        {section.cards.length}
                    </span>
                </div>

                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                            setConfirmDelete(false);
                        }}
                        className="p-1 text-text-muted hover:text-text-main transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-surface-hover border border-border-main rounded-lg shadow-xl overflow-hidden z-20">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditingTitle(true);
                                    setMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-text-muted hover:bg-surface hover:text-text-main flex items-center gap-2"
                            >
                                <Pencil className="w-4 h-4" /> Rename
                            </button>
                            {confirmDelete ? (
                                <div className="px-4 py-2 flex items-center justify-between border-t border-border-hover bg-red-500/10" onClick={(e) => e.stopPropagation()}>
                                    <span className="text-sm font-medium text-red-500">Sure?</span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteSection(workspaceId, section.id);
                                                setMenuOpen(false);
                                            }}
                                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmDelete(false);
                                            }}
                                            className="px-2 py-1 text-xs bg-surface border border-border-main hover:bg-surface-hover text-text-main rounded"
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDelete(true);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 border-t border-border-main"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-4 min-h-[150px] space-y-4 custom-scrollbar">
                <SortableContext items={filteredCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    {filteredCards.map((card) => (
                        <TaskCard key={card.id} card={card} workspaceId={workspaceId} sectionId={section.id} />
                    ))}
                </SortableContext>

                {isAddingCard ? (
                    <form onSubmit={handleAddCard} className="mt-2 bg-surface p-3 rounded-2xl border border-primary">
                        <textarea
                            autoFocus
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            placeholder="Task name"
                            className="w-full bg-transparent border-none text-text-main text-sm focus:outline-none resize-none"
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddCard(e);
                                }
                                if (e.key === 'Escape') setIsAddingCard(false);
                            }}
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <button
                                type="submit"
                                disabled={!newCardTitle.trim()}
                                className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            >
                                Add Task
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddingCard(false)}
                                className="text-text-muted hover:text-text-main px-2 py-1.5 text-xs font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsAddingCard(true)}
                        className="w-full py-4 flex items-center justify-center gap-2 text-text-muted hover:text-text-main border border-dashed border-border-main hover:border-border-hover rounded-2xl transition-all font-semibold text-sm mt-2 bg-surface/50 hover:bg-surface-hover/50"
                    >
                        <Plus className="w-4 h-4" /> Add Task
                    </button>
                )}
            </div>
        </div>
    );
};
