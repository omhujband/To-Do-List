export interface Subtask {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
}

export interface Card {
    id: string;
    title: string;
    description?: string;
    subtasks: Subtask[];
}

export interface Section {
    id: string;
    title: string;
    cards: Card[];
}

export interface Workspace {
    id: string;
    title: string;
    sections: Section[];
}

export interface BoardState {
    workspaces: Workspace[];
    globalTasks: Card[];
    activeWorkspaceId: string | null;
    theme: string;
}
