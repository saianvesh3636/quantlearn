'use client';

interface ConceptCardProps {
  title: string;
  children: React.ReactNode;
  type?: 'definition' | 'example' | 'warning' | 'tip';
}

const typeStyles = {
  definition: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    label: 'Definition',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  example: {
    border: 'border-l-green-500',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    label: 'Example',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  warning: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    label: 'Warning',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  tip: {
    border: 'border-l-violet-500',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    label: 'Tip',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
};

export default function ConceptCard({ title, children, type = 'definition' }: ConceptCardProps) {
  const styles = typeStyles[type];

  return (
    <div className={`rounded-lg border-l-4 ${styles.border} bg-gray-50/50 dark:bg-gray-800/30 p-4 my-6`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-full ${styles.iconBg} flex items-center justify-center ${styles.iconColor}`}>
          {styles.icon}
        </div>
        <span className={`text-xs font-medium ${styles.iconColor} uppercase tracking-wide`}>
          {styles.label}
        </span>
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 ml-8">{title}</h4>
      <div className="text-gray-700 dark:text-gray-300 ml-8 font-serif leading-relaxed">
        {children}
      </div>
    </div>
  );
}
