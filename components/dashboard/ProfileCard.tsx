"use client";

import { useAuth } from "@/context/AuthContext";
import { MapPin, Globe, CheckCircle2 } from "lucide-react";

interface ProfileCardProps {
  onEditToggle?: () => void;
  isEditing?: boolean;
}

export default function ProfileCard({ onEditToggle, isEditing }: ProfileCardProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white border border-warm-200/50 rounded-3xl overflow-hidden shadow-sm">
      
      {/* Cover Banner Photo */}
      <div className="h-32 sm:h-40 bg-gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      </div>

      {/* Profile Details Area */}
      <div className="px-6 pb-6 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          
          {/* Avatar frame */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white bg-warm-100 flex-shrink-0 shadow-md relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user?.avatar || "https://i.pravatar.cc/80?img=5"}
              alt={user?.name || "Avatar"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1 mb-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-lg sm:text-xl text-charcoal-900 leading-none">
                {user?.name}
              </h3>
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            </div>
            
            <p className="text-xs text-charcoal-400 font-semibold">{user?.email}</p>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal-500 font-medium pt-1">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-maroon-600" />
                {user?.country || "United States"}
              </span>
              <span className="text-charcoal-300">|</span>
              <span className="inline-block text-[0.5625rem] font-bold uppercase tracking-wider bg-maroon-50 text-[var(--color-brand-primary)] px-2 py-0.5 rounded border border-maroon-100/50">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {onEditToggle && (
          <button
            onClick={onEditToggle}
            className="btn btn-outline btn-sm shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </button>
        )}
      </div>

      {user?.bio && (
        <div className="px-6 pb-6 border-t border-warm-100/60 pt-4">
          <h4 className="text-[0.6875rem] font-bold text-charcoal-400 uppercase tracking-widest mb-1.5">Bio</h4>
          <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed">{user.bio}</p>
        </div>
      )}

    </div>
  );
}
export { CheckCircle2 };
