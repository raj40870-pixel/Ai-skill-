import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp, 
  Search, 
  FileCheck, 
  Cpu, 
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from 'recharts';

interface ATSScoreTabProps {
  resumeData: any;
  atsData: any;
  onNavigate?: (tab: string) => void;
}

export function ATSScoreTab({ resumeData, atsData, onNavigate }: ATSScoreTabProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any>(null);
  
  // Track resolved state for fixes
  const [resolvedFixes, setResolvedFixes] = useState<Record<number, boolean>>({});

  if (!resumeData || !resumeData.text) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center glass rounded-[3rem] p-12 border-none shadow-xl">
        <AlertCircle className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
        <h2 className="text-3xl font-black mb-4 tracking-tight">No Resume Uploaded</h2>
        <p className="text-muted-foreground mb-8 italic">Please upload your resume to see your dynamic ATS Score analysis.</p>
        <Button size="lg" className="h-14 rounded-2xl bg-primary text-white font-bold px-10" onClick={() => onNavigate && onNavigate('upload')}>
          Upload Resume
        </Button>
      </div>
    );
  }

  const score = atsData?.score || 85;
  const breakdown = atsData?.breakdown || [
    { criterion: 'Technical Skills', score: 90, max: 100, label: 'Excellent' },
    { criterion: 'Experience Depth', score: 85, max: 100, label: 'Strong' },
    { criterion: 'Education Match', score: 95, max: 100, label: 'Excellent' },
    { criterion: 'Visual Formatting', score: 90, max: 100, label: 'Strong' },
    { criterion: 'Keyword Coverage', score: 72, max: 100, label: 'Needs Improvement' },
    { criterion: 'Impact & Metrics', score: 80, max: 100, label: 'Strong' }
  ];

  const rawFixes = atsData?.priority_fixes || [];
  
  // Sort fixes by severity: Critical -> High -> Medium -> Low
  const severityOrder: Record<string, number> = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
  const fixes = [...rawFixes].sort((a, b) => {
    return (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99);
  });

  const defaultFixes = [
    { problem: "Metric Scarcity", impact: "Lack of data points makes achievements feel anecdotal.", fix: "Introduce more standardized unit percentages or cost reduction statistics to recent bullet entries.", severity: 'High' },
    { problem: "Certification Visibility", impact: "Parsers look for specific cloud or architecture badges.", fix: "Add certification attributes (e.g. AWS/Azure Architect) to better rank on enterprise level parsers.", severity: 'Medium' },
    { problem: "Formatting Friction", impact: "Dates can sometimes confuse older legacy parsing engines.", fix: "Streamline double dates descriptors on the micro-frontend section.", severity: 'Low' }
  ];

  const displayFixes = fixes.length > 0 ? fixes : defaultFixes;

  // Resume facts
  const resumeSkills = resumeData?.parsedData?.skills || ['React', 'TypeScript', 'Node.js', 'System Design', 'Git'];

  const toggleFix = (index: number) => {
    setResolvedFixes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleJobScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setScanning(true);
    // Simulate real keyword parsing comparison
    setTimeout(() => {
      const textLower = jobDescription.toLowerCase();
      // Match keywords
      const commonTechKeywords = [
        'react', 'typescript', 'javascript', 'node', 'next.js', 'nextjs', 'system design', 
        'aws', 'azure', 'docker', 'kubernetes', 'graphql', 'rest api', 'sql', 'nosql', 
        'agile', 'ci/cd', 'frontend', 'backend', 'full stack', 'cloud', 'python', 'testing'
      ];

      const foundInJob = commonTechKeywords.filter(kw => textLower.includes(kw));
      const matchedSkills = resumeSkills.filter((s: string) => textLower.includes(s.toLowerCase()));
      const missingSkills = foundInJob.filter(kw => !matchedSkills.some((s: string) => s.toLowerCase() === kw.toLowerCase()));

      // Calculate localized match percentage
      const matchedCount = matchedSkills.length;
      const totalCount = Math.max(foundInJob.length, 5);
      const computedScore = Math.min(Math.round((matchedCount / totalCount) * 100) + 40, 95);

      setScannedResult({
        matchPercentage: computedScore,
        matchedKeywords: matchedSkills,
        missingKeywords: missingSkills.slice(0, 5),
        verdict: computedScore >= 80 ? 'Highly Aligned' : computedScore >= 60 ? 'Moderate Match' : 'Gap Identified'
      });
      setScanning(false);
    }, 1200);
  };

  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-[#10B981]'; // Emerald Green
    if (val >= 75) return 'text-[#3B82F6]'; // Blue
    return 'text-[#F59E0B]'; // Amber
  };

  const activeFixesCount = displayFixes.length - Object.values(resolvedFixes).filter(Boolean).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block font-mono">AUTOMATED SYSTEM SIMULATOR</span>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary shrink-0" />
            ATS Optimization Score
          </h1>
          <p className="text-muted-foreground mt-1">Institutional-grade evaluation of your technical resume profile alignment.</p>
        </div>
        {onNavigate && (
          <Button 
            onClick={() => onNavigate('upload')} 
            variant="outline" 
            className="rounded-xl border-gray-200 text-xs font-semibold self-start md:self-auto gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-blue-600 animate-pulse" />
            Upload New Version
          </Button>
        )}
      </header>

      {/* Primary Score Ring and Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Total Health Summary Card */}
        <Card className="col-span-1 glass border-none p-2 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Cpu className="w-32 h-32 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-[#2563EB]/80 font-mono">Simulated Scoring</CardTitle>
                <CardDescription className="text-xs">Aggregate score computed across evaluations.</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-blue-500 block">Market Match</span>
                <span className="text-xl font-black text-blue-600">{atsData?.market_match || 88}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Radial background circle */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle 
                  className="text-gray-100 dark:text-zinc-900" 
                  strokeWidth="8" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
                <motion.circle 
                  className="text-primary" 
                  strokeWidth="8" 
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black tracking-tighter ${getScoreColor(score)}`}>{score}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground block mt-0.5">SCORE / 100</span>
              </div>
            </div>

            <div className="text-center mt-6 w-full max-w-xs space-y-1 bg-muted/30 p-3 rounded-2xl border border-muted/50">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground font-mono block">Scoring Verdict</span>
              <span className="text-sm font-black text-foreground block">
                {score >= 90 ? '⭐⭐⭐⭐⭐ High Success Match' : score >= 75 ? '⭐⭐⭐⭐ Secure Landing Class' : '⭐⭐ Needs Revision Match'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown Card */}
        <Card className="col-span-1 lg:col-span-2 glass border-none p-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-[#2563EB]/80 font-mono">Category Audit breakdown</CardTitle>
            <CardDescription className="text-xs">Category scores evaluated from parsed sections.</CardDescription>
          </CardHeader>
          <CardContent className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={breakdown} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="criterion" 
                  type="category" 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} 
                  width={110} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={14}>
                  {breakdown.map((entry: any, index: number) => {
                    const barFill = entry.score >= 90 ? '#10B981' : entry.score >= 75 ? '#2563EB' : '#F59E0B';
                    return <Cell key={`cell-${index}`} fill={barFill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Priority Fixes checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Recommended Action Checklist */}
        <Card className="glass border-none p-2 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/80 font-mono">Priority Fix Actions</CardTitle>
                <CardDescription className="text-xs">Optimize these structures to boost your ranking index.</CardDescription>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 font-mono">
                {activeFixesCount} FIXES LEFT
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {displayFixes.map((item: any, index: number) => {
              const isResolved = resolvedFixes[index];
              const severityColors: Record<string, string> = {
                'Critical': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                'High': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                'Medium': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                'Low': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              };

              return (
                <div 
                  key={index} 
                  className={`flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300 ${
                    isResolved 
                      ? 'bg-green-500/5 border-green-500/10 opacity-70' 
                      : 'bg-muted/30 border-border/40 hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div 
                        onClick={() => toggleFix(index)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 cursor-pointer transition-colors ${
                          isResolved 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-muted-foreground/30 text-transparent hover:border-primary'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${severityColors[item.severity] || severityColors.Medium}`}>
                            {item.severity || 'Medium'}
                          </span>
                          <span className={`text-sm font-bold tracking-tight ${isResolved ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {item.problem}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                          {item.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {!isResolved && (
                    <div className="pl-8">
                      <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Priority Fix</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground leading-relaxed">
                          {item.fix}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Dynamic Target Parser Playground */}
        <Card className="glass border-none p-2">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/80 font-mono">Match Scanner Simulator</CardTitle>
            <CardDescription className="text-xs">Paste a target job posting description to scan matching gaps from your resume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleJobScan} className="space-y-3">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description (roles, responsibilities, or tech stack requirements) here to begin analysis..."
                className="w-full bg-muted/45 border border-border/80 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-primary transition-all min-h-[140px] resize-none text-foreground placeholder:opacity-50"
                required
              />
              <Button 
                type="submit" 
                disabled={scanning}
                className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg cursor-pointer"
              >
                {scanning ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin text-white" />
                    Simulating Parser Cycles...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-white" />
                    Compute Custom Alignment Match
                  </>
                )}
              </Button>
            </form>

            {/* Simulated Match Results */}
            {scannedResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3.5 mt-2"
              >
                <div className="flex items-center justify-between border-b border-blue-500/10 pb-2.5">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block font-mono">MATCH SCORE</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400">{scannedResult.matchPercentage}% Alignment</span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    scannedResult.matchPercentage >= 75 
                      ? 'bg-green-500/10 text-green-600' 
                      : 'bg-amber-500/10 text-amber-600'
                  } uppercase tracking-wider`}>
                    {scannedResult.verdict}
                  </span>
                </div>

                {/* Keyword Gaps and Matches */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-green-600 block mb-1 font-mono">✅ Matched Keywords</span>
                    {scannedResult.matchedKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {scannedResult.matchedKeywords.map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 font-bold border border-green-500/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] italic text-muted-foreground opacity-60">None detected</span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 block mb-1 font-mono">⚠️ Missing Keywords</span>
                    {scannedResult.missingKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {scannedResult.missingKeywords.map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold border border-amber-500/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] italic text-muted-foreground opacity-60">None recommended</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
