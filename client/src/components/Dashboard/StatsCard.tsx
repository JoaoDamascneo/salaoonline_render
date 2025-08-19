import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}

const colorClasses = {
  blue: "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  green: "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600",
  purple: "border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600",
  orange: "border-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-600",
};

export function StatsCard({ title, value, subtitle, icon, color }: StatsCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-l-4 ${colorClasses[color].split(' ')[0]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-green-600">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color].split(' ').slice(1).join(' ')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
