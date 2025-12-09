import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function GraphCanvas({
  graph,
  mode,
  startNode,
  goalNode,
  currentNode,
  openList,
  closedList,
  path,
  onAddNode,
  onSelectNode,
  onDragNode,
  selectedForEdge
}) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    graph.getAllEdges().forEach(edge => {
      const fromNode = graph.getNode(edge.from);
      const toNode = graph.getNode(edge.to);
      
      if (!fromNode || !toNode) return;

      const isInPath = path && path.length > 0 && 
        path.includes(edge.from) && path.includes(edge.to) &&
        Math.abs(path.indexOf(edge.from) - path.indexOf(edge.to)) === 1;

      // Calculate edge endpoints (stopping at node radius)
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const angle = Math.atan2(dy, dx);
      const nodeRadius = 25;
      
      const startX = fromNode.x + nodeRadius * Math.cos(angle);
      const startY = fromNode.y + nodeRadius * Math.sin(angle);
      const endX = toNode.x - nodeRadius * Math.cos(angle);
      const endY = toNode.y - nodeRadius * Math.sin(angle);

      // Draw line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = isInPath ? '#fbbf24' : '#64748b';
      ctx.lineWidth = isInPath ? 4 : 2;
      ctx.stroke();

      // Draw arrowhead
      const arrowSize = 12;
      const arrowAngle = Math.PI / 6; // 30 degrees
      
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle - arrowAngle),
        endY - arrowSize * Math.sin(angle - arrowAngle)
      );
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + arrowAngle),
        endY - arrowSize * Math.sin(angle + arrowAngle)
      );
      ctx.closePath();
      ctx.fillStyle = isInPath ? '#fbbf24' : '#64748b';
      ctx.fill();

      // Draw weight at midpoint
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(midX - 12, midY - 10, 24, 20);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(midX - 12, midY - 10, 24, 20);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.weight.toFixed(1), midX, midY);
    });

    // Draw nodes
    graph.getAllNodes().forEach(node => {
      const isStart = node.id === startNode;
      const isGoal = node.id === goalNode;
      const isCurrent = node.id === currentNode;
      const isInOpen = openList?.some(n => n.nodeId === node.id);
      const isInClosed = closedList?.includes(node.id);
      const isSelected = node.id === selectedForEdge;
      const isHovered = node.id === hoveredNode;
      const isInPath = path?.includes(node.id);

      // Node color logic
      let fillColor = '#475569';
      if (isStart) fillColor = '#10b981';
      else if (isGoal) fillColor = '#ef4444';
      else if (isCurrent) fillColor = '#3b82f6';
      else if (isInPath) fillColor = '#fbbf24';
      else if (isInClosed) fillColor = '#6b7280';
      else if (isInOpen) fillColor = '#8b5cf6';

      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      
      if (isSelected || isHovered) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
      
      // Draw heuristic value below node
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`h:${node.heuristic || 0}`, node.x, node.y + 35);
    });

  }, [graph, startNode, goalNode, currentNode, openList, closedList, path, selectedForEdge, hoveredNode]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a node
    const clickedNode = graph.getAllNodes().find(node => {
      const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      return dist <= 25;
    });

    if (clickedNode) {
      onSelectNode(clickedNode.id);
    } else if (mode === 'add-node') {
      onAddNode(x, y);
    }
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hoveredNode = graph.getAllNodes().find(node => {
      const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      return dist <= 25;
    });

    setHoveredNode(hoveredNode?.id || null);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="bg-slate-900 rounded-lg cursor-crosshair border-2 border-slate-700"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-slate-800/90 rounded-lg p-3 text-xs border border-slate-700">
        <div className="font-bold text-gray-200 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-300">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-300">Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-gray-300">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-gray-300">Open List</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            <span className="text-gray-300">Closed List</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-gray-300">Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}
