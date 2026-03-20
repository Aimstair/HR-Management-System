import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BarChart3, Table2 } from 'lucide-react';
import { Button } from '../../../../../../../components/ui/button';

interface ViewModeHeaderToggleProps {
  mode: 'table' | 'graph';
  onChangeMode: (mode: 'table' | 'graph') => void;
}

const ViewModeHeaderToggle: React.FC<ViewModeHeaderToggleProps> = ({ mode, onChangeMode }) => {
  const [headerActionsEl, setHeaderActionsEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHeaderActionsEl(document.getElementById('header-actions'));
  }, []);

  if (!headerActionsEl) {
    return null;
  }

  return createPortal(
    <div className="flex items-center gap-2">
      <Button variant={mode === 'table' ? 'default' : 'outline'} onClick={() => onChangeMode('table')}>
        <Table2 className="h-4 w-4" />
        Table Mode
      </Button>
      <Button variant={mode === 'graph' ? 'default' : 'outline'} onClick={() => onChangeMode('graph')}>
        <BarChart3 className="h-4 w-4" />
        Graph Mode
      </Button>
    </div>,
    headerActionsEl,
  );
};

export default ViewModeHeaderToggle;
