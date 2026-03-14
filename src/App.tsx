import React, { useState } from 'react';
import { BoardProvider, useBoard } from './context/BoardContext';
import { Home } from './components/Home';
import { Board } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { MyTasks } from './components/MyTasks';
import { SettingsModal } from './components/SettingsModal';

const AppContent: React.FC = () => {
  const { state, openWorkspace } = useBoard();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'dashboard') {
      openWorkspace(null);
    } else {
        // Option to reset workspace when clicking dashboard, or keep it if they want to go back to dashboard. 
        // The instructions say: "When a user navigates to a different page through the sidebar, the currently open workspace board must fully transition out of view".
        // It's safest to just clear it whenever a tab is clicked, even dashboard. 
        openWorkspace(null);
    }
  };

  let content;
  if (state.activeWorkspaceId) {
    content = <Board />;
  } else if (activeTab === 'dashboard') {
    content = <Home setActiveTab={setActiveTab} />;
  } else if (activeTab === 'my-tasks') {
    content = <MyTasks />;
  } else {
    content = (
      <div className="p-8 text-center text-text-muted pt-24">
        <h2 className="text-2xl font-bold text-text-main mb-2 capitalize">{activeTab.replace('-', ' ')}</h2>
        <p>This view is under construction. Please use the Dashboard for now.</p>
      </div>
    );
  }

  return (
    <div data-theme={state.theme} className="flex h-screen overflow-hidden bg-base font-sans antialiased text-text-main">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <div className="flex-1 overflow-auto bg-base">
        {content}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <BoardProvider>
      <AppContent />
    </BoardProvider>
  );
}

export default App;
