'use client';

import { useTranslations } from 'next-intl';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function StepNavigation({ currentStep, totalSteps, onPrevious, onNext }: StepNavigationProps) {
  const t = useTranslations('setup');
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between mt-6">
      {currentStep > 0 ? (
        <button
          onClick={onPrevious}
          className="px-4 py-2 rounded-lg border border-[#d0d0c8] text-sm text-[#555]
                     hover:bg-[#f0f0e8] transition-colors cursor-pointer"
        >
          {t('previous')}
        </button>
      ) : (
        <div />
      )}
      {!isLast && (
        <button
          onClick={onNext}
          className="px-4 py-2 rounded-lg bg-[#c95a8a] text-white text-sm font-semibold
                     hover:bg-[#b44d7a] transition-colors cursor-pointer"
        >
          {t('next')}
        </button>
      )}
    </div>
  );
}
