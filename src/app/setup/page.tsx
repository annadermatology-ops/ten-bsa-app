'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { SetupStepper } from './components/SetupStepper';
import { StepNavigation } from './components/StepNavigation';
import { StepOverview } from './components/StepOverview';
import { StepForkClone } from './components/StepForkClone';
import { StepCreateSupabase } from './components/StepCreateSupabase';
import { StepMigrations } from './components/StepMigrations';
import { StepCustomiseSites } from './components/StepCustomiseSites';
import { StepCreateAdmin } from './components/StepCreateAdmin';
import { StepEnvironment } from './components/StepEnvironment';
import { StepDeploy } from './components/StepDeploy';
import { StepFirstLogin } from './components/StepFirstLogin';

const TOTAL_STEPS = 9;

const STEP_COMPONENTS = [
  StepOverview,
  StepForkClone,
  StepCreateSupabase,
  StepMigrations,
  StepCustomiseSites,
  StepCreateAdmin,
  StepEnvironment,
  StepDeploy,
  StepFirstLogin,
];

export default function SetupPage() {
  const t = useTranslations('setup');
  const [currentStep, setCurrentStep] = useState(0);

  const StepComponent = STEP_COMPONENTS[currentStep];

  const goToStep = (step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <header className="bg-white border-b border-[#d0d0c8] px-4 py-3 flex items-center justify-between">
        <Link
          href="/login"
          className="text-xs text-[#888] hover:text-[#c95a8a] transition-colors"
        >
          {t('backToLogin')}
        </Link>
        <LanguageToggle />
      </header>

      <div className="max-w-3xl mx-auto p-4 pb-12">
        {/* Title */}
        <h1 className="text-lg font-bold text-[#1a1a1a] mb-1">{t('title')}</h1>
        <p className="text-xs text-[#888] mb-6">{t('subtitle')}</p>

        {/* Stepper */}
        <SetupStepper
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onStepClick={goToStep}
        />

        {/* Step content */}
        <div className="mt-6 bg-white rounded-xl border border-[#d0d0c8] shadow-sm p-6">
          <StepComponent />
        </div>

        {/* Navigation */}
        <StepNavigation
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onPrevious={() => goToStep(currentStep - 1)}
          onNext={() => goToStep(currentStep + 1)}
        />
      </div>
    </div>
  );
}
