import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  BookOpen, 
  Map, 
  MessageSquare, 
  Wallet, 
  Share2, 
  Briefcase, 
  User,
  ChevronRight,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  Star,
  Zap,
  CheckCircle2,
  Target,
  Trophy,
  History,
  Rocket
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  user: any;
  resume: any;
  atsData: any;
  targetRole?: string;
  onNavigate: (page: string) => void;
  onGenerateRoadmap?: (role: string) => void;
  onGenerateTemporaryRoadmap?: (opportunityRole: string) => void;
  onUploadComplete?: (data: any) => void;
}

export function Dashboard({ 
  user, 
  resume, 
  atsData, 
  targetRole = "Career Search", 
  onNavigate,
  onGenerateRoadmap,
  onGenerateTemporaryRoadmap,
  onUploadComplete
}: DashboardProps) {
  const isAnalyzed = !!resume;
  const score = atsData?.score || 85;
  const match = atsData?.market_match || (isAnalyzed ? 92 : 88);
  
  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* 1. CLEAN HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 sm:pt-6 space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAnalyzed ? 'Analysis Active' : 'Demo Experience'}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              Welcome back, <br />
              <span className="text-primary italic">{user?.name || 'Explorer'}</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl font-medium">
              Your career intelligence ecosystem is synced. Manage your profile, analyze ATS scores, and generate learning roadmaps.
            </p>
          </div>

          {/* SIMPLIFIED PERCENTAGE SECTION */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-muted-foreground block tracking-widest">ATS Score</span>
              <div className="text-4xl font-black text-primary">{isAnalyzed ? score : 85}%</div>
              <span className="text-[9px] font-bold text-emerald-600 block">{isAnalyzed ? 'Live Data' : 'Demo Score'}</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-muted-foreground block tracking-widest">Market Match</span>
              <div className="text-4xl font-black text-blue-500">{isAnalyzed ? match : 88}%</div>
              <span className="text-[9px] font-bold text-blue-400 block">{isAnalyzed ? 'Industry Peak' : 'Projected'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. PRIMARY STATUS BAR */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 rounded-[2rem] border-2 border-border/50 shadow-sm bg-card flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors",
              isAnalyzed ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"
            )}>
              {isAnalyzed ? <Shield className="w-6 h-6" /> : <Rocket className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-black text-lg text-foreground">
                {isAnalyzed ? 'Resume Analyzed Successfully' : 'Ready to Analyze Resume'}
              </h3>
              <p className="text-xs text-muted-foreground font-medium italic">
                {isAnalyzed 
                  ? `Targeting: ${targetRole || 'Global Markets'} • Version 1.0` 
                  : 'Analyze your profile to unlock full market telemetry'}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => onNavigate(isAnalyzed ? 'ats' : 'profile')}
            className="w-full sm:w-auto rounded-xl font-bold px-8 h-12 shadow-lg shadow-primary/20 cursor-pointer"
          >
            {isAnalyzed ? 'Review Full Audit' : 'Start Free Analysis'}
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </Card>
      </motion.div>

      {/* 3. MODULAR CAREER ECOSYSTEM GRID (The Heart of the Dashboard) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Career Ecosystem
          </h2>
          <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest bg-muted px-3 py-1 rounded-full">
            8 Modules Active
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { id: 'ats', title: 'ATS Analyzer', desc: 'Score & Keyword Optimization', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 'learning', title: 'Learning Paths', desc: 'Skill Acquisition Library', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'roadmap', title: 'Career Roadmap', desc: 'Step-by-Step Goal Tracking', icon: Map, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 'interview', title: 'Interview Prep', desc: 'Real-time Mock Simulations', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { id: 'salary', title: 'Salary Insights', desc: 'Global Compensation Index', icon: Wallet, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { id: 'networking', title: 'Networking Hub', desc: 'Connection Strategy Guide', icon: Share2, color: 'text-pink-500', bg: 'bg-pink-500/10' },
            { id: 'portfolio', title: 'Portfolio Builder', desc: 'Visual Project Showcase', icon: Briefcase, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
            { id: 'profile', title: 'Settings & Profile', desc: 'Preferences & Sync', icon: User, color: 'text-slate-500', bg: 'bg-slate-500/10' },
          ].map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * idx }}
            >
              <Card 
                onClick={() => onNavigate(item.id)}
                className="group border border-border hover:border-primary/40 rounded-[2rem] p-6 bg-card hover:bg-muted/30 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col items-start gap-4 h-full"
              >
                <div className={cn("p-3.5 rounded-2xl", item.bg)}>
                  <item.icon className={cn("w-6 h-6", item.color)} />
                </div>
                <div>
                  <h3 className="font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-snug mt-1.5 font-medium">{item.desc}</p>
                </div>
                <div className="mt-auto pt-4 w-full flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Launch</span>
                  <div className="p-1 rounded-full bg-muted group-hover:bg-primary transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white transition-all" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
