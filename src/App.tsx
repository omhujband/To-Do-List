import React from 'react';
import { BoardProvider, useBoard } from './context/BoardContext';
import { Home } from './components/Home';
import { Board } from './components/Board';

const AppContent: React.FC = () => {
  const { state } = useBoard();

  return (
    <div className="min-h-screen bg-neutral-900 font-sans antialiased text-white">
      {state.activeWorkspaceId ? <Board /> : <Home />}
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
