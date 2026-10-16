export function StatusTimeline({
  stages,
  current,
}: {
  stages: readonly string[];
  current: string;
}) {
  return (
    <ol className="status-timeline" aria-label="Inspection progress">
      {stages.map((stage, index) => (
        <li key={stage} aria-current={current === stage ? 'step' : undefined}>
          <strong>{stage.replaceAll('_', ' ')}</strong>
          <span>
            {current === stage
              ? 'Current stage'
              : index < stages.indexOf(current)
                ? 'Earlier stage in this scenario'
                : 'Later stage in this scenario'}
          </span>
        </li>
      ))}
    </ol>
  );
}
