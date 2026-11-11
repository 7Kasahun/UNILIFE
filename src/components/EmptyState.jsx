import React from 'react';
import { Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-lightBlue/60 text-brand-blue flex items-center justify-center mb-4 shadow-sm">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
