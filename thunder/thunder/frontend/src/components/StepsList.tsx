import React, { useEffect } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Step } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  // Log steps to diagnose duplicate IDs
  useEffect(() => {
    console.log('StepsList steps:', steps);
    // Check for duplicate IDs
    const ids = steps.map((step) => step.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      console.warn('Duplicate step IDs detected:', ids);
    }
  }, [steps]);

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-100">Build Steps</h2>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            // Use step.id as key, fallback to composite key if ID is not unique
            key={step.id ?? `${index}-${step.title}`}
            className={`p-1 rounded-lg cursor-pointer transition-colors ${
              currentStep === step.id
                ? 'bg-gray-800 border border-gray-700'
                : 'hover:bg-gray-800'
            }`}
            onClick={() => onStepClick(step.id)}
          >
            <div className="flex items-center gap-2">
              {step.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : step.status === 'in-progress' ? (
                <Clock className="w-5 h-5 text-blue-400" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600" />
              )}
              <h3 className="font-medium text-gray-100">{step.title}</h3>
            </div>
            <p className="text-sm text-gray-400 mt-2">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}