import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { TaskContainer } from '../../shared/components';
import { NUMBER_REPRESENTATION_HELPERS } from '../dashboard/components/constants/numberRepresentationHelpers';
import { MICROPROCESSOR_HELPERS } from '../dashboard/components/constants/microprocessorHelpers';

// Helper Components
import Befehlhelfer from './befehlhelfer/Befehlhelfer.component';
import Potenzrechner from './potenzrechner/Potenzrechner.component';
import Umrechnungshelfer from './umrechnungshelfer/Umrechnungshelfer.component';
import Uebertragshelfer from './uebertragshelfer/Uebertragshelfer.component';
import { SubTaskComponentProps } from '../tasks/practiceTaskOne/interfaces';

// Component Mapping
const HELPER_COMPONENTS: Record<string, React.ComponentType<SubTaskComponentProps>> = {
  'befehlhelfer': Befehlhelfer,
  'potenzrechner': Potenzrechner,
  'umrechnungshelfer': Umrechnungshelfer,
  'uebertragshelfer': Uebertragshelfer,
  'helper-potenzrechner': Potenzrechner,
  'helper-umrechnungshelfer': Umrechnungshelfer,
  'helper-uebertragshelfer': Uebertragshelfer,
};

const HelperModulePage: React.FC = () => {
  const { module } = useParams<{ module: string }>();

  // Find metadata from the constant lists
  const metadata = useMemo(() => {
    if (!module) return null;
    const allHelpers = [...NUMBER_REPRESENTATION_HELPERS, ...MICROPROCESSOR_HELPERS];
    // Check if id matches module (slug) OR if path ends with module
    return allHelpers.find(h => h.id === module || h.path.endsWith(`/${module}`));
  }, [module]);

  if (!module) return <Navigate to="/dashboard" replace />;
  
  // Resolve component
  // Try direct match or fallback to metadata id
  const Component = HELPER_COMPONENTS[module] || (metadata ? HELPER_COMPONENTS[metadata.id] : null);

  if (!Component) return <Navigate to="/dashboard" replace />;

  return (
    <TaskContainer
      title={metadata?.title || module}
      description={metadata?.description || ''}
      forceShowFooter
      autoStartTimer>
      {({ onControlsChange, onHudChange, onSummaryChange }) => (
        <Component
          onControlsChange={onControlsChange}
          onHudChange={onHudChange}
          onSummaryChange={onSummaryChange}
        />
      )}
    </TaskContainer>
  );
};

export default HelperModulePage;
