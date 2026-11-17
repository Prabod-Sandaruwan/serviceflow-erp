export function MarginCurveSvg() {
  return (
    <div className="mt-6 h-36 w-full">
      <svg
        className="h-full w-full overflow-visible"
        viewBox="0 0 500 120"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d="M 0,95 Q 120,80 250,50 T 460,25 L 460,110 L 0,110 Z"
          fill="url(#marginGrad)"
        />
        <path
          d="M 0,95 Q 120,80 250,50 T 460,25"
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
        />
        <circle cx="460" cy="25" r="4" fill="#6366f1" />
        <path
          d="M 0,105 Q 150,102 300,100 T 460,103"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
}
