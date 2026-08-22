import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  ArrowRight, 
  BookOpen, 
  Code, 
  Lightbulb, 
  Trophy, 
  Target, 
  Calendar,
  Sparkles,
  Zap,
  Copy,
  CheckSquare,
  Square,
  Award,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Sliders,
  Briefcase,
  RotateCcw,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CareerRoadmapTabProps {
  roadmap: any;
  isTemporary?: boolean;
  onClearTemporary?: () => void;
  onNavigate?: (tab: string) => void;
}

export function CareerRoadmapTab({ 
  roadmap, 
  isTemporary = false, 
  onClearTemporary,
  onNavigate 
}: CareerRoadmapTabProps) {
  const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (roadmap) {
      const initial: Record<string, boolean> = {};
      roadmap.sprints?.forEach((sprint: any, sIdx: number) => {
        sprint.weeks?.forEach((week: any, wIdx: number) => {
          week.tasks?.forEach((task: any, tIdx: number) => {
            initial[`${sIdx}-${wIdx}-${tIdx}`] = true;
          });
        });
      });
      setSelectedTasks(initial);
    }
  }, [roadmap]);

  if (!roadmap) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center glass rounded-[3rem] p-12 border-none shadow-xl">
        <Target className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
        <h2 className="text-3xl font-black mb-4 tracking-tight">No Career Roadmap Available</h2>
        <p className="text-muted-foreground mb-8 italic">Upload your resume to generate your personalized career flight path and sprint timeline.</p>
        {onNavigate && (
          <Button size="lg" className="h-14 rounded-2xl bg-primary text-white font-bold px-10" onClick={() => onNavigate('upload')}>
            Upload Resume
          </Button>
        )}
      </div>
    );
  }

  const toggleSelect = (sIdx: number, wIdx: number, tIdx: number) => {
    const key = `${sIdx}-${wIdx}-${tIdx}`;
    setSelectedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAll = (val: boolean) => {
    const updated: Record<string, boolean> = {};
    roadmap.sprints?.forEach((sprint: any, sIdx: number) => {
      sprint.weeks?.forEach((week: any, wIdx: number) => {
        week.tasks?.forEach((task: any, tIdx: number) => {
          updated[`${sIdx}-${wIdx}-${tIdx}`] = val;
        });
      });
    });
    setSelectedTasks(updated);
    toast.success(val ? "All tasks selected!" : "Deselected all tasks.");
  };

  const copyToClipboard = () => {
    let md = `# ${roadmap.title || "My Career Roadmap"}\n\n`;
    let hasSelection = false;

    roadmap.sprints?.forEach((sprint: any, sIdx: number) => {
      let sprintAdded = false;
      sprint.weeks?.forEach((week: any, wIdx: number) => {
        let weekAdded = false;
        week.tasks?.forEach((task: any, tIdx: number) => {
          const key = `${sIdx}-${wIdx}-${tIdx}`;
          if (selectedTasks[key] !== false) {
            hasSelection = true;
            if (!sprintAdded) {
              md += `## SPRINT ${sprint.sprint_number || sIdx + 1}: ${sprint.theme}\n\n`;
              sprintAdded = true;
            }
            if (!weekAdded) {
              md += `### Week ${week.week}: ${week.title}\n\n`;
              weekAdded = true;
            }
            md += `- [ ] **[${task.type.toUpperCase()}]** ${task.title}\n`;
            if (task.platform) md += `  - Platform: ${task.platform}\n`;
            if (task.hours) md += `  - Duration: ${task.hours} hours\n`;
            if (task.tech && task.tech.length > 0) md += `  - Tech: ${task.tech.join(', ')}\n`;
            if (task.details) md += `  - Detail: ${task.details}\n`;
            md += `\n`;
          }
        });
      });
    });

    if (!hasSelection) {
      toast.error("Please select at least one step to copy!");
      return;
    }

    navigator.clipboard.writeText(md.trim())
      .then(() => {
        toast.success("Roadmap checklist copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed writing to clipboard.");
      });
  };

  const isTemp = isTemporary || roadmap.isTemporary;
  const roleName = roadmap.targetRole || roadmap.title?.replace("Learning Roadmap for ", "")?.replace("Target Opportunity Sprint Roadmap: ", "") || "Target Role";

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* On-The-Fly Temporary Roadmap Banner (User requested requirement) */}
      {isTemp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  On-The-Fly Exploratory Roadmap
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Temporary View
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Viewing on-the-spot generated flight path for <strong>"{roleName}"</strong>. Navigating away or clicking return will restore your scanned baseline resume roadmap.
              </p>
            </div>
          </div>

          {onClearTemporary && (
            <Button
              onClick={onClearTemporary}
              variant="outline"
              size="sm"
              className="rounded-xl border-amber-500/40 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs gap-1.5 h-10 px-4 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return to Primary Roadmap</span>
            </Button>
          )}
        </motion.div>
      )}

      {/* Header section */}
      <section className="text-center space-y-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] -z-10 rounded-full" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-1 border border-primary/20">
          <Target className="w-3.5 h-3.5" />
          <span>{isTemp ? "Exploratory Opportunity Sprint" : "Validated Target Career Roadmap"}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-foreground">
          {roadmap.title || `Learning Roadmap for ${roleName}`}
        </h1>

        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed px-4">
          A focused, sprint-by-sprint career progression timeline tailored to bridge skill gaps and maximize hiring velocity for <strong className="text-foreground">"{roleName}"</strong>.
        </p>

        {/* Action Controls */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={copyToClipboard}
            className="rounded-2xl h-11 px-6 font-black bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg flex items-center gap-2 text-xs cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            Copy Roadmap Checklist
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => selectAll(true)}
            className="rounded-xl h-11 border text-xs font-bold px-4 cursor-pointer"
          >
            Select All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => selectAll(false)}
            className="rounded-xl h-11 border text-xs font-bold px-4 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 cursor-pointer"
          >
            Deselect All
          </Button>
        </div>
      </section>

      {/* Week-by-Week Roadmap Timeline */}
      <section className="space-y-12">
        <div className="flex items-center gap-2 px-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            Sprint & Weekly Timeline Path
          </h2>
        </div>

        <div className="space-y-12 relative px-2">
          <div className="absolute top-0 bottom-0 left-[2.5rem] w-1 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent hidden md:block" />

          {roadmap.sprints?.map((sprint: any, sIdx: number) => (
            <div key={sIdx} className="relative">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                
                {/* Sprint Number Badge */}
                <div className="md:w-28 shrink-0 relative">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg md:text-xl shadow-xl shadow-primary/25 md:sticky md:top-24 z-20 mx-auto md:mx-0">
                    {sprint.sprint_number || sIdx + 1}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-card border border-border rounded-lg flex items-center justify-center text-primary text-[9px] font-black shadow-sm">
                      S{sIdx + 1}
                    </div>
                  </div>
                </div>

                {/* Sprint Content */}
                <div className="flex-1 space-y-6">
                  <div className="glass p-6 rounded-[2rem] border border-border bg-card/80 shadow-md">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary block mb-1">
                      SPRINT MILESTONE {sIdx + 1}
                    </span>
                    <h3 className="text-lg md:text-xl font-black tracking-tight text-foreground">
                      {sprint.theme}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {sprint.weeks?.map((week: any, wIdx: number) => (
                      <Card key={wIdx} className="glass border border-border/80 rounded-[2rem] overflow-hidden shadow-md bg-card/60">
                        <div className="p-6 md:p-7 space-y-5">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-black">
                              Week {week.week}
                            </span>
                            <h4 className="font-extrabold text-base tracking-tight leading-snug text-foreground">
                              {week.title}
                            </h4>
                          </div>

                          <div className="space-y-3.5">
                            {week.tasks?.map((task: any, tIdx: number) => {
                              const isChecked = selectedTasks[`${sIdx}-${wIdx}-${tIdx}`] !== false;
                              return (
                                <div 
                                  key={tIdx}
                                  onClick={() => toggleSelect(sIdx, wIdx, tIdx)}
                                  className={cn(
                                    "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none",
                                    isChecked 
                                      ? "bg-muted/40 border-border hover:bg-muted/60" 
                                      : "bg-muted/10 border-transparent opacity-60 hover:opacity-100"
                                  )}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {isChecked ? (
                                      <CheckSquare className="w-4 h-4 text-primary" />
                                    ) : (
                                      <Square className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className={cn(
                                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                        task.type === 'course' ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                                        task.type === 'project' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                                        "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                      )}>
                                        {task.type}
                                      </span>
                                      {task.hours && (
                                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {task.hours}h
                                        </span>
                                      )}
                                      {task.platform && (
                                        <span className="text-[10px] text-muted-foreground truncate">
                                          • {task.platform}
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-xs font-bold text-foreground">
                                      {task.title}
                                    </p>

                                    {task.details && (
                                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                        {task.details}
                                      </p>
                                    )}

                                    {task.tech && task.tech.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {task.tech.map((tc: string, tcIdx: number) => (
                                          <span key={tcIdx} className="text-[9px] font-medium px-2 py-0.5 rounded bg-background text-muted-foreground border border-border">
                                            {tc}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
