import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Download, 
  Cpu, 
  Check,
  Target,
  Copy,
  Wand2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from 'recharts';
import { toast } from 'sonner';
import { generateFullAuditPdf } from '../lib/pdfGenerator';

interface ATSScoreTabProps {
  resumeData: any;
  atsData: any;
  roadmap?: any;
  user?: any;
  onNavigate?: (tab: string) => void;
}

export function ATSScoreTab({ resumeData, atsData, roadmap, user, onNavigate }: ATSScoreTabProps) {
  const [resolvedFixes, setResolvedFixes] = useState<Record<number, boolean>>({});
  const [copiedRewriteIdx, setCopiedRewriteIdx] = useState<number | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!resumeData || !resumeData.text) {
    return (
      <div className="max-w-xl mx-auto py-16 sm:py-24 text-center glass rounded-[2.5rem] p-6 sm:p-12 border border-border/60 shadow-xl">
        <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground/30 mx-auto mb-6" />
        <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">No Resume Uploaded</h2>
        <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-md mx-auto italic">
          Upload your resume first to generate real-time ATS scoring, technical breakdown, and priority fixes.
        </p>
        <Button 
          size="lg" 
          className="h-12 sm:h-14 rounded-2xl bg-primary text-white font-bold px-8 sm:px-10 cursor-pointer shadow-lg shadow-primary/20 hover:opacity-95" 
          onClick={() => onNavigate && onNavigate('upload')}
        >
          Upload Resume
        </Button>
      </div>
    );
  }

  if (!atsData || typeof atsData.score !== 'number') {
    return (
      <div className="max-w-xl mx-auto py-16 sm:py-24 text-center glass rounded-[2.5rem] p-6 sm:p-12 border border-amber-500/30 shadow-xl">
        <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500/70 mx-auto mb-6" />
        <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">ATS Audit Unavailable</h2>
        <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-md mx-auto">
          No simulated or fallback scores are shown. Run a live Gemini AI ATS audit against your target role to get your verified 8-factor 100-point breakdown and XYZ bullet rewrites.
        </p>
        <Button 
          size="lg" 
          className="h-12 sm:h-14 rounded-2xl bg-primary text-white font-bold px-8 sm:px-10 cursor-pointer shadow-lg shadow-primary/20 hover:opacity-95" 
          onClick={() => onNavigate && onNavigate('upload')}
        >
          Run Fresh ATS Analysis
        </Button>
      </div>
    );
  }

  const evaluatedRole = atsData.evaluatedRole || resumeData?.targetRole || roadmap?.title?.replace("Learning Roadmap for ", "") || "Target Role";
  const breakdown = Array.isArray(atsData.breakdown) ? atsData.breakdown : [];
  const computedSum = breakdown.length > 0
    ? breakdown.reduce((sum: number, item: any) => sum + (Number(item.score) || 0), 0)
    : atsData.score;
  const score = Math.max(0, Math.min(100, Math.round(computedSum)));

  const normalizedBreakdown = breakdown.map((entry: any) => {
    const maxVal = entry.max || 100;
    const pct = Math.min(100, Math.round(((Number(entry.score) || 0) / maxVal) * 100));
    return {
      ...entry,
      percentage: pct,
      label: `${entry.score}/${maxVal} pts`
    };
  });

  const rawFixes = Array.isArray(atsData.priority_fixes) ? atsData.priority_fixes : [];
  const severityOrder: Record<string, number> = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
  const displayFixes = [...rawFixes].sort((a, b) => {
    return (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99);
  });

  const bulletRewrites: Array<{ section?: string; before: string; after: string; reason: string }> =
    Array.isArray(atsData.bullet_rewrites) ? atsData.bullet_rewrites : [];

  const toggleFix = (index: number) => {
    setResolvedFixes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopyRewrite = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRewriteIdx(idx);
      toast.success("XYZ bullet rewrite copied to clipboard!");
      setTimeout(() => setCopiedRewriteIdx(prev => (prev === idx ? null : prev)), 2000);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-[#10B981]';
    if (val >= 65) return 'text-[#3B82F6]';
    if (val >= 50) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  const getScoringVerdict = (val: number) => {
    if (val >= 85) return 'Top 5% Candidate';
    if (val >= 75) return 'Competitive ATS Match';
    if (val >= 63) return 'Moderate Fit (Needs Metric Boost)';
    if (val >= 49) return 'Needs Optimization (Critical Gaps)';
    return 'Critical ATS Risk (Below Screening Filter)';
  };

  const activeFixesCount = displayFixes.length - Object.values(resolvedFixes).filter(Boolean).length;

  const handleDownloadPdf = () => {
    try {
      setIsExportingPdf(true);
      toast.info("Preparing your comprehensive Career Audit Report (PDF)...");

      const candidateName = user?.displayName || user?.name || resumeData?.parsedData?.name || "Candidate";
      const candidateEmail = user?.email || "";

      generateFullAuditPdf({
        candidateName,
        candidateEmail,
        targetRole: evaluatedRole,
        resumeFilename: resumeData?.filename || "Resume.pdf",
        parsedResume: resumeData?.parsedData,
        atsData: {
          evaluatedRole,
          score,
          market_match: atsData?.market_match || score,
          label: atsData?.label || getScoringVerdict(score),
          breakdown: normalizedBreakdown,
          priority_fixes: displayFixes,
          bullet_rewrites: bulletRewrites
        },
        roadmap
      });

      toast.success("Career Audit Report (PDF) downloaded successfully!");
    } catch (err: any) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 w-full max-w-7xl mx-auto overflow-hidden">
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">
              CAREER AUDIT & ATS ANALYSIS
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Target className="w-3 h-3" />
              Target Role Audited: {evaluatedRole}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2.5 mt-0.5">
            <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0" />
            ATS Optimization Score
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-2xl">
            Target-role strict 8-factor evaluation against <strong className="text-foreground">{evaluatedRole}</strong> benchmarks, exact bullet fixes, and XYZ transformations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <Button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-4 shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.02]"
            title="Download full professional PDF report"
          >
            <Download className={`w-4 h-4 ${isExportingPdf ? 'animate-bounce' : ''}`} />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download Full Report (PDF)'}</span>
          </Button>

          {onNavigate && (
            <Button 
              onClick={() => onNavigate('upload')} 
              variant="outline" 
              className="rounded-xl border-border/60 text-xs font-semibold h-10 px-3.5 gap-1.5 cursor-pointer hover:bg-muted/50"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload New</span>
            </Button>
          )}
        </div>
      </header>

      {/* Primary Score Ring and Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Total Health Summary Card */}
        <Card className="col-span-1 glass border border-border/60 p-4 sm:p-5 flex flex-col justify-between overflow-hidden relative rounded-3xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Cpu className="w-32 h-32 text-primary" />
          </div>
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#2563EB] font-mono">
                  ATS Score Result
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs">
                  Exact sum of all 8 weighted criteria
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black uppercase text-blue-500 block">Market Match</span>
                <span className="text-lg sm:text-xl font-black text-blue-600">{atsData.market_match || score}%</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col items-center justify-center py-4 sm:py-6">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
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
                <span className={`text-4xl sm:text-5xl font-black tracking-tighter ${getScoreColor(score)}`}>{score}</span>
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground block mt-0.5">SCORE / 100</span>
              </div>
            </div>

            <div className="text-center mt-5 w-full max-w-xs space-y-1 bg-muted/40 p-3 rounded-2xl border border-border/40">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground font-mono block">Scoring Verdict</span>
              <span className="text-xs sm:text-sm font-black text-foreground block">
                {atsData.label || getScoringVerdict(score)}
              </span>
            </div>

            <div className="mt-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center max-w-xs">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block leading-tight">
                Evaluated strictly for {evaluatedRole}. Points are deducted for missing KPIs, passive phrasing, and keyword gaps.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown Card */}
        <Card className="col-span-1 lg:col-span-2 glass border border-border/60 p-4 sm:p-5 rounded-3xl">
          <CardHeader className="p-0 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#2563EB] font-mono">
                  8-Factor 100-Point Breakdown
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs">
                  Enterprise rubric weights summing cleanly to {score}/100
                </CardDescription>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 font-mono self-start sm:self-auto">
                Role-Calibrated
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-[360px] sm:h-[400px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={normalizedBreakdown} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="criterion" 
                  type="category" 
                  tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748b' }} 
                  width={155} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                  formatter={(value: any, _name: any, item: any) => [
                    `${item.payload.score} / ${item.payload.max} pts (${value}%)`,
                    item.payload.criterion
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                />
                <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={13}>
                  {normalizedBreakdown.map((entry: any, index: number) => {
                    const barFill = entry.percentage >= 80 ? '#10B981' : entry.percentage >= 60 ? '#2563EB' : entry.percentage >= 45 ? '#F59E0B' : '#EF4444';
                    return <Cell key={`cell-${index}`} fill={barFill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SECTION: 8-FACTOR CRITERION SCORE & DEDUCTION NOTES */}
      {normalizedBreakdown.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {normalizedBreakdown.map((item: any, i: number) => (
            <div key={i} className="p-3.5 rounded-2xl border border-border/60 bg-card/70 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black text-foreground leading-tight">{item.criterion}</span>
                <span className={`text-[11px] font-mono font-black shrink-0 ${
                  item.percentage >= 75 ? 'text-emerald-600' : item.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {item.score}/{item.max}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{item.fix}</p>
            </div>
          ))}
        </div>
      )}

      {/* SECTION: BEFORE VS AFTER XYZ BULLET REWRITE LAB */}
      <Card className="glass border border-border/60 p-4 sm:p-6 rounded-3xl">
        <CardHeader className="p-0 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
            <div>
              <CardTitle className="text-sm sm:text-base font-black tracking-tight text-foreground flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                Before vs After XYZ Bullet Rewrite Lab
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Weak bullets extracted from your resume and rewritten using the Google XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].
              </CardDescription>
            </div>
            <span className="text-[10px] font-black px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-mono self-start sm:self-auto">
              {bulletRewrites.length} XYZ TRANSFORMATIONS
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-3 space-y-4">
          {bulletRewrites.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {bulletRewrites.map((rw, idx) => (
                <div key={idx} className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/70 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                      {rw.section || `Bullet Transformation #${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyRewrite(rw.after, idx)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-border/60 hover:bg-muted/60 text-foreground cursor-pointer transition-colors"
                    >
                      {copiedRewriteIdx === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedRewriteIdx === idx ? "Copied" : "Copy After"}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 font-mono block">
                      Before (From Resume)
                    </span>
                    <p className="text-xs text-foreground/85 leading-relaxed">"{rw.before}"</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/25 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 font-mono block">
                      After (XYZ Formula Rewrite for {evaluatedRole})
                    </span>
                    <p className="text-xs font-semibold text-foreground leading-relaxed">"{rw.after}"</p>
                  </div>

                  {rw.reason && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <strong className="text-foreground/80">ATS Impact:</strong> {rw.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 text-xs text-muted-foreground">
              Run a fresh resume analysis to generate custom Before vs After XYZ bullet rewrites directly from your experience bullets.
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION: PRIORITY ACTIONABLE FIXES */}
      <Card className="glass border border-border/60 p-4 sm:p-6 rounded-3xl">
        <CardHeader className="p-0 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
            <div>
              <CardTitle className="text-sm sm:text-base font-black tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Priority Resume Fixes (Resume-Specific Action Plan)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Specific weaknesses citing bullets, projects, and {evaluatedRole} keyword gaps found in your resume.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-black px-3 py-1 rounded-md bg-blue-500/10 text-blue-600 font-mono">
                {activeFixesCount} ACTION ITEMS REMAINING
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-2 space-y-4">
          {displayFixes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayFixes.map((item: any, index: number) => {
                const isResolved = resolvedFixes[index];
                const sev = item.severity || 'Medium';

                const severityBadgeColors: Record<string, string> = {
                  'Critical': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                  'High': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
                  'Medium': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                  'Low': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                };

                return (
                  <div 
                    key={index} 
                    className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                      isResolved 
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                        : 'bg-card/70 border-border/50 hover:border-primary/30 shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <button 
                          type="button"
                          onClick={() => toggleFix(index)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 mt-0.5 cursor-pointer transition-colors ${
                            isResolved 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'border-muted-foreground/30 text-transparent hover:border-primary bg-background'
                          }`}
                          title={isResolved ? "Mark as pending" : "Mark as resolved"}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${severityBadgeColors[sev] || severityBadgeColors.Medium}`}>
                              {sev} Priority
                            </span>
                            <span className={`text-xs sm:text-sm font-bold tracking-tight ${isResolved ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.problem}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            <strong className="text-foreground/80">Why it matters:</strong> {item.impact}
                          </p>
                        </div>
                      </div>

                      {!isResolved && (
                        <div className="ml-8 bg-primary/5 rounded-xl p-3 border border-primary/10 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                            <Sparkles className="w-3 h-3" />
                            <span>Exact Fix To Apply</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground/90 leading-relaxed">
                            {item.fix}
                          </p>
                        </div>
                      )}
                    </div>

                    {isResolved && (
                      <div className="ml-8 mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Marked as completed in your resume</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 text-xs text-muted-foreground">
              No priority fixes returned yet for this audit.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
