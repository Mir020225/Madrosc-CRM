import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, className = '' }) => {
  return (
    <div className={`card-base p-5 flex items-center gap-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${className}`}>
      <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <i className={`fas ${icon} text-xl ${color}`}></i>
      </div>
      <div>
        <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;