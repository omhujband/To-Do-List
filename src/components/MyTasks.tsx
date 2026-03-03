import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { TaskCard } from './TaskCard';
import { Calendar, CheckCircle2, Plus } from 'lucide-react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, closestCorners } from '@dnd-kit/core';

export const MyTasks: React.FC = () => {
    const { state, createGlobalTask } = useBoard();
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Flatten all tasks from all workspaces
    const allTasks = state.workspaces.flatMap(workspace =>
        workspace.sections.flatMap(section =>
            section.cards.map(card => ({
                ...card,
                workspaceId: workspace.id,
                workspaceTitle: workspace.title,
                sectionId: section.id,
                sectionTitle: section.title,
            }))
        )
    );

    const completedTasksCount = allTasks.filter(t => t.subtasks.length > 0 && t.subtasks.every(st => st.completed)).length;

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            createGlobalTask(newTaskTitle.trim());
            setNewTaskTitle('');
        }
    };

    return (
        <div className="min-h-full bg-[#0F1218] flex flex-col text-white">
            <header className="px-8 py-8 shrink-0 border-b border-neutral-800 bg-[#13151D]/50">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                            My Tasks
                        </h1>
                        <p className="text-neutral-400 text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            <span className="text-neutral-600 px-2">•</span>
                            <span className="text-emerald-500 font-medium">{completedTasksCount} completed from workspaces</span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAddTask} className="flex gap-3 max-w-2xl">
                    <div className="flex-1 relative">
                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Add a new task to your day..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="w-full bg-[#1A1D24] border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-neutral-500 transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                        Add Task
                    </button>
                </form>
            </header>

            <main className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                {(state.globalTasks || []).length === 0 && allTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                        <CheckCircle2 className="w-16 h-16 mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold text-neutral-400">No tasks found</h3>
                        <p className="text-sm mt-2">Create some tasks above or in your workspaces to see them here.</p>
                    </div>
                ) : (
                    <div className="space-y-8 pb-12">
                        {/* Global Tasks Section */}
                        {(state.globalTasks || []).length > 0 && (
                            <div className="bg-[#13151D] border border-blue-500/20 rounded-3xl p-6">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="w-2 h-6 bg-blue-500 rounded-full" />
                                    Today's List
                                    <span className="text-xs font-semibold px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md ml-auto border border-blue-500/20">
                                        {(state.globalTasks || []).length} tasks
                                    </span>
                                </h2>

                                <DndContext collisionDetection={closestCorners}>
                                    <SortableContext items={(state.globalTasks || []).map(t => t.id)} strategy={horizontalListSortingStrategy}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {(state.globalTasks || []).map(task => (
                                                <div key={task.id} className="flex flex-col gap-2">
                                                    <div className="text-xs font-semibold text-blue-400 px-1 uppercase tracking-wider">
                                                        Independent Task
                                                    </div>
                                                    <TaskCard
                                                        card={task}
                                                        workspaceId="global"
                                                        sectionId="global"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        )}

                        {/* Group tasks by workspace */}
                        {state.workspaces.map(workspace => {
                            const workspaceTasks = allTasks.filter(t => t.workspaceId === workspace.id);
                            if (workspaceTasks.length === 0) return null;

                            return (
                                <div key={workspace.id} className="bg-[#13151D] border border-neutral-800 rounded-3xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <div className="w-2 h-6 bg-neutral-600 rounded-full" />
                                        {workspace.title}
                                        <span className="text-xs font-semibold px-2 py-1 bg-neutral-800 text-neutral-400 rounded-md ml-auto">
                                            {workspaceTasks.length} tasks
                                        </span>
                                    </h2>

                                    <DndContext collisionDetection={closestCorners}>
                                        <SortableContext items={workspaceTasks.map(t => t.id)} strategy={horizontalListSortingStrategy}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {workspaceTasks.map(task => (
                                                    <div key={task.id} className="flex flex-col gap-2">
                                                        <div className="text-xs font-semibold text-neutral-500 px-1 uppercase tracking-wider">
                                                            In: {task.sectionTitle}
                                                        </div>
                                                        <TaskCard
                                                            card={task}
                                                            workspaceId={task.workspaceId}
                                                            sectionId={task.sectionId}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};
