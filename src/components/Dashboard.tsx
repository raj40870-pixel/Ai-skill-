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
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              Welcome back, <br className="hidden sm:inline" />
              <span className="text-primary italic">{user?.name || 'Explorer'}</span>
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground max-w-2xl font-medium">
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
            onClick={() => onNavigate(isAnalyzed ? 'ats' : 'upload')}
            className="w-full sm:w-auto rounded-xl font-bold px-8 h-12 shadow-lg shadow-primary/20 cursor-pointer"
          >
            {isAnalyzed ? 'Review Full Audit' : 'Upload & Analyze Resume'}
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </Card>
      </motion.div>

      {/* 3. MODULAR CAREER ECOSYSTEM GRID (The Heart of the Dashboard) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Comprehensive Career Ecosystem
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Full institutional-grade career suite: real-time ATS auditing, Staff-level AI mentorship, live market benchmarks, and interview simulations.
            </p>
          </div>
          <div className="self-start sm:self-auto text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
            9 Active Modules
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: 'upload',
              title: 'Instant Resume Scan & Parser',
              badge: 'WORKDAY & JOBSCAN CALIBRATED',
              badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
              icon: Rocket,
              color: 'text-rose-500',
              bg: 'bg-rose-500/10',
              desc: 'Deep parsing of PDF, Word DOCX, and photo scans. Evaluates your profile across 8 technical dimensions with zero formatting loss.',
              deliverables: [
                '8-Point technical criteria breakdown (Keywords, Metrics, Layout)',
                'Instant detection of formatting issues, table traps, & parse errors',
                'Severity-ranked priority fixes to bypass screening filters'
              ]
            },
            {
              id: 'mentorship',
              title: 'AI Career & Architecture Mentor',
              badge: '24/7 INTERACTIVE ENGINEERING MENTOR',
              badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
              icon: Sparkles,
              color: 'text-indigo-500',
              bg: 'bg-indigo-500/10',
              desc: 'Your 24/7 Staff-level engineering mentor for architecture trade-offs, XYZ resume rewrites, STAR interview drills, and senior offer negotiations.',
              deliverables: [
                'Context-aware guidance deeply calibrated to your uploaded resume',
                'System design trade-off reviews & high-concurrency architecture advice',
                'Voice typing in Hindi/English, file attachments, and audio narration'
              ]
            },
            {
              id: 'ats',
              title: 'Institutional ATS Scorecard & Bullet Lab',
              badge: 'GOOGLE XYZ FORMULA',
              badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
              icon: Shield,
              color: 'text-purple-500',
              bg: 'bg-purple-500/10',
              desc: 'Interactive before vs. after transformation lab converting weak passive duties into top 5% quantified power accomplishment bullets.',
              deliverables: [
                'Calculated institutional hireability score out of 100 with deduction logs',
                'Interactive Before vs After bullet rewrite lab using Google XYZ formula',
                'Direct keyword and KPI impact boosts for technical screening rounds'
              ]
            },
            {
              id: 'skillgap',
              title: 'Deep Skill Gap & Recruiter Friction',
              badge: '2026 LIVE MARKET REQUISITIONS',
              badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
              icon: Zap,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10',
              desc: 'Scans your tech stack against live 2026 job requisitions to pinpoint exactly why recruiters might pass on your profile.',
              deliverables: [
                'Verified profile strengths vs. missing high-demand frameworks',
                '\'Hiring Friction\' insights explaining recruiter rejection triggers',
                'Prescribed hands-on coding fixes to bridge every detected deficiency'
              ]
            },
            {
              id: 'roadmap',
              title: '4-Week Career Sprint Roadmap',
              badge: 'STEP-BY-STEP EXECUTION',
              badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
              icon: Map,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10',
              desc: 'A hyper-focused weekly execution plan with hands-on projects designed to take you from your current state to interview-ready.',
              deliverables: [
                '4 Structured weekly milestone themes & hands-on deliverables',
                'Daily task checklists with realistic study hour allocations',
                'Production-grade GitHub portfolio deliverables per sprint'
              ]
            },
            {
              id: 'salary',
              title: 'Global Salary Benchmarks (2026)',
              badge: 'VERIFIED COMPENSATION DATA',
              badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
              icon: Wallet,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
              desc: 'Unbiased, real-world compensation bands across major tech hubs to give you negotiation leverage in final offer rounds.',
              deliverables: [
                'US Silicon Valley & Tier 1 bands ($115k – $165k+ / year)',
                'European Union / UK and high-growth Global Remote tiers',
                'India Product Hubs (Bengaluru / NCR ₹18L – ₹38L+ salary bands)'
              ]
            },
            {
              id: 'interview',
              title: 'AI Interview Simulation & Drills',
              badge: 'ROLE-SPECIFIC DRILLS',
              badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
              icon: MessageSquare,
              color: 'text-cyan-500',
              bg: 'bg-cyan-500/10',
              desc: 'Practice role-specific technical questions, architecture scenarios, and behavioral STAR stories with real-time AI scoring.',
              deliverables: [
                'Target role-specific technical interview questions with model answers',
                'System design scenario evaluations & trade-off guidance',
                'Instant AI scoring out of 100 with actionable feedback'
              ]
            },
            {
              id: 'resources',
              title: 'Curated Learning Resources',
              badge: '1-CLICK DIRECT HYPERLINKS',
              badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
              icon: BookOpen,
              color: 'text-indigo-500',
              bg: 'bg-indigo-500/10',
              desc: 'Direct clickable links to the best official documentation, interactive coding sandboxes, and video curricula.',
              deliverables: [
                'Official documentation & standard architectural references',
                'Hands-on interactive practice sandboxes (LeetCode, FreeCodeCamp)',
                'Curated video courses and deep-dive community tutorials'
              ]
            },
            {
              id: 'history',
              title: 'Resume Versioning & Cloud History',
              badge: 'PRIVATE & ENCRYPTED',
              badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
              icon: History,
              color: 'text-orange-500',
              bg: 'bg-orange-500/10',
              desc: 'Manage multiple tailored resume versions for different job applications with automatic encrypted cloud backup and PDF export.',
              deliverables: [
                'Compare scores across different target roles (e.g. AI vs Full Stack)',
                'Track score improvements over time as you apply recommendations',
                'Export consolidated multi-page PDF audit reports with zero formatting bugs'
              ]
            }
          ].map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * idx }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card 
                onClick={() => onNavigate(item.id)}
                className="group border border-border/80 hover:border-primary/50 rounded-3xl p-6 sm:p-7 bg-card/60 hover:bg-card/90 transition-all cursor-pointer shadow-sm hover:shadow-xl flex flex-col justify-between h-full backdrop-blur-sm relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border", item.badgeColor)}>
                      {item.badge}
                    </span>
                    <div className={cn("p-2.5 rounded-2xl shrink-0 transition-transform group-hover:scale-110", item.bg)}>
                      <item.icon className={cn("w-5 h-5", item.color)} />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-primary transition-colors tracking-tight mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-5">
                    {item.desc}
                  </p>

                  <div className="space-y-2 border-t border-border/40 pt-4 mb-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">
                      What You Get:
                    </p>
                    <ul className="space-y-1.5">
                      {item.deliverables.map((deliv, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 text-[11px] text-muted-foreground font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 w-full flex items-center justify-between mt-auto">
                  <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Launch Module
                    <ChevronRight className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
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
