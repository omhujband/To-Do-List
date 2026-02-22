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
}

export const SectionColumn: React.FC<SectionColumnProps> = ({ section, workspaceId }) => {
    const { createCard, deleteSection, renameSection } = useBoard();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(section.title);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

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
                className="flex-shrink-0 w-80 bg-neutral-800/50 border-2 border-blue-500 rounded-2xl opacity-50 flex flex-col max-h-full"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex-shrink-0 w-80 bg-neutral-800/80 rounded-2xl flex flex-col max-h-full"
        >
            <div
                {...attributes}
                {...listeners}
                className="p-4 flex items-center gap-3 cursor-grab rounded-t-2xl group hover:bg-neutral-700/50 transition-colors"
            >
                <div className="flex-1 min-w-0 flex items-center gap-2">
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
                            className="flex-1 bg-neutral-900 border border-blue-500 rounded px-2 py-1 text-white font-semibold focus:outline-none"
                        />
                    ) : (
                        <h3 className="font-semibold text-white truncate">{section.title}</h3>
                    )}
                    <span className="bg-neutral-700 text-neutral-300 text-xs font-medium px-2 py-0.5 rounded-full">
                        {section.cards.length}
                    </span>
                </div>

                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl overflow-hidden z-20">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditingTitle(true);
                                    setMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white flex items-center gap-2"
                            >
                                <Pencil className="w-4 h-4" /> Rename
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete this section and all its cards?')) {
                                        deleteSection(workspaceId, section.id);
                                    }
                                    setMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 hover:text-red-300 flex items-center gap-2 border-t border-neutral-700"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 min-h-[150px] space-y-3 custom-scrollbar">
                <SortableContext items={section.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    {section.cards.map((card) => (
                        <TaskCard key={card.id} card={card} workspaceId={workspaceId} sectionId={section.id} />
                    ))}
                </SortableContext>

                {isAddingCard ? (
                    <form onSubmit={handleAddCard} className="mt-3">
                        <textarea
                            autoFocus
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full bg-neutral-900 border border-blue-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none resize-none"
                            rows={3}
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
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                                Add Card
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAddingCard(false)}
                                className="text-neutral-400 hover:text-white px-3 py-1.5 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsAddingCard(true)}
                        className="w-full py-2.5 flex items-center justify-center gap-2 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-xl transition-colors font-medium text-sm mt-2 border border-dashed border-transparent hover:border-neutral-600"
                    >
                        <Plus className="w-4 h-4" /> Add a card
                    </button>
                )}
            </div>
        </div>
    );
};
