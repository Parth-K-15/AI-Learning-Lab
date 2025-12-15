import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MissionariesCannibals from './pages/MissionariesCannibals';
import NQueens from './pages/NQueens';
import GoalStackPlanning from './pages/GoalStackPlanning';
import EightPuzzle from './pages/EightPuzzle';
import AStarVisualizer from './pages/AStarVisualizer';
import AlphaBetaPruning from './pages/AlphaBetaPruning';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/astar-visualizer" element={<AStarVisualizer />} />
        <Route path="/missionaries-cannibals" element={<MissionariesCannibals />} />
        <Route path="/n-queens" element={<NQueens />} />
        <Route path="/goal-stack-planning" element={<GoalStackPlanning />} />
        <Route path="/8-puzzle" element={<EightPuzzle />} />
        <Route path="/alpha-beta-pruning" element={<AlphaBetaPruning />} />
      </Routes>
    </Router>
  );
}

export default App;
