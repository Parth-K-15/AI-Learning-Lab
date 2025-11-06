import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const games = [
    {
      id: 'm3c',
      title: '3 Missionaries & 3 Cannibals',
      description: 'Master the A* search algorithm by solving the classic river-crossing puzzle. Learn heuristic-based pathfinding with real-time visualization.',
      icon: '🚣',
      color: 'from-blue-600 to-cyan-600',
      path: '/missionaries-cannibals',
      features: ['A* Algorithm', 'Heuristic Search', 'Dual Play Modes', 'Real-time Visualization']
    },
    // {
    //   id: 'gsp',
    //   title: 'Goal Stack Planning',
    //   description: 'Explore AI planning with the Blocks World problem. Watch how the Goal Stack Planner decomposes goals and generates action sequences.',
    //   icon: '🧱',
    //   color: 'from-purple-600 to-pink-600',
    //   path: '/goal-stack-planning',
    //   features: ['Stack-based Planning', 'Operator Selection', 'World State Updates', 'Step-by-step Execution']
    // },
    // {
    //   id: 'gsp-backward',
    //   title: 'Goal Stack Planning (Backward)',
    //   description: 'Pure goal regression: select operators from Goal → Initial without forward world changes during reasoning.',
    //   icon: '↩️',
    //   color: 'from-amber-600 to-red-600',
    //   path: '/goal-stack-planning-backward',
    //   features: ['Backward Reasoning', 'Regression Operator Order', 'Detailed Logs']
    // },
    {
      id: 'nqueens',
      title: 'N-Queens Visual Solver',
      description: 'Watch the backtracking algorithm solve the classic N-Queens constraint satisfaction problem step-by-step with conflict highlighting.',
      icon: '♛',
      color: 'from-rose-600 to-orange-600',
      path: '/n-queens',
      features: ['Backtracking Algorithm', 'Constraint Satisfaction', 'Conflict Detection', 'Multiple Board Sizes']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              🤖 AI Learning Lab
            </h1>
            <p className="text-xl text-gray-300">
              Interactive visualizations for understanding AI algorithms
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-100">
            Choose Your Learning Adventure
          </h2>
          <p className="text-lg text-gray-400">
            Select a visualization to explore classic AI problem-solving techniques
          </p>
        </motion.div>

        {/* Game Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
            >
              <Link to={game.path}>
                <div className="group relative overflow-hidden rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-cyan-500 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  
                  {/* Content */}
                  <div className="relative p-8">
                    {/* Icon */}
                    <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                      {game.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                      {game.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      {game.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {game.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-slate-700/50 text-cyan-400 rounded-full text-sm font-semibold border border-slate-600"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold text-lg group-hover:gap-4 transition-all">
                      <span>Start Learning</span>
                      <span className="text-2xl">→</span>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.color} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`}></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-slate-800 border border-slate-700 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-4 text-gray-100">
            📖 About This Lab
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-gray-300">
            <div>
              <div className="text-3xl mb-2">🎓</div>
              <h4 className="font-semibold text-white mb-2">Educational</h4>
              <p className="text-sm">
                Built for students and educators to understand AI algorithms through interactive visualization
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold text-white mb-2">Real-time</h4>
              <p className="text-sm">
                Watch algorithms execute step-by-step with synchronized animations and detailed explanations
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🎮</div>
              <h4 className="font-semibold text-white mb-2">Interactive</h4>
              <p className="text-sm">
                Both auto-solve and manual modes let you explore different problem-solving strategies
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-16 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400">
          <p>Built with React, Tailwind CSS, and Framer Motion</p>
          <p className="mt-2">AI Learning Lab © 2025</p>
        </div>
      </footer>
    </div>
  );
}
