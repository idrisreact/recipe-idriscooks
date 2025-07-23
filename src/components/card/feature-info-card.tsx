import { ReactNode } from "react";

interface InfoItem {
  icon: ReactNode;
  label: string;
  value: string;
}

interface FeatureInfoCardProps {
  items: InfoItem[];
}

export default function FeatureInfoCard({ items }: FeatureInfoCardProps) {
  return (
    <div className="w-64 h-80 rounded-2xl bg-white shadow-md flex flex-col justify-center gap-6 p-6">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <span className="text-yellow-500 text-2xl">{item.icon}</span>
          <div>
            <div className="font-semibold text-gray-800">{item.label}</div>
            <div className="text-gray-500 text-sm">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
