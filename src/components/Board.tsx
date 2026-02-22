import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { ArrowLeft, Plus } from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SectionColumn } from './SectionColumn';
import { TaskCard } from './TaskCard';
import type { Card, Section } from '../types';

export const Board: React.FC = () => {
    const { state, openWorkspace, reorderSections, updateCardsWithinSection, moveCardBetweenSections, createSection } = useBoard();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const [activeSection, setActiveSection] = useState<Section | null>(null);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');

    const activeWorkspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    if (!activeWorkspace) {
        return <div className="text-white p-8">Workspace not found</div>;
    }

    const handleAddSection = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSectionTitle.trim()) {
            createSection(activeWorkspace.id, newSectionTitle.trim());
            setNewSectionTitle('');
            setIsAddingSection(false);
        }
    };

    const onDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const { id, data } = active;
        setActiveId(id as string);

        if (data.current?.type === 'Section') {
            setActiveSection(data.current.section);
            return;
        }

        if (data.current?.type === 'Card') {
            setActiveCard(data.current.card);
            return;
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveCard = active.data.current?.type === 'Card';
        const isOverCard = over.data.current?.type === 'Card';
        const isOverSection = over.data.current?.type === 'Section';

        if (!isActiveCard) return;

        // Moving a card over another card
        if (isActiveCard && isOverCard) {
            const activeSectionId = activeWorkspace.sections.find(s => s.cards.some(c => c.id === activeId))?.id;
            const overSectionId = activeWorkspace.sections.find(s => s.cards.some(c => c.id === overId))?.id;

            if (!activeSectionId || !overSectionId) return;

            if (activeSectionId === overSectionId) {
                // Move within same section
                const section = activeWorkspace.sections.find(s => s.id === activeSectionId);
                if (section) {
                    const oldIndex = section.cards.findIndex(c => c.id === activeId);
                    const newIndex = section.cards.findIndex(c => c.id === overId);
                    updateCardsWithinSection(activeWorkspace.id, section.id, arrayMove(section.cards, oldIndex, newIndex));
                }
            } else {
                // Move to different section (inter-section)
                const aSection = activeWorkspace.sections.find(s => s.id === activeSectionId);
                const oSection = activeWorkspace.sections.find(s => s.id === overSectionId);

                if (aSection && oSection) {
                    const activeCard = aSection.cards.find(c => c.id === activeId)!;
                    const overIndex = oSection.cards.findIndex(c => c.id === overId);

                    const newActiveCards = aSection.cards.filter(c => c.id !== activeId);
                    const newOverCards = [
                        ...oSection.cards.slice(0, overIndex),
                        activeCard,
                        ...oSection.cards.slice(overIndex)
                    ];

                    moveCardBetweenSections(activeWorkspace.id, activeSectionId, overSectionId, newActiveCards, newOverCards);
                }
            }
        }

        // Moving a card over an empty section
        if (isActiveCard && isOverSection) {
            const activeSectionId = activeWorkspace.sections.find(s => s.cards.some(c => c.id === activeId))?.id;
            const overSectionId = overId as string;

            if (activeSectionId && activeSectionId !== overSectionId) {
                const aSection = activeWorkspace.sections.find(s => s.id === activeSectionId);
                const oSection = activeWorkspace.sections.find(s => s.id === overSectionId);
                if (aSection && oSection) {
                    const activeCard = aSection.cards.find(c => c.id === activeId)!;
                    const newActiveCards = aSection.cards.filter(c => c.id !== activeId);
                    const newOverCards = [...oSection.cards, activeCard];

                    moveCardBetweenSections(activeWorkspace.id, activeSectionId, overSectionId, newActiveCards, newOverCards);
                }
            }
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        setActiveCard(null);
        setActiveSection(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveSection = active.data.current?.type === 'Section';

        // Section Reordering
        if (isActiveSection && over.data.current?.type === 'Section') {
            const oldIndex = activeWorkspace.sections.findIndex(s => s.id === activeId);
            const newIndex = activeWorkspace.sections.findIndex(s => s.id === overId);

            reorderSections(activeWorkspace.id, arrayMove(activeWorkspace.sections, oldIndex, newIndex));
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col pt-16">
            <header className="fixed top-0 left-0 right-0 h-16 bg-neutral-800 border-b border-neutral-700 flex items-center px-6 z-10 shadow-sm">
                <button
                    onClick={() => openWorkspace(null)}
                    className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-colors mr-6"
                    title="Back to Workspaces"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-white truncate max-w-sm tracking-tight text-white">
                    {activeWorkspace.title}
                </h1>
                <div className="ml-auto text-sm text-neutral-400 font-medium bg-neutral-900/50 px-3 py-1.5 rounded-full border border-neutral-700">
                    {activeWorkspace.sections.length} sections
                </div>
            </header>

            <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 pb-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                >
                    <div className="flex gap-6 h-full items-start board-layout">
                        <SortableContext
                            items={activeWorkspace.sections.map(s => s.id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            {activeWorkspace.sections.map((section) => (
                                <SectionColumn key={section.id} section={section} workspaceId={activeWorkspace.id} />
                            ))}
                        </SortableContext>

                        {/* Add Section Button relative at the end */}
                        <div className="flex-shrink-0 w-80">
                            {isAddingSection ? (
                                <form onSubmit={handleAddSection} className="bg-neutral-800/80 p-3 rounded-2xl border border-blue-500">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                        placeholder="Section title..."
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-blue-500 mb-3"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') setIsAddingSection(false);
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={!newSectionTitle.trim()}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Add Section
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingSection(false)}
                                            className="text-neutral-400 hover:text-white px-3 py-1.5 text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsAddingSection(true)}
                                    className="w-full h-14 bg-neutral-800/50 hover:bg-neutral-700/80 border-2 border-dashed border-neutral-700 hover:border-neutral-500 rounded-2xl flex items-center justify-center gap-2 text-neutral-400 hover:text-white font-semibold transition-all"
                                >
                                    <Plus className="w-5 h-5" /> Add another section
                                </button>
                            )}
                        </div>
                    </div>

                    <DragOverlay>
                        {activeCard ? (
                            <TaskCard
                                card={activeCard}
                                sectionId={activeWorkspace.sections.find(s => s.cards.some(c => c.id === activeId))?.id || ''}
                                workspaceId={activeWorkspace.id}
                            />
                        ) : null}
                        {activeSection ? (
                            <SectionColumn section={activeSection} workspaceId={activeWorkspace.id} />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </main>
        </div>
    );
};
