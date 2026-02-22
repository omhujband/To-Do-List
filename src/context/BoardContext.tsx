import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { BoardState, Workspace, Section, Card, Subtask } from '../types';

const defaultState: BoardState = {
    workspaces: [],
    activeWorkspaceId: null,
};

type BoardContextType = {
    state: BoardState;

    // Workspace Actions
    createWorkspace: (title: string) => void;
    renameWorkspace: (id: string, newTitle: string) => void;
    deleteWorkspace: (id: string) => void;
    openWorkspace: (id: string | null) => void;

    // Section Actions
    createSection: (workspaceId: string, title: string) => void;
    renameSection: (workspaceId: string, sectionId: string, newTitle: string) => void;
    deleteSection: (workspaceId: string, sectionId: string) => void;
    reorderSections: (workspaceId: string, newSections: Section[]) => void;

    // Card Actions
    createCard: (workspaceId: string, sectionId: string, title: string) => void;
    renameCard: (workspaceId: string, sectionId: string, cardId: string, newTitle: string) => void;
    deleteCard: (workspaceId: string, sectionId: string, cardId: string) => void;
    updateCardsWithinSection: (workspaceId: string, sectionId: string, newCards: Card[]) => void;
    moveCardBetweenSections: (
        workspaceId: string,
        activeSectionId: string,
        overSectionId: string,
        newActiveSectionCards: Card[],
        newOverSectionCards: Card[]
    ) => void;

    // Subtask Actions
    createSubtask: (workspaceId: string, sectionId: string, cardId: string, title: string) => void;
    renameSubtask: (workspaceId: string, sectionId: string, cardId: string, subtaskId: string, newTitle: string) => void;
    deleteSubtask: (workspaceId: string, sectionId: string, cardId: string, subtaskId: string) => void;
    toggleSubtaskComplete: (workspaceId: string, sectionId: string, cardId: string, subtaskId: string) => void;
};

