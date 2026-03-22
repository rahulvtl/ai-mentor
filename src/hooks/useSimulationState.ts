import { useState, useCallback, useMemo } from 'react';

export interface GridPos {
  x: number;
  y: number;
}

export const useSimulationState = (gridSize: number = 10) => {
  // Store active cells as a Set of stringified coordinates "x,y"
  const [activeCells, setActiveCells] = useState<Set<string>>(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<boolean>(true); // true = adding, false = removing

  const getCellKey = (x: number, y: number) => `${x},${y}`;

  const toggleCell = useCallback((x: number, y: number, forceMode?: boolean) => {
    setActiveCells(prev => {
      const newSet = new Set(prev);
      const key = getCellKey(x, y);
      
      const mode = forceMode !== undefined ? forceMode : !prev.has(key);
      
      if (mode) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
      return newSet;
    });
  }, []);

  const handlePointerDown = (x: number, y: number) => {
    setIsDrawing(true);
    const key = getCellKey(x, y);
    const mode = !activeCells.has(key);
    setDrawMode(mode);
    toggleCell(x, y, mode);
  };

  const handlePointerEnter = (x: number, y: number) => {
    if (isDrawing) {
      toggleCell(x, y, drawMode);
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const clearGrid = () => setActiveCells(new Set());

  // Calculate W, H, Area
  const stats = useMemo(() => {
    if (activeCells.size === 0) return { width: 0, height: 0, area: 0 };

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    activeCells.forEach(key => {
      const [x, y] = key.split(',').map(Number);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const area = activeCells.size; // true area based on blocks placed

    return { width, height, area };
  }, [activeCells]);

  return {
    gridSize,
    activeCells,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    clearGrid,
    stats,
    getCellKey
  };
};
