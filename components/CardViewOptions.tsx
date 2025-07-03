"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, Grid2X2, Grid3X3, List, Columns } from 'lucide-react';
import { useCardModal, CardVisualizationType } from '@/contexts/CardModalContext';

interface CardViewOptionsProps {
  className?: string;
  size?: 'default' | 'sm';
}

const CardViewOptions: React.FC<CardViewOptionsProps> = ({ 
  className = '',
  size = 'default'
}) => {
  const { visualizationType, setVisualizationType } = useCardModal();

  const buttonSize = size === 'sm' ? 'h-7 w-7 p-1' : 'h-9 w-9 p-2';

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        variant={visualizationType === 'list' ? 'default' : 'outline'}
        size="icon"
        className={`${buttonSize} ${visualizationType === 'list' 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
        onClick={() => setVisualizationType('list')}
        title="Visualização em lista"
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        variant={visualizationType === 'grid' ? 'default' : 'outline'}
        size="icon"
        className={`${buttonSize} ${visualizationType === 'grid' 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
        onClick={() => setVisualizationType('grid')}
        title="Visualização em grade normal"
      >
        <Grid2X2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant={visualizationType === 'details' ? 'default' : 'outline'}
        size="icon"
        className={`${buttonSize} ${visualizationType === 'details' 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
        onClick={() => setVisualizationType('details')}
        title="Visualização em detalhes"
      >
        <Columns className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CardViewOptions;
