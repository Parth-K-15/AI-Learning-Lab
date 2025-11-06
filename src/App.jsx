import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MissionariesCannibals from './pages/MissionariesCannibals';
import GoalStackPlanning from './pages/GoalStackPlanningNew';
import GoalStackPlanningBackward from './pages/GoalStackPlanningBackward';
import NQueens from './pages/NQueens';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/missionaries-cannibals" element={<MissionariesCannibals />} />
        <Route path="/goal-stack-planning" element={<GoalStackPlanning />} />
        <Route path="/goal-stack-planning-backward" element={<GoalStackPlanningBackward />} />
        <Route path="/n-queens" element={<NQueens />} />
      </Routes>
    </Router>
  );
}

export default App;
