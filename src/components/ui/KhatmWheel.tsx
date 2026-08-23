import React from 'react';

interface KhatmWheelProps {
  completedJuz: number[]; // Array of completed Juz numbers (1-30)
  size?: number;
}

export function KhatmWheel({ completedJuz, size = 240 }: KhatmWheelProps) {
  const TOTAL_JUZ = 30;
  const radius = 90;
  const center = 100;
  const strokeWidth = 12;
  const gapAngle = 2; // degrees gap between segments

  const circumference = 2 * Math.PI * radius;
  // 360 / 30 = 12 degrees per segment total
  // Segment arc length based on degrees: (12 - gapAngle) / 360 * circumference
  const segmentLength = ((12 - gapAngle) / 360) * circumference;
  // Use circumference as the gap in the dasharray to guarantee it doesn't wrap around and draw a tail
  const dashArray = `${segmentLength} ${circumference}`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full -rotate-90" // Start at 12 o'clock
      >
        {Array.from({ length: TOTAL_JUZ }).map((_, index) => {
          const juzNumber = index + 1;
          const isCompleted = completedJuz.includes(juzNumber);
          const rotation = index * 12; // 360 / 30 = 12 degrees

          return (
            <circle
              key={juzNumber}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={isCompleted ? 'var(--color-accent)' : 'var(--color-card)'}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              className="transition-all duration-500 ease-in-out"
              style={{
                transformOrigin: '100px 100px',
                transform: `rotate(${rotation + gapAngle / 2}deg)`,
              }}
            />
          );
        })}
      </svg>
      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center text-ink font-heading mt-2">
        <span className="text-4xl">{completedJuz.length}/30</span>
        <span className="text-sm font-sans font-medium text-muted mt-1">juz completed</span>
      </div>
    </div>
  );
}
