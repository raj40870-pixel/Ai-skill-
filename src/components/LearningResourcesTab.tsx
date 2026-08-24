const BASE_URL = (import.meta.env.VITE_API_URL || 'https://ais-pre-zzgehztczlcl5evoujectb-435432813811.asia-southeast1.run.app').replace(/\/$/, '');

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ExternalLink, 
  GraduationCap, 
  Video, 
  FileText, 
  Github, 
  Sparkles,
  RefreshCw,
  Lightbulb,
  Globe,
  ArrowRight,
  Loader2,
  Compass
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Resource {
  title: string;
  description: string;
  url: string;
  type: 'documentation' | 'course' | 'github' | 'tutorial';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime?: string;
}

interface Category {
  name: string;
  resources: Resource[];
}

interface LearningResourcesData {
  categories: Category[];
  expertTip: string;
}

interface LearningResourcesTabProps {
  roadmap: any;
  onNavigate?: (tab: string) => void;
}

export function LearningResourcesTab({ roadmap, onNavigate }: LearningResourcesTabProps) {
  const [data, setData] = useState<LearningResourcesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetRole = roadmap?.title?.replace("Learning Roadmap for ", "") || "your role";
  const skills = roadmap?.skills || [];
  const skillGaps = roadmap?.skill_gap_report?.missing_skills || [];

  const fetchResources = async () => {
    if (!roadmap) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/generate-learning-resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetRole, 
          skills, 
          skillGaps 
        }),
      });
      if (!response.ok) throw new Error('Failed to conduct research');
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Research error:', err);
      setError('AI research failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roadmap && !data && !isLoading) {
      fetchResources();
    }
  }, [roadmap]);

  if (!roadmap) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center glass rounded-[3rem] p-12 border-none shadow-xl">
        <BookOpen className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
        <h2 className="text-3xl font-black mb-4 tracking-tight">No Resources Available</h2>
        <p className="text-muted-foreground mb-8 italic">Analyze your resume to receive live AI-researched educational recommendations.</p>
        {onNavigate && (
          <Button size="lg" className="h-14 rounded-2xl bg-primary text-white font-bold px-10" onClick={() => onNavigate('upload')}>
            Upload Resume
          </Button>
        )}
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return <Video className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'tutorial': return <GraduationCap className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/40';
      case 'Intermediate': return 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/40';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/40';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. RESEARCH HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Real-time Deep Research</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Elite Targeted <span className="text-primary italic">Materials</span>
          </h2>
          <p className="text-sm text-muted-foreground font-medium max-w-xl">
            AI is scanning verified high-authority platforms for <span className="text-foreground font-bold">{targetRole}</span> materials that are working and relevant today.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={fetchResources} 
          disabled={isLoading}
          className="rounded-xl border-2 font-black h-12 px-6 gap-2 hover:bg-primary hover:text-white transition-all shadow-sm group"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary group-hover:text-white" />
          ) : (
            <RefreshCw className="w-4 h-4 text-primary group-hover:text-white" />
          )}
          <span>Live Research Refresh</span>
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24 flex flex-col items-center justify-center space-y-8 text-center px-4"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="w-10 h-10 text-primary/40 animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 bg-white dark:bg-zinc-950 p-2 rounded-lg shadow-xl border border-border">
                <Sparkles className="w-4 h-4 text-primary animate-bounce" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-foreground">Conducting Deep Intelligence Sweep...</h3>
              <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto italic">
                Analyzing your profile against 2024-2025 industry standards to find specific, working documentation and repositories.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl pt-8">
              {[
                { label: 'Scouring Docs', icon: FileText },
                { label: 'Verifying Repos', icon: Github },
                { label: 'Curating Courses', icon: GraduationCap }
              ].map((step, i) => (
                <div key={step.label} className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center gap-3 backdrop-blur-sm">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <step.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{step.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-foreground">{error}</h3>
            <Button onClick={fetchResources} className="rounded-xl font-bold">Retry Deep Research</Button>
          </motion.div>
        ) : data ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 px-4 md:px-0"
          >
            {/* EXPERT TIP BANNER */}
            <Card className="p-6 md:p-8 rounded-[2.5rem] bg-zinc-900 dark:bg-zinc-800 text-white border-none shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-1">Elite Career Intelligence Strategy</span>
                  <p className="text-lg md:text-xl font-bold leading-relaxed italic pr-4">"{data.expertTip}"</p>
                </div>
              </div>
            </Card>

            {/* LIVE RESOURCE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {data.categories.map((category, catIdx) => (
                <div key={catIdx} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-8 rounded-full bg-primary shadow-lg shadow-primary/20" />
                    <h3 className="text-2xl font-black text-foreground tracking-tight">{category.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {category.resources.map((resource, resIdx) => (
                      <motion.div
                        key={resIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (catIdx * 0.1) + (resIdx * 0.05) }}
                      >
                        <Card className="group p-6 rounded-[2.2rem] border border-border/50 hover:border-primary/40 hover:bg-muted/30 transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
                          <div className="flex items-start gap-5">
                            <div className="mt-1 p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                              {getIcon(resource.type)}
                            </div>
                            <div className="flex-1 space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1.5">
                                  <h4 className="font-black text-lg text-foreground leading-tight group-hover:text-primary transition-colors">{resource.title}</h4>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={cn(
                                      "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-[0.1em]",
                                      getDifficultyColor(resource.difficulty)
                                    )}>
                                      {resource.difficulty}
                                    </span>
                                    {resource.estimatedTime && (
                                      <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/40 tracking-tight">
                                        {resource.estimatedTime}
                                      </span>
                                    )}
                                    <span className="text-[9px] font-black uppercase text-primary/60 tracking-widest">{resource.type}</span>
                                  </div>
                                </div>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="rounded-xl h-10 w-10 border hover:bg-primary hover:text-white transition-all"
                                  asChild
                                >
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground font-medium leading-relaxed pr-6">
                                {resource.description}
                              </p>
                              <div className="pt-2">
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform group/link"
                                >
                                  Launch Targeted Material 
                                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                                </a>
                              </div>
                            </div>
                          </div>
                          
                          {/* Subtle background icon for design depth */}
                          <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                            {getIcon(resource.type)}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="py-24 text-center">
             <Compass className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
             <p className="text-muted-foreground font-medium italic">Preparing to launch deep research...</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
