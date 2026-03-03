import React, { useState } from 'react';
import { BoardProvider, useBoard } from './context/BoardContext';
import { Home } from './components/Home';
import { Board } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { MyTasks } from './components/MyTasks';

const AppContent: React.FC = () => {
  const { state } = useBoard();
  const [activeTab, setActiveTab] = useState('dashboard');

  let content;
  if (state.activeWorkspaceId) {
    content = <Board />;
  } else if (activeTab === 'dashboard') {
    content = <Home setActiveTab={setActiveTab} />;
  } else if (activeTab === 'my-tasks') {
    content = <MyTasks />;
  } else {
    content = (
      <div className="p-8 text-center text-neutral-400 pt-24">
        <h2 className="text-2xl font-bold text-white mb-2 capitalize">{activeTab.replace('-', ' ')}</h2>
        <p>This view is under construction. Please use the Dashboard for now.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1218] font-sans antialiased text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto bg-[#0F1218]">
        {content}
      </div>
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
