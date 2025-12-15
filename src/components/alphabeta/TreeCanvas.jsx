import React from 'react';
import { motion } from 'framer-motion';

export default function TreeCanvas({ root, positions, onNodeClick }) {
  if (!root || !positions) return null;

  const renderNode = (node) => {
    const pos = positions.get(node.id);
    if (!pos) return null;

    const getNodeColor = () => {
      if (node.isPruned) return 'bg-gray-600 border-gray-500 opacity-50';
      if (node.isBeingPruned) return 'bg-red-600 border-red-500'; // Being pruned animation
      if (node.isCurrent) return 'bg-pink-500 border-pink-400';
      if (node.isEvaluated && node.type === 'TERMINAL') return 'bg-green-600 border-green-500';
      if (node.value !== null && node.value !== undefined && node.type !== 'TERMINAL') {
        return node.type === 'MAX' ? 'bg-blue-600 border-blue-500' : 'bg-purple-600 border-purple-500';
      }
      return node.type === 'MAX' ? 'bg-blue-500 border-blue-400' : 'bg-purple-500 border-purple-400';
    };

    return (
      <g key={node.id}>
        {/* Node circle */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r={node.isCurrent ? 32 : 25}
          className={`${getNodeColor()} cursor-pointer transition-all duration-300`}
          style={{ 
            fill: 'currentColor',
            stroke: 'currentColor',
            strokeWidth: 3,
            opacity: node.isPruned ? 0.4 : 1
          }}
          onClick={() => onNodeClick && onNodeClick(node)}
        />
        
        {/* Pulsing ring for current node */}
        {node.isCurrent && (
          <motion.circle
            cx={pos.x}
            cy={pos.y}
            r={32}
            className="fill-none stroke-pink-400"
            strokeWidth="3"
            initial={{ r: 32, opacity: 0.8 }}
            animate={{ r: 45, opacity: 0 }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
        
        {/* Node ID */}
        <text
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-bold fill-white pointer-events-none"
        >
          {node.id}
        </text>

        {/* Node type label */}
        <text
          x={pos.x}
          y={pos.y - 40}
          textAnchor="middle"
          className="text-xs font-semibold fill-cyan-300"
        >
          {node.type}
        </text>

        {/* Value display */}
        {node.value !== null && node.value !== undefined && (
          <text
            x={pos.x}
            y={pos.y + 45}
            textAnchor="middle"
            className="text-sm font-bold fill-green-400"
          >
            {node.value === Infinity ? '+∞' : node.value === -Infinity ? '-∞' : node.value}
          </text>
        )}

        {/* Alpha or Beta display based on node type */}
        {!node.isPruned && node.type !== 'TERMINAL' && (
          <text
            x={pos.x}
            y={pos.y - 50}
            textAnchor="middle"
            className={`text-sm font-bold ${node.type === 'MAX' ? 'fill-orange-400' : 'fill-cyan-400'}`}
          >
            {node.type === 'MAX' 
              ? `α: ${node.alpha === -Infinity ? '-∞' : node.alpha === Infinity ? '+∞' : node.alpha}`
              : `β: ${node.beta === Infinity ? '+∞' : node.beta === -Infinity ? '-∞' : node.beta}`
            }
          </text>
        )}

        {/* Pruned marker with animation */}
        {node.isPruned && (
          <>
            <line
              x1={pos.x - 20}
              y1={pos.y - 20}
              x2={pos.x + 20}
              y2={pos.y + 20}
              stroke="red"
              strokeWidth="3"
              opacity="0.8"
            />
            <line
              x1={pos.x + 20}
              y1={pos.y - 20}
              x2={pos.x - 20}
              y2={pos.y + 20}
              stroke="red"
              strokeWidth="3"
              opacity="0.8"
            />
            <text
              x={pos.x}
              y={pos.y + 60}
              textAnchor="middle"
              className="text-xs font-bold fill-red-500"
            >
              PRUNED
            </text>
          </>
        )}
      </g>
    );
  };

  const renderEdges = (node) => {
    const pos = positions.get(node.id);
    if (!pos) return null;

    return (
      <g key={`edges-${node.id}`}>
        {node.children.map(child => {
          const childPos = positions.get(child.id);
          if (!childPos) return null;

          return (
            <line
              key={`edge-${node.id}-${child.id}`}
              x1={pos.x}
              y1={pos.y + 25}
              x2={childPos.x}
              y2={childPos.y - 25}
              className={child.isPruned ? 'stroke-gray-600' : 'stroke-slate-500'}
              strokeWidth="2"
              opacity={child.isPruned ? 0.3 : 0.6}
            />
          );
        })}
      </g>
    );
  };

  // Collect all nodes for rendering
  const allNodes = [];
  const collectNodes = (node) => {
    allNodes.push(node);
    node.children.forEach(child => collectNodes(child));
  };
  collectNodes(root);

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-4 border border-slate-700 overflow-auto">
      <svg width="1200" height="700" className="mx-auto">
        {/* Render edges first (behind nodes) */}
        {allNodes.map(node => renderEdges(node))}
        
        {/* Render nodes */}
        {allNodes.map(node => renderNode(node))}
      </svg>
    </div>
  );
}
