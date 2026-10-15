// Lucide icons for section types (the names used in SECTION_TYPES).
import { BadgeCheck, BookOpen, Briefcase, FileText, GraduationCap, Heart, Languages, Newspaper, PenLine, Rocket, Sparkles, Trophy, UserRound, Users, Wrench } from "lucide-preact";
import { SECTION_TYPES } from "./data.js";

const SECTION_ICONS = { BadgeCheck, BookOpen, Briefcase, FileText, GraduationCap, Heart, Languages, Newspaper, PenLine, Rocket, Sparkles, Trophy, UserRound, Users, Wrench };

export function SectionIcon({ type, size = 18 }) {
  const Icon = SECTION_ICONS[SECTION_TYPES[type]?.icon] ?? Sparkles;
  return <Icon size={size} aria-hidden="true" />;
}
