export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Card {
    id: string;
    title: string;
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
    activeWorkspaceId: string | null;
}
