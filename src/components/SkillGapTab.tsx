import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Sparkles, 
  CheckCircle,
  CheckCircle2,
  Code,
  Layers,
  Wrench,
  FolderGit,
  Briefcase,
  Award,
  Users,
  Filter,
  Download,
  Clock,
  DollarSign,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { generateSkillGapPdf } from '../lib/pdfGenerator';

interface SkillGapTabProps {
  roadmap: any;
  onNavigate?: (tab: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Gaps', icon: Filter },
  { id: 'technical', label: 'Tech Skills', icon: Code, match: 'Technical Skill' },
  { id: 'frameworks', label: 'Frameworks', icon: Layers, match: 'Framework' },
  { id: 'tools', label: 'Tools', icon: Wrench, match: 'Tool' },
  { id: 'projects', label: 'Projects', icon: FolderGit, match: 'Project' },
  { id: 'experience', label: 'Experience', icon: Briefcase, match: 'Experience' },
  { id: 'certifications', label: 'Certifications', icon: Award, match: 'Certification' },
  { id: 'softskills', label: 'Soft Skills', icon: Users, match: 'Soft Skill' }
];

export function SkillGapTab({ roadmap, onNavigate }: SkillGapTabProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [completedGaps, setCompletedGaps] = useState<Record<string, boolean>>({});

  if (!roadmap) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center glass rounded-[3rem] p-12 border-none shadow-xl">
        <Zap className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
        <h2 className="text-3xl font-black mb-4 tracking-tight">No Resume Analyzed</h2>
        <p className="text-muted-foreground mb-8 italic">Choose a target role and upload your resume to inspect your skill gaps.</p>
        {onNavigate && (
          <Button size="lg" className="h-14 rounded-2xl bg-primary text-white font-bold px-10" onClick={() => onNavigate('upload')}>
            Upload Resume
          </Button>
        )}
      </div>
    );
  }

  // Retrieve verified strengths & missing_skills dynamically
  const verifiedStrengths = roadmap.skill_gap_report?.verified_strengths || 
    (roadmap.skill_gap_report?.matched_skills || []).map((s: string) => ({
      skill: s,
      category: 'Technical Skill',
      proficiency: 'Intermediate',
      evidence: 'Directly verified from candidate profile & experience'
    }));

  const matchedSkillsList: string[] = (roadmap.skill_gap_report?.matched_skills && roadmap.skill_gap_report.matched_skills.length > 0)
    ? roadmap.skill_gap_report.matched_skills
    : verifiedStrengths.map((v: any) => v.skill || v);

  const missingSkills = roadmap.skill_gap_report?.missing_skills || [];

  const toggleComplete = (idx: number) => {
    setCompletedGaps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Filter missing skills based on current active filter
  const filteredSkills = missingSkills.filter((item: any) => {
    if (activeCategory === 'all') return true;
    const catObj = CATEGORIES.find(c => c.id === activeCategory);
    if (!catObj || !catObj.match) return true;
    return item.category === catObj.match;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'low':
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical Skill': return <Code className="w-4 h-4" />;
      case 'Framework': return <Layers className="w-4 h-4" />;
      case 'Tool': return <Wrench className="w-4 h-4" />;
      case 'Project': return <FolderGit className="w-4 h-4" />;
      case 'Experience': return <Briefcase className="w-4 h-4" />;
      case 'Certification': return <Award className="w-4 h-4" />;
      case 'Soft Skill': return <Users className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-rose-500/10 blur-[120px] -z-10 rounded-full" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest">
          <ShieldAlert className="w-4 h-4 animate-pulse text-rose-500" />
          Enterprise Competency & Gap Matrix
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
          Skill Gap <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-amber-500">Analysis Matrix</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed italic px-4">
          Rigorous comparison of your current resume assets against 2026 live hiring requisites for the <strong className="text-foreground font-black">"{roadmap.title?.replace("Learning Roadmap for ", "") || "Target Role"}"</strong> career path.
        </p>

        {/* Action Button: Download Skill Gap Audit PDF */}
        <div className="pt-2">
          <Button
            onClick={() => {
              toast.info("Generating Skill Gap Audit (PDF)...");
              generateSkillGapPdf({
                candidateName: "Candidate",
                targetRole: roadmap?.title?.replace("Learning Roadmap for ", "") || "Target Role",
                roadmap
              });
              toast.success("Skill Gap Audit (PDF) downloaded!");
            }}
            className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 px-6 gap-2 shadow-md shadow-rose-500/20 cursor-pointer text-xs sm:text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Skill Gap Audit (PDF)</span>
          </Button>
        </div>
      </div>

      {/* SECTION 1: VERIFIED PROFILE STRENGTHS */}
      <div className="glass p-6 md:p-8 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-foreground">
                1. Verified Profile Strengths
              </h2>
              <p className="text-xs text-muted-foreground">
                Core competencies detected and verified in your uploaded resume matching market requirements
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-black">
            {matchedSkillsList.length} Verified Competencies
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
          {matchedSkillsList.map((skill: string, sIdx: number) => (
            <div 
              key={sIdx}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition-all hover:scale-[1.02]"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{skill}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: HIGH-DEMAND SKILL GAPS TO BRIDGE */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              2. High-Demand Skill Gaps to Bridge
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Critical technologies, architectural patterns, and credentials required to unlock senior compensation tiers
            </p>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3 bg-muted/30 dark:bg-zinc-900/40 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300",
                  isActive 
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105" 
                    : "text-muted-foreground hover:bg-muted dark:hover:bg-zinc-800/50 hover:text-foreground"
                )}
              >
                <IconComp className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* List / Grid Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">
          <AnimatePresence mode="popLayout">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((item: any, idx: number) => {
                const isCompleted = !!completedGaps[idx];
                const currentLvl = item.current_level || (item.priority === 'High' ? 'None' : 'Beginner');
                const targetLvl = item.target_level || 'Production-Grade';
                const estHours = item.estimated_hours || (item.priority === 'High' ? 25 : 15);
                const salaryImpact = item.salary_impact || (item.priority === 'High' ? '+$15k - $25k / +18%' : '+$8k - $12k / +10%');
                const certName = item.certification_name || item.certified_resource;

                return (
                  <motion.div
                    key={item.skill + '-' + idx}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={cn(
                      "glass border-none rounded-[2rem] shadow-md hover:shadow-xl transition-all overflow-hidden h-full flex flex-col justify-between",
                      isCompleted 
                        ? "bg-emerald-500/5 border-emerald-500/10 opacity-75" 
                        : "bg-white/45 dark:bg-black/35"
                    )}>
                      <CardContent className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          {/* Title and Category Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted-foreground text-[10px] font-black uppercase tracking-wider">
                                {getCategoryIcon(item.category)}
                                {item.category}
                              </span>
                              <h3 className={cn(
                                "text-lg font-extrabold tracking-tight text-foreground",
                                isCompleted && "line-through text-muted-foreground"
                              )}>
                                {item.skill}
                              </h3>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                getPriorityColor(item.priority)
                              )}>
                                {item.priority} Priority
                              </span>
                            </div>
                          </div>

                          {/* Progression Level Badges */}
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 text-xs font-bold text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[10px] uppercase font-black">
                              Current: {currentLvl}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] uppercase font-black">
                              Target: {targetLvl}
                            </span>
                          </div>

                          {/* Metrics Chips Row */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
                              <Clock className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                              <span>Est: {estHours} Hours</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                              <DollarSign className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                              <span className="truncate">{salaryImpact}</span>
                            </div>
                          </div>

                          {/* Gap Context Detail */}
                          <div className="space-y-3 text-xs">
                            <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/20">
                              <span className="font-extrabold text-[10px] uppercase text-rose-500 block mb-1">
                                Hiring Friction Reason:
                              </span>
                              <p className="text-muted-foreground leading-relaxed italic">
                                {item.reason}
                              </p>
                            </div>

                            {item.market_demand_trend && (
                              <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                                <TrendingUp className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                                <p className="leading-snug">
                                  <span className="font-bold">Market Demand:</span> {item.market_demand_trend}
                                </p>
                              </div>
                            )}

                            {item.suggested_improvement && (
                              <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10">
                                <span className="font-extrabold text-[10px] uppercase text-primary block mb-1">
                                  Prescribed Hands-on Fix:
                                </span>
                                <p className="text-foreground/95 leading-relaxed font-medium">
                                  {item.suggested_improvement}
                                </p>
                              </div>
                            )}

                            {certName && (
                              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                                    Recommended Industry Credential:
                                  </span>
                                  <p className="font-bold text-foreground text-xs">
                                    {certName}
                                  </p>
                                </div>
                                <Award className="w-5 h-5 text-emerald-500 shrink-0" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tick off Gap */}
                        <div className="pt-4 mt-4 border-t border-zinc-200/40 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {isCompleted ? "Completed & Addressed" : "Target Outstanding"}
                          </span>
                          <Button
                            size="sm"
                            variant={isCompleted ? "secondary" : "outline"}
                            className={cn(
                              "rounded-xl h-9 text-xs font-bold px-4 cursor-pointer",
                              isCompleted ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "border-2"
                            )}
                            onClick={() => toggleComplete(idx)}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5 fill-emerald-500 text-white" />
                                Addressed
                              </>
                            ) : (
                              "Mark Addressed"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center">
                <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h4 className="text-lg font-bold">No items found in this filter category</h4>
                <p className="text-muted-foreground text-xs italic mt-1">
                  Your resume doesn't seem to miss any requirements in this bracket!
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* S-Tier Summary Card */}
      <div className="max-w-3xl mx-auto glass rounded-[2.5rem] border border-rose-500/10 bg-rose-500/5 p-8 text-center space-y-4">
        <Sparkles className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold">Addressing your friction vectors</h3>
        <p className="text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Each verified gap corresponds to actual triggers recruiters prioritize. Address high-priority gaps first using our companion <strong className="text-foreground">Learning Resources</strong> module to fast-track your profile.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          {onNavigate && (
            <Button
              className="rounded-2xl h-11 px-6 font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-md cursor-pointer"
              onClick={() => onNavigate('resources')}
            >
              Explore Learning Channels
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
