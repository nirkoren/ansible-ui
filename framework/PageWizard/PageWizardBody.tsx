import { PageSection } from '@patternfly/react-core';
import { useCallback, useEffect } from 'react';
import { useFormState } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PageForm } from '../PageForm/PageForm';
import { PageWizardFooter } from './PageWizardFooter';
import { usePageWizard, isStepVisible } from './PageWizardProvider';
import type { PageWizardBody } from './types';

export function PageWizardBody<T>({
  onCancel,
  onSubmit,
  disableGrid,
  errorAdapter,
  isVertical,
  singleColumn,
}: PageWizardBody<T>) {
  const navigate = useNavigate();
  const {
    activeStep,
    allSteps,
    setActiveStep,
    setStepData,
    setVisibleSteps,
    setWizardData,
    stepData,
    visibleSteps,
    wizardData,
  } = usePageWizard();

  const onClose = useCallback((): void => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  }, [navigate, onCancel]);

  const onNext = useCallback(
    (formData: object) => {
      const filteredSteps = allSteps.filter((step) =>
        isStepVisible(step, { ...wizardData, ...formData })
      );

      if (activeStep !== null) {
        const isLastStep = activeStep?.id === filteredSteps[filteredSteps.length - 1]?.id;
        if (isLastStep) {
          return onSubmit(wizardData as T);
        }

        const activeStepIndex = filteredSteps.findIndex((step) => step.id === activeStep?.id);
        const nextStep = filteredSteps[activeStepIndex + 1];

        setWizardData((prev: object) => ({ ...prev, ...formData }));
        setStepData((prev) => ({ ...prev, [activeStep?.id]: formData }));
        setVisibleSteps(filteredSteps);
        setActiveStep(nextStep);
      }
      return Promise.resolve();
    },
    [
      activeStep,
      allSteps,
      onSubmit,
      setActiveStep,
      setStepData,
      setVisibleSteps,
      setWizardData,
      wizardData,
    ]
  );

  const onBack = useCallback(() => {
    const activeStepIndex = visibleSteps.findIndex((step) => step.id === activeStep?.id);
    const previousStep = visibleSteps[activeStepIndex - 1];
    setActiveStep(previousStep);
  }, [activeStep, visibleSteps, setActiveStep]);

  return (
    <>
      {activeStep !== null &&
        ('inputs' in activeStep ? (
          <PageForm
            key={activeStep.id}
            onSubmit={onNext}
            footer={<PageWizardFooter onBack={onBack} onCancel={onClose} />}
            defaultValue={stepData[activeStep.id]}
            errorAdapter={errorAdapter}
            disableGrid={disableGrid}
            isVertical={isVertical}
            singleColumn={singleColumn}
          >
            <StepErrors />
            {activeStep.inputs}
          </PageForm>
        ) : (
          <div
            data-cy={`wizard-section-${activeStep.id}`}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <PageSection variant="light" isFilled hasOverflowScroll>
              {activeStep?.element}
            </PageSection>
            <PageWizardFooter onNext={() => void onNext({})} onBack={onBack} onCancel={onClose} />
          </div>
        ))}
    </>
  );
}

function StepErrors() {
  const { activeStep, setStepError } = usePageWizard();
  const { errors } = useFormState();
  const formErrors = JSON.stringify(errors);

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      setStepError({});
    } else if (activeStep) {
      setStepError({ [activeStep.id]: errors });
    }
  }, [errors, activeStep, setStepError, formErrors]);

  return null;
}
