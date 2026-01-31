'use client';

interface ConceptCardProps {
  title: string;
  children: React.ReactNode;
  type?: 'definition' | 'example' | 'warning' | 'tip';
}

const typeStyles = {
  definition: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: '📘',
    titleColor: 'text-blue-800 dark:text-blue-200',
  },
  example: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: '💡',
    titleColor: 'text-green-800 dark:text-green-200',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: '⚠️',
    titleColor: 'text-amber-800 dark:text-amber-200',
  },
  tip: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: '✨',
    titleColor: 'text-purple-800 dark:text-purple-200',
  },
};

export default function ConceptCard({ title, children, type = 'definition' }: ConceptCardProps) {
  const styles = typeStyles[type];

  return (
    <div className={`rounded-lg border-2 ${styles.border} ${styles.bg} p-6 my-6`}>
      <div className={`flex items-center gap-2 mb-3 ${styles.titleColor}`}>
        <span className="text-xl">{styles.icon}</span>
        <h4 className="font-bold text-lg">{title}</h4>
      </div>
      <div className="text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
}
