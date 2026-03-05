'use client';

import { useTranslations } from 'next-intl';

const STEP_KEYS = [
  'overview', 'forkClone', 'supabase', 'migrations', 'sites',
  'adminUser', 'envConfig', 'deploy', 'firstLogin',
] as const;

interface SetupStepperProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

export function SetupStepper({ currentStep, totalSteps, onStepClick }: SetupStepperProps) {
  const t = useTranslations('setup');

  return (
    <>
      {/* Mobile: compact step counter + progress bar */}
      <div className="md:hidden">
        <div className="text-xs text-[#888] mb-2 text-center">
          {t('stepOf', { current: currentStep + 1, total: totalSteps })}
          {' — '}
          <span className="font-medium text-[#1a1a1a]">
            {t(`stepLabels.${STEP_KEYS[currentStep]}`)}
          </span>
        </div>
        <div className="h-1.5 bg-[#e8e8e0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#c95a8a] rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: full stepper with circles */}
      <div className="hidden md:flex items-center justify-between">
        {STEP_KEYS.map((key, i) => (
          <div key={key} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => onStepClick(i)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold
                  transition-colors ${
                  i < currentStep
                    ? 'bg-[#c95a8a] text-white'
                    : i === currentStep
                    ? 'bg-[#c95a8a] text-white ring-2 ring-[#c95a8a]/30'
                    : 'bg-white border border-[#d0d0c8] text-[#888] group-hover:border-[#c95a8a]/50'
                }`}
              >
                {i < currentStep ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[8px] mt-1 whitespace-nowrap ${
                  i === currentStep ? 'text-[#c95a8a] font-semibold' : 'text-[#999]'
                }`}
              >
                {t(`stepLabels.${key}`)}
              </span>
            </button>
            {i < totalSteps - 1 && (
              <div
                className={`flex-1 h-px mx-1 mt-[-14px] ${
                  i < currentStep ? 'bg-[#c95a8a]' : 'bg-[#d0d0c8]'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
