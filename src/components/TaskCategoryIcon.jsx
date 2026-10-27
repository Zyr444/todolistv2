import React from 'react';
import { 
  Dumbbell, 
  Waves, 
  BookOpen, 
  Laptop, 
  GraduationCap, 
  Activity, 
  Flame, 
  CheckCircle2, 
  Tag 
} from 'lucide-react';

/**
 * Returns dynamic contextual icon based on Category and Title keywords
 */
export const getTaskIconInfo = (category = '', title = '') => {
  const normTitle = (title || '').toLowerCase();
  const normCat = (category || '').toLowerCase();

  // Olahraga Category
  if (normCat.includes('olahraga') || normCat.includes('sport') || normCat.includes('fitness')) {
    if (normTitle.includes('jogging') || normTitle.includes('lari') || normTitle.includes('run')) {
      return {
        icon: Activity,
        label: 'Jogging / Lari',
        bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    }
    if (normTitle.includes('gym') || normTitle.includes('workout') || normTitle.includes('angkat')) {
      return {
        icon: Dumbbell,
        label: 'Gym & Fitness',
        bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
    }
    if (normTitle.includes('renang') || normTitle.includes('swim') || normTitle.includes('kolam')) {
      return {
        icon: Waves,
        label: 'Renang',
        bgColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
      };
    }
    return {
      icon: Flame,
      label: 'Olahraga',
      bgColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    };
  }

  // Belajar Category
  if (normCat.includes('belajar') || normCat.includes('study') || normCat.includes('education') || normCat.includes('kuliah')) {
    if (normTitle.includes('laptop') || normTitle.includes('coding') || normTitle.includes('code') || normTitle.includes('react') || normTitle.includes('programming')) {
      return {
        icon: Laptop,
        label: 'Belajar (Digital/Tech)',
        bgColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      };
    }
    if (normTitle.includes('buku') || normTitle.includes('baca') || normTitle.includes('reading') || normTitle.includes('teori')) {
      return {
        icon: BookOpen,
        label: 'Belajar (Buku/Bacaan)',
        bgColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      };
    }
    return {
      icon: GraduationCap,
      label: 'Belajar',
      bgColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    };
  }

  // General fallback
  return {
    icon: CheckCircle2,
    label: category || 'General',
    bgColor: 'bg-neutral-800 text-neutral-400 border-neutral-700/50'
  };
};

export default function TaskCategoryIcon({ category, title, size = 18, showBadge = false }) {
  const { icon: IconComponent, label, bgColor } = getTaskIconInfo(category, title);

  if (showBadge) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bgColor}`}>
        <IconComponent size={size} className="shrink-0" />
        <span>{category || 'General'}</span>
      </span>
    );
  }

  return (
    <div className={`p-2 rounded-lg border ${bgColor}`} title={label}>
      <IconComponent size={size} />
    </div>
  );
}
