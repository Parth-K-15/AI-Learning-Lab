import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MissionariesCannibals from './pages/MissionariesCannibals';
import GoalStackPlanning from './pages/GoalStackPlanningNew';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/missionaries-cannibals" element={<MissionariesCannibals />} />
        <Route path="/goal-stack-planning" element={<GoalStackPlanning />} />
      </Routes>
    </Router>
  );
}

export default App;
