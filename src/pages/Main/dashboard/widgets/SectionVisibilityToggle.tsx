type SectionVisibilityToggleProps = {
  isVisible: boolean;
  label: string;
  onToggle: () => void;
};

const SectionVisibilityToggle = ({
  isVisible,
  label,
  onToggle,
}: SectionVisibilityToggleProps) => {
  return (
    <button aria-pressed={isVisible} onClick={onToggle} type="button">
      {label}
    </button>
  );
};

export default SectionVisibilityToggle;
