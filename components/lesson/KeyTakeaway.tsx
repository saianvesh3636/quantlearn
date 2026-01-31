'use client';

interface KeyTakeawayProps {
  children: React.ReactNode;
}

export default function KeyTakeaway({ children }: KeyTakeawayProps) {
  return (
    <div className="my-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="font-bold mb-1">Key Takeaway</p>
          <div className="text-emerald-50">{children}</div>
        </div>
      </div>
    </div>
  );
}
