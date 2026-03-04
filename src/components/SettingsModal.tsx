import React, { useState } from 'react';
import { X, Trash2, Palette, AlertTriangle } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { clsx } from 'clsx';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const THEMES = [
    { id: 'ash', name: 'Ash', color: '#1f2937' },
    { id: 'arctic', name: 'Arctic', color: '#F8FAFC', light: true },
    { id: 'sapphire', name: 'Sapphire', color: '#020617' },
    { id: 'forest', name: 'Forest', color: '#064E3B' },
    { id: 'sunset', name: 'Sunset', color: '#450A0A' },
    { id: 'ivory', name: 'Ivory', color: '#FEFCE8', light: true },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { state, setTheme, clearAllData } = useBoard();
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);

    if (!isOpen) return null;

    const handleClearData = () => {
        clearAllData();
        setIsConfirmingClear(false);
        onClose();
        // Optional: reload window to completely clear any stale UI state if necessary
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className="relative w-full max-w-md bg-surface border border-border-main rounded-2xl shadow-2xl overflow-hidden flex flex-col text-text-main animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-surface-hover/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Settings & Appearance
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                    {/* Theme Section */}
                    <section>
                        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
                            Color Theme
                        </h3>
                        <div className="grid grid-cols-5 gap-3">
                            {THEMES.map((theme) => {
                                const isActive = state.theme === theme.id;
                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => setTheme(theme.id)}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div
                                            className={clsx(
                                                "w-12 h-12 rounded-full border-2 transition-all p-0.5",
                                                isActive ? "border-primary scale-110 shadow-lg" : "border-transparent border-border-main hover:scale-105"
                                            )}
                                        >
                                            <div
                                                className="w-full h-full rounded-full border border-black/10 dark:border-white/10"
                                                style={{ backgroundColor: theme.color }}
                                            />
                                        </div>
                                        <span className={clsx(
                                            "text-[10px] font-medium transition-colors",
                                            isActive ? "text-primary" : "text-text-muted group-hover:text-text-main"
                                        )}>
                                            {theme.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="pt-6 border-t border-border-main">
                        <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Danger Zone
                        </h3>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-red-400 mb-1">Clear Local Data</h4>
                                <p className="text-xs text-red-400/80">
                                    This will permanently delete all workspaces, boards, and tasks from your browser's local storage. This action cannot be undone.
                                </p>
                            </div>

                            {!isConfirmingClear ? (
                                <button
                                    onClick={() => setIsConfirmingClear(true)}
                                    className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Wipe All Data
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsConfirmingClear(false)}
                                        className="flex-1 py-2 px-4 bg-surface hover:bg-surface-hover text-text-main border border-border-hover text-sm font-bold rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleClearData}
                                        className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        Yes, Delete It
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
