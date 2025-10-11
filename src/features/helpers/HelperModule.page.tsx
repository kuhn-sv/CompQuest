import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { helperModules } from './registry';
import { TaskContainer } from '../../shared/components';

const HelperModulePage: React.FC = () => {
  const { module } = useParams<{ module: string }>();
  if (!module) return <Navigate to="/dashboard" replace />;
  const config = helperModules[module];
  if (!config) return <Navigate to="/dashboard" replace />;

  const Component = config.component;

  return (
    <TaskContainer title={config.title} description={config.description}>
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
