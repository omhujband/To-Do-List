import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { ArrowLeft, Plus, Search, LayoutGrid } from 'lucide-react';
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

        if (isActiveCard && isOverCard) {
            const activeSectionId = activeWorkspace.sections.find(s => s.cards.some(c => c.id === activeId))?.id;
            const overSectionId = activeWorkspace.sections.find(s => s.cards.some(c => c.id === overId))?.id;

            if (!activeSectionId || !overSectionId) return;

            if (activeSectionId === overSectionId) {
                const section = activeWorkspace.sections.find(s => s.id === activeSectionId);
                if (section) {
                    const oldIndex = section.cards.findIndex(c => c.id === activeId);
                    const newIndex = section.cards.findIndex(c => c.id === overId);
                    updateCardsWithinSection(activeWorkspace.id, section.id, arrayMove(section.cards, oldIndex, newIndex));
                }
            } else {
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

        if (isActiveSection && over.data.current?.type === 'Section') {
            const oldIndex = activeWorkspace.sections.findIndex(s => s.id === activeId);
            const newIndex = activeWorkspace.sections.findIndex(s => s.id === overId);

            reorderSections(activeWorkspace.id, arrayMove(activeWorkspace.sections, oldIndex, newIndex));
        }
    };

    return (
        <div className="min-h-full bg-[#0F1218] flex flex-col text-white">
            {/* Top Navigation Bar Component (Mocked for Board layout) */}
            <header className="px-8 h-20 flex items-center justify-between border-b border-neutral-800 shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => openWorkspace(null)}
                        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                        title="Back to Workspaces"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <LayoutGrid className="w-4 h-4 text-white" />
                        </div>
                        Workspace
                    </div>
                    <nav className="flex items-center gap-6 ml-6 text-sm font-medium text-neutral-400">
                        <button className="text-white border-b-2 border-blue-600 py-7">Board</button>
                        <button className="hover:text-white transition-colors">Timeline</button>
                        <button className="hover:text-white transition-colors">Calendar</button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="bg-[#1A1D24] border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-neutral-500 w-64"
                        />
                    </div>
                </div>
            </header>

            {/* Board Header Title Area */}
            <div className="px-8 py-8 shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                        {activeWorkspace.title}
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Manage project stages and upcoming milestones
                    </p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                    <Plus className="w-5 h-5" />
                    New Task
                </button>
            </div>

            <main className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                >
                    <div className="flex gap-6 h-full items-start pb-4">
                        <SortableContext
                            items={activeWorkspace.sections.map(s => s.id)}
                            strategy={horizontalListSortingStrategy}
                        >
                            {activeWorkspace.sections.map((section) => (
                                <SectionColumn key={section.id} section={section} workspaceId={activeWorkspace.id} />
                            ))}
                        </SortableContext>

                        {/* Add Section Button */}
                        <div className="flex-shrink-0 w-80">
                            {isAddingSection ? (
                                <form onSubmit={handleAddSection} className="bg-[#13151D] border border-blue-500 p-3 rounded-2xl">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                        placeholder="Section title..."
                                        className="w-full bg-[#1A1D24] border border-neutral-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-blue-500 mb-3"
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
                                    className="w-full h-24 bg-[#161923] hover:bg-[#1A1D24] border border-[#2A2E39] border-dashed rounded-2xl flex items-center justify-center gap-2 text-neutral-400 hover:text-white font-semibold transition-all"
                                >
                                    <Plus className="w-5 h-5 text-neutral-500" />
                                    Add New Section
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