const BoardContext = createContext<BoardContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'todo_app_data';

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<BoardState>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to parse local storage data');
        }
        return defaultState;
    });

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const updateWorkspace = useCallback((workspaceId: string, updater: (w: Workspace) => Workspace) => {
        setState((prev) => ({
            ...prev,
            workspaces: prev.workspaces.map((w) => (w.id === workspaceId ? updater(w) : w)),
        }));
    }, []);

    const updateSection = useCallback(
        (workspaceId: string, sectionId: string, updater: (s: Section) => Section) => {
            updateWorkspace(workspaceId, (w) => ({
                ...w,
                sections: w.sections.map((s) => (s.id === sectionId ? updater(s) : s)),
            }));
        },
        [updateWorkspace]
    );

    const updateCard = useCallback(
        (workspaceId: string, sectionId: string, cardId: string, updater: (c: Card) => Card) => {
            updateSection(workspaceId, sectionId, (s) => ({
                ...s,
                cards: s.cards.map((c) => (c.id === cardId ? updater(c) : c)),
            }));
        },
        [updateSection]
    );

    // --- Workspaces ---
    const createWorkspace = (title: string) => {
        const newWorkspace: Workspace = { id: `ws-${generateId()}`, title, sections: [] };
        setState((prev) => ({
            ...prev,
            workspaces: [...prev.workspaces, newWorkspace],
        }));
    };

    const renameWorkspace = (id: string, newTitle: string) => {
        updateWorkspace(id, (w) => ({ ...w, title: newTitle }));
    };

    const deleteWorkspace = (id: string) => {
        setState((prev) => ({
            ...prev,
            workspaces: prev.workspaces.filter((w) => w.id !== id),
            activeWorkspaceId: prev.activeWorkspaceId === id ? null : prev.activeWorkspaceId,
        }));
    };

    const openWorkspace = (id: string | null) => {
        setState((prev) => ({ ...prev, activeWorkspaceId: id }));
    };

    // --- Sections ---
    const createSection = (workspaceId: string, title: string) => {
        const newSection: Section = { id: `sec-${generateId()}`, title, cards: [] };
        updateWorkspace(workspaceId, (w) => ({ ...w, sections: [...w.sections, newSection] }));
    };

    const renameSection = (workspaceId: string, sectionId: string, newTitle: string) => {
        updateSection(workspaceId, sectionId, (s) => ({ ...s, title: newTitle }));
    };

    const deleteSection = (workspaceId: string, sectionId: string) => {
        updateWorkspace(workspaceId, (w) => ({
            ...w,
            sections: w.sections.filter((s) => s.id !== sectionId),
        }));
    };

    const reorderSections = (workspaceId: string, newSections: Section[]) => {
        updateWorkspace(workspaceId, (w) => ({ ...w, sections: newSections }));
    };

    // --- Cards ---
    const createCard = (workspaceId: string, sectionId: string, title: string) => {
        const newCard: Card = { id: `card-${generateId()}`, title, subtasks: [] };
        updateSection(workspaceId, sectionId, (s) => ({ ...s, cards: [...s.cards, newCard] }));
    };

    const renameCard = (workspaceId: string, sectionId: string, cardId: string, newTitle: string) => {
        updateCard(workspaceId, sectionId, cardId, (c) => ({ ...c, title: newTitle }));
    };

    const deleteCard = (workspaceId: string, sectionId: string, cardId: string) => {
        updateSection(workspaceId, sectionId, (s) => ({
            ...s,
            cards: s.cards.filter((c) => c.id !== cardId),
        }));
    };

    const updateCardsWithinSection = (workspaceId: string, sectionId: string, newCards: Card[]) => {
        updateSection(workspaceId, sectionId, (s) => ({ ...s, cards: newCards }));
    };

    const moveCardBetweenSections = (
        workspaceId: string,
        activeSectionId: string,
        overSectionId: string,
        newActiveSectionCards: Card[],
        newOverSectionCards: Card[]
    ) => {
        updateWorkspace(workspaceId, (w) => {
            const newSections = w.sections.map((s) => {
                if (s.id === activeSectionId) return { ...s, cards: newActiveSectionCards };
                if (s.id === overSectionId) return { ...s, cards: newOverSectionCards };
                return s;
            });
            return { ...w, sections: newSections };
        });
    };

    // --- Subtasks ---
    const createSubtask = (workspaceId: string, sectionId: string, cardId: string, title: string) => {
        const newSubtask: Subtask = { id: `sub-${generateId()}`, title, completed: false };
        updateCard(workspaceId, sectionId, cardId, (c) => ({
            ...c,
            subtasks: [...c.subtasks, newSubtask],
        }));
    };

    const renameSubtask = (workspaceId: string, sectionId: string, cardId: string, subtaskId: string, newTitle: string) => {
        updateCard(workspaceId, sectionId, cardId, (c) => ({
            ...c,
            subtasks: c.subtasks.map((sub) => (sub.id === subtaskId ? { ...sub, title: newTitle } : sub)),
        }));
    };

    const deleteSubtask = (workspaceId: string, sectionId: string, cardId: string, subtaskId: string) => {
        updateCard(workspaceId, sectionId, cardId, (c) => ({
            ...c,
            subtasks: c.subtasks.filter((sub) => sub.id !== subtaskId),
        }));
    };

    const toggleSubtaskComplete = (workspaceId: string, sectionId: string, cardId: string, subtaskId: string) => {
        updateCard(workspaceId, sectionId, cardId, (c) => ({
            ...c,
            subtasks: c.subtasks.map((sub) => (sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub)),
        }));
    };

    return (
        <BoardContext.Provider
            value={{
                state,
                createWorkspace,
                renameWorkspace,
                deleteWorkspace,
                openWorkspace,
                createSection,
                renameSection,
                deleteSection,
                reorderSections,
                createCard,
                renameCard,
                deleteCard,
                updateCardsWithinSection,
                moveCardBetweenSections,
                createSubtask,
                renameSubtask,
                deleteSubtask,
                toggleSubtaskComplete,
            }}
        >
            {children}
        </BoardContext.Provider>
    );
};

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error('useBoard must be used within a BoardProvider');
    }
    return context;
};
