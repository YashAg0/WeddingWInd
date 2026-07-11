"use client";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-white border border-warm-200/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="space-y-1 border-b border-warm-100 pb-4">
        <h3 className="font-display font-bold text-lg text-charcoal-900">{title}</h3>
        <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
