const colors = {
  beginner: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    label: "Beginner",
  },
  intermediate: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    label: "Intermediate",
  },
  advanced: {
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/20",
    label: "Advanced",
  },
};

export function DifficultyBadge({
  difficulty,
}: {
  difficulty: string;
}) {
  const config = colors[difficulty as keyof typeof colors] || colors.intermediate;

  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}

