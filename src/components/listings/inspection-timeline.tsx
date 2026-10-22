import { Check } from 'lucide-react';
import { timelineSteps, type InspectionStage } from '@/lib/inspection-timeline';

/** Read-only progress list. The server decides the stage; this only shows it. */
export function InspectionTimeline({ stage }: { stage: InspectionStage }) {
  return (
    <ol className="timeline" aria-label="Inspection progress">
      {timelineSteps(stage).map((step) => (
        <li
          key={step.key}
          className={`timeline__step timeline__step--${step.state}`}
          aria-current={step.state === 'current' ? 'step' : undefined}
        >
          <span className="timeline__dot">{step.state === 'done' && <Check size={12} />}</span>
          <strong>{step.label}</strong>
          {step.state === 'current' && <span className="timeline__help">{step.help}</span>}
        </li>
      ))}
    </ol>
  );
}
