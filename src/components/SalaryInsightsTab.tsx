import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  Info,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Zap,
  RefreshCw,
  Globe,
  DollarSign,
  Award,
  Layers,
  Search,
  CheckCircle2,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { toast } from 'sonner';
import { 
  getCountrySalaryMapping, 
  CountrySalary, 
  identifyTargetOpportunities, 
  TargetOpportunity, 
  getExploratoryCareerFields, 
  CareerField,
  getDynamicCareerSwitchPaths,
  getMarketGapsForUser,
  CareerSwitchPath,
  HighDemandMarketGap
} from '../lib/marketTelemetry';

interface SalaryInsightsTabProps {
  resumeData?: any;
  targetRole?: string;
  onNavigate?: (page: string) => void;
  onGenerateTemporaryRoadmap?: (opportunityRole: string) => void;
}

export function SalaryInsightsTab({ 
  resumeData, 
  targetRole = "Senior Full Stack Engineer", 
  onNavigate,
  onGenerateTemporaryRoadmap 
}: SalaryInsightsTabProps) {
  const skills = resumeData?.parsedData?.skills || resumeData?.skills || ['TypeScript', 'React', 'Node.js', 'Docker', 'AWS'];
  const [activeRole, setActiveRole] = useState(targetRole);
  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
  const [selectedSeniorityTier, setSelectedSeniorityTier] = useState<'entry' | 'mid' | 'senior' | 'lead'>('senior');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (targetRole) {
      setActiveRole(targetRole);
    }
  }, [targetRole]);

  const countrySalaries = getCountrySalaryMapping(activeRole);
  const selectedCountry = countrySalaries.find(c => c.countryCode === selectedCountryCode) || countrySalaries[0];
  const opportunities = identifyTargetOpportunities(skills, activeRole);
  const exploratoryFields = getExploratoryCareerFields(skills);
  
  // New AI-driven dynamic content
  const switchPaths = getDynamicCareerSwitchPaths(skills, activeRole);
  const marketGaps = getMarketGapsForUser(skills);

  const filteredCountries = countrySalaries.filter(c => 
    c.country.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Growth Trend for the selected country
  const trendData = [
    { year: '2023', val: 0.85 },
    { year: '2024', val: 0.92 },
    { year: '2025', val: 1.00 },
    { year: '2026 (Est)', val: 1.14 },
    { year: '2027 (Proj)', val: 1.28 }
  ].map(item => ({
    year: item.year,
    lpm: parseFloat((parseFloat(selectedCountry.lpmRange.replace(/[^0-9.]/g, '')) * item.val).toFixed(2)) || 2.8
  }));

  const compensationMix = [
    { component: 'Guaranteed Base Salary', share: '70%', color: '#2563EB' },
    { component: 'Performance & Annual Bonus', share: '15%', color: '#10B981' },
    { component: 'Stock / ESOPs / Retention', share: '15%', color: '#7C3AED' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-20">
      
      {/* 1. TOP TARGET ROLE BANNER (AI-Analyzed Analysis) */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-8 sm:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/15 blur-[90px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>AI Resume Analysis Synthesis • Live Market Mapping</span>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300 block mb-1">
                Primary Analyzed Pathway
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-white/80">
                {activeRole}
              </h1>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              We have analyzed your resume and identified <strong className="text-white font-bold">{activeRole}</strong> as your primary market track. You can also switch to alternative roles based on your transferable core.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Skills Verified</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold">
                <TrendingUp className="w-3 h-3 text-blue-400" />
                <span>High Growth</span>
              </div>
            </div>
          </div>

          {/* AI Suggested Switch Roles */}
          <div className="bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/15 p-6 shrink-0 lg:w-96 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300">AI Switch Recommendations</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            
            <p className="text-[11px] text-slate-300 italic">
              "Based on your profile, you can switch to these roles with high transferable package gains:"
            </p>

            <div className="space-y-3">
              {switchPaths.map((path) => (
                <button
                  key={path.id}
                  onClick={() => {
                    setActiveRole(path.targetRole);
                    toast.success(`Switching to: ${path.targetRole}`);
                  }}
                  className={cn(
                    "w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                    activeRole === path.targetRole 
                      ? "bg-blue-600 border-blue-400 shadow-lg" 
                      : "bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/20"
                  )}
                >
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-indigo-200 uppercase block">Switch to:</span>
                      <p className="text-sm font-black text-white truncate max-w-[180px]">
                        {path.targetRole}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-400 block">{path.salaryImpact}</span>
                      <span className="text-xs font-black text-white">{path.estimatedLPM}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. COUNTRY SALARY MAPPING MATRIX (Maps target role to multiple countries with LPM and Local) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border">
          <div>
            <span className="text-xs font-black uppercase text-primary tracking-widest block font-mono">GLOBAL MARKET TELEMETRY</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Country-Wise Salary Estimates & <span className="text-primary italic">LPM Highs</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Estimated compensation packages for <strong className="text-foreground">{activeRole}</strong> by country.
            </p>
          </div>

          {/* Search / Filter Countries */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search country or currency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl h-10 pl-9 pr-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            />
          </div>
        </div>

        {/* Selected Country Spotlight Hero Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Spotlight Detailed Metrics */}
          <Card className="lg:col-span-8 glass border border-primary/20 rounded-[2.5rem] p-6 sm:p-8 bg-card shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/60">
              <div className="flex items-center gap-4">
                <span className="text-4xl sm:text-5xl">{selectedCountry.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black tracking-tight text-foreground">
                      {selectedCountry.country}
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {selectedCountry.growthRate}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hiring Hubs: {selectedCountry.hiringHubs.join(', ')}
                  </p>
                </div>
              </div>

              {/* LPM High Highlight Box */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 sm:text-right shrink-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-0.5">
                  Lakhs Per Month (LPM)
                </span>
                <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                  {selectedCountry.lpmRange}
                </span>
                <span className="text-[11px] text-muted-foreground block font-medium mt-0.5">
                  Annual: {selectedCountry.annualLocal}
                </span>
              </div>
            </div>

            {/* Seniority Tier Selector */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Experience Tier Breakdown
                </span>
                <span className="text-xs text-primary font-bold">
                  {activeRole}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['entry', 'mid', 'senior', 'lead'] as const).map((tierKey) => {
                  const tierData = selectedCountry.tiers[tierKey];
                  const labels = {
                    entry: 'Entry Level (0-2 yrs)',
                    mid: 'Mid Level (2-5 yrs)',
                    senior: 'Senior Level (5-8 yrs)',
                    lead: 'Lead / Staff (8+ yrs)'
                  };

                  return (
                    <button
                      key={tierKey}
                      onClick={() => setSelectedSeniorityTier(tierKey)}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all cursor-pointer",
                        selectedSeniorityTier === tierKey
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                          : "bg-muted/40 hover:bg-muted/70 border-border/70 text-foreground"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] font-bold block mb-1 uppercase tracking-wider",
                        selectedSeniorityTier === tierKey ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {labels[tierKey].split(' (')[0]}
                      </span>
                      <p className="text-sm font-black truncate">
                        {tierData.local}
                      </p>
                      <p className={cn(
                        "text-[11px] font-bold mt-1",
                        selectedSeniorityTier === tierKey ? "text-emerald-300" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {tierData.lpm}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compensation Structure & Perks */}
            <div className="pt-6 mt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {compensationMix.map((mix, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground block">{mix.component}</span>
                  <span className="text-lg font-black text-foreground">{mix.share}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Country Selector List */}
          <Card className="lg:col-span-4 glass border border-border rounded-[2.5rem] p-6 bg-card shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Select Country</span>
                <Globe className="w-4 h-4 text-primary" />
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredCountries.map((c) => (
                  <button
                    key={c.countryCode}
                    onClick={() => {
                      setSelectedCountryCode(c.countryCode);
                      toast.info(`Switched market index to ${c.country}`);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer",
                      selectedCountryCode === c.countryCode
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                        : "bg-muted/20 border-transparent hover:bg-muted/40 text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{c.flag}</span>
                      <div>
                        <p className="text-xs font-bold">{c.country}</p>
                        <p className="text-[10px] text-muted-foreground">{c.currency}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                        {c.lpmRange}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{c.annualLocal.split(' (')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. DYNAMIC TARGET MAPPING RECOMMENDATIONS (User requirement: AI analyzed resume and recommended these) */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 text-xs font-bold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>AI Target Mapping Recommendation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Career Switch Strategy & <span className="text-primary italic">Mapping</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              "We have analyzed your resume and recommend these strategic pathways. Your existing skill core allows for a high-impact switch into these specialized domains."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {switchPaths.map((path) => (
            <Card 
              key={path.id}
              className="glass border border-border rounded-[2rem] p-6 bg-card shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
                    {path.salaryImpact}
                  </span>
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {path.targetRole}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {path.reason}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <span className="text-[9px] font-black uppercase text-emerald-600 block mb-1">Transferable Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {path.transferableSkills.map((s, i) => (
                        <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/5 text-emerald-600 border border-emerald-500/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-orange-600 block mb-1">Skills to Bridge</span>
                    <div className="flex flex-wrap gap-1">
                      {path.newSkillsToLearn.map((s, i) => (
                        <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-orange-500/5 text-orange-600 border border-orange-500/10">
                          +{s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Estimated Entry</span>
                  <span className="text-sm font-black text-foreground">{path.estimatedLPM}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveRole(path.targetRole);
                    toast.info(`Mapping target to ${path.targetRole}`);
                  }}
                  className="rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border-none shadow-none text-[10px] font-bold h-8 px-3"
                >
                  Map Career
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. HIGH-DEMAND MARKET GAPS (User requirement: Doesn't relate to resume but high demand in market) */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>High-Demand Market Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Strategic Market <span className="text-primary italic">Gaps</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              "These high-demand skills are currently not identified in your resume, but they represent the highest paying pivots in the 2026 market. Explore these to maximize your global package."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {marketGaps.map((gap) => (
            <Card 
              key={gap.id}
              className="glass border-dashed border-2 border-border hover:border-primary/40 rounded-[2rem] p-6 bg-card/50 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Award className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-orange-600 uppercase block tracking-tighter">Market Value</span>
                  <span className="text-sm font-black text-foreground">{gap.potentialPackage}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-foreground">{gap.skillName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 border border-orange-500/10 mt-1 inline-block">
                  {gap.relevanceToUser}
                </span>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {gap.marketContext}
                </p>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  if (onGenerateTemporaryRoadmap) {
                    onGenerateTemporaryRoadmap(gap.skillName);
                  }
                }}
                className="w-full rounded-xl hover:bg-primary/5 text-primary text-xs font-bold gap-2 mt-2 h-10 cursor-pointer"
              >
                <span>Take Roadmap to Bridge Gap</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. DYNAMIC TARGET OPPORTUNITIES (Original Section 3 updated) */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Production Track Analysis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Analyzed Production <span className="text-primary italic">Roles</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <Card 
              key={opp.id} 
              className="glass border border-border/80 hover:border-primary/40 rounded-[2rem] p-6 sm:p-7 bg-card shadow-lg hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                {/* Header Title & Match Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary font-mono block mb-1">
                      {opp.field}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {opp.title}
                    </h3>
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold shrink-0">
                    {opp.growthVelocity}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {opp.description}
                </p>

                {/* Package Highlights (LPA, LPM, USD) */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">India Package</span>
                    <span className="text-base font-black text-foreground block">{opp.packageLPA}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{opp.packageLPM}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Global Equivalent</span>
                    <span className="text-base font-black text-foreground block">{opp.packageGlobalUSD}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{opp.growthVelocity}</span>
                  </div>
                </div>

                {/* Skills to bridge */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Bridge Skills to Unlock Max Package:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.bridgeSkills.map((sk, sIdx) => (
                      <span 
                        key={sIdx}
                        className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20"
                      >
                        +{sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: Generate On-The-Fly Roadmap */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-4">
                <span className="text-[11px] text-muted-foreground font-medium truncate">
                  Top Recruiters: {opp.topHiringCompanies.slice(0, 3).join(', ')}
                </span>

                <Button
                  onClick={() => {
                    if (onGenerateTemporaryRoadmap) {
                      onGenerateTemporaryRoadmap(opp.title);
                    }
                  }}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 h-10 gap-2 cursor-pointer shadow-md shadow-primary/20 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Roadmap</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. POTENTIAL EXTRA FIELDS TO EXPLORE (Informs user about extra domains based on their resume) */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border">
          <div>
            <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest block font-mono">
              EXPAND YOUR CAREER HORIZONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              High-Interest Fields <span className="text-primary italic">You Can Explore</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your technical background, you have transferable fundamentals to enter these surging tech sectors with top compensation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exploratoryFields.map((field) => (
            <Card
              key={field.id}
              className="glass border border-border rounded-[2rem] p-6 bg-card shadow-md hover:shadow-lg transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold mb-1.5 border border-indigo-500/20">
                    <Compass className="w-3 h-3" />
                    <span>{field.marketInterest} • {field.growthYoY}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {field.fieldName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {field.tagline}
                  </p>
                </div>

                <div className="text-right shrink-0 bg-muted/40 p-2.5 rounded-xl border border-border/50">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block">Avg Market Rate</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">{field.avgPackageLPM}</span>
                  <span className="text-[10px] text-muted-foreground">{field.avgPackageLPA}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Core Domain Pillars:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {field.keyPillars.map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted-foreground">
                  Industry Trend: <strong className="text-foreground font-black">{field.growthYoY} YoY Growth</strong>
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (onGenerateTemporaryRoadmap) {
                      onGenerateTemporaryRoadmap(field.targetRoles[0]);
                    }
                  }}
                  className="rounded-xl border-primary/30 hover:bg-primary/5 text-primary text-xs font-bold gap-1.5 h-9 px-3 cursor-pointer"
                >
                  <span>Explore Roadmap</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
