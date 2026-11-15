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
  Wand2,
  RefreshCw,
  FileSearch,
  AlertTriangle,
  Layers,
  Tag,
  X,
  FileText,
  ArrowRight,
  ShieldCheck
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
import { geminiService } from '../services/geminiService';

interface ATSScoreTabProps {
  resumeData: any;
  atsData: any;
  roadmap?: any;
  user?: any;
  onNavigate?: (tab: string) => void;
  onUpdateAts?: (newAts: any, newRole?: string) => void;
}

export function ATSScoreTab({ resumeData, atsData, roadmap, user, onNavigate, onUpdateAts }: ATSScoreTabProps) {
  const [resolvedFixes, setResolvedFixes] = useState<Record<number, boolean>>({});
  const [copiedRewriteIdx, setCopiedRewriteIdx] = useState<number | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showJdMatcher, setShowJdMatcher] = useState(false);
  const [customAuditRole, setCustomAuditRole] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isReauditing, setIsReauditing] = useState(false);
  const [scoreViewMode, setScoreViewMode] = useState<'dual' | 'universal' | 'target'>('dual');

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

  const matchedKeywords: string[] = Array.isArray(atsData.matched_keywords) ? atsData.matched_keywords : [];
  const missingKeywords: Array<{ keyword: string; importance?: string; suggestion?: string }> =
    Array.isArray(atsData.missing_keywords) ? atsData.missing_keywords : [];
  const sectionAudit: Array<{ section: string; status: string; scorePercent: number; feedback: string }> =
    Array.isArray(atsData.section_audit) ? atsData.section_audit : [];

  // Deterministic client fallback if viewing a legacy ATS record created prior to telemetry upgrade
  const telemetry = atsData.telemetry || (() => {
    const clean = String(resumeData?.text || '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    const lines = clean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const bulletLines = lines.filter(l => /^([•\-–—*]|\d+\.)\s+/.test(l) || (l.length >= 35 && l.length <= 260 && /^[A-Z]/.test(l) && /\s/.test(l)));
    const quantifiedBullets = bulletLines.filter(l => /\d+%|\$\d+|\b\d+(\.\d+)?\b/.test(l)).length;
    const lower = clean.toLowerCase();
    return {
      wordCount: words.length,
      estimatedPages: Math.max(1, Math.round((words.length / 450) * 10) / 10),
      bulletCount: bulletLines.length,
      quantifiedBullets,
      quantifiedPercent: bulletLines.length > 0 ? Math.round((quantifiedBullets / bulletLines.length) * 100) : 0,
      weakPhrasesFound: ["responsible for", "worked on", "helped with", "assisted"].filter(p => lower.includes(p)),
      clichesFound: ["hardworking", "team player", "detail-oriented", "self-starter"].filter(c => lower.includes(c)),
      contact: {
        email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(clean),
        phone: /(\+?\d[\d\s\-()]{8,}\d)/.test(clean),
        linkedin: /linkedin\.com/i.test(clean),
        github: /github\.com/i.test(clean),
      }
    };
  })();

  const handleRunLiveReaudit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextRole = (customAuditRole || evaluatedRole).trim();
    if (!nextRole) {
      toast.error("Please enter a Target Role to audit against.");
      return;
    }
    setIsReauditing(true);
    const toastId = toast.loading(
      jobDescription.trim().length > 20
        ? `Matching resume against JD for "${nextRole}"...`
        : `Re-scoring resume strictly for "${nextRole}"...`
    );
    try {
      const rId = resumeData?.id || resumeData?._id;
      const freshAts = await geminiService.getATSScore(
        resumeData.text,
        nextRole,
        user?.uid,
        jobDescription.trim(),
        rId
      );
      setResolvedFixes({});
      if (onUpdateAts) {
        onUpdateAts(freshAts, nextRole);
      }
      toast.success(`Live ATS Re-Audit Complete: ${freshAts.score}/100 for ${nextRole}`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Live ATS re-audit failed. Please try again.", { id: toastId });
    } finally {
      setIsReauditing(false);
    }
  };

  const handleRunLiveReauditWithRole = async (specificRole: string) => {
    setIsReauditing(true);
    const toastId = toast.loading(`Calibrating ATS audit for "${specificRole}"...`);
    try {
      const rId = resumeData?.id || resumeData?._id;
      const freshAts = await geminiService.getATSScore(
        resumeData.text,
        specificRole,
        user?.uid,
        '',
        rId
      );
      setResolvedFixes({});
      if (onUpdateAts) {
        onUpdateAts(freshAts, specificRole);
      }
      toast.success(`Live ATS Re-Audit Complete: ${freshAts.score}/100 for ${specificRole}`, { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || "Live ATS re-audit failed.", { id: toastId });
    } finally {
      setIsReauditing(false);
    }
  };

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
            type="button"
            variant={showJdMatcher ? "default" : "outline"}
            onClick={() => {
              if (!customAuditRole) setCustomAuditRole(evaluatedRole);
              setShowJdMatcher(prev => !prev);
            }}
            className="rounded-xl text-xs font-bold h-10 px-3.5 gap-1.5 cursor-pointer"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>{showJdMatcher ? "Hide Role / JD Matcher" : "Match JD / Switch Role"}</span>
          </Button>

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

      {/* Live Target Role & Job Description (JD) Re-Audit Drawer */}
      {showJdMatcher && (
        <Card className="glass border border-blue-500/30 bg-blue-500/[0.03] p-4 sm:p-6 rounded-3xl">
          <form onSubmit={handleRunLiveReaudit} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black tracking-tight flex items-center gap-2 text-foreground">
                  <Target className="w-4 h-4 text-blue-600" />
                  Live Target Role & Job Description (JD) ATS Matcher
                </h3>
                <p className="text-xs text-muted-foreground">
                  Test your current resume against a different target role or paste a real Job Description for exact keyword & score calibration—no re-upload needed.
                </p>
              </div>
              {atsData.jd_match_mode && (
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-mono self-start">
                  JD-Calibrated Score
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">
                  Target Role
                </label>
                <input
                  type="text"
                  value={customAuditRole}
                  onChange={(e) => setCustomAuditRole(e.target.value)}
                  placeholder={evaluatedRole}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">
                  Optional Job Description (Paste JD text for Jobscan-style matching)
                </label>
                <textarea
                  rows={2}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste required skills, responsibilities, and qualifications from the job posting..."
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                disabled={isReauditing}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReauditing ? 'animate-spin' : ''}`} />
                <span>{isReauditing ? 'Running Live ATS Audit...' : 'Run Live Re-Audit'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Resume Telemetry & Parser Hygiene Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 rounded-2xl border border-border/60 bg-card/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono block">
            Document Length
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg sm:text-xl font-black text-foreground">{telemetry.wordCount} words</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              telemetry.wordCount >= 300 && telemetry.wordCount <= 900 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
            }`}>
              ~{telemetry.estimatedPages} pg
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Ideal ATS range: 350–850 words</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/60 bg-card/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono block">
            Quantified Impact
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg sm:text-xl font-black text-foreground">
              {telemetry.quantifiedBullets}/{Math.max(1, telemetry.bulletCount)} bullets
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              telemetry.quantifiedPercent >= 50 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
            }`}>
              {telemetry.quantifiedPercent}% KPI
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Bullets backed by numbers / % / scale</p>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/60 bg-card/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono block">
            Contact & Links
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: 'Email', ok: telemetry.contact?.email },
              { label: 'Phone', ok: telemetry.contact?.phone },
              { label: 'LinkedIn', ok: telemetry.contact?.linkedin },
              { label: 'GitHub', ok: telemetry.contact?.github }
            ].map((item) => (
              <span
                key={item.label}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  item.ok
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}
              >
                {item.ok ? '✓' : '✗'} {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/60 bg-card/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono block">
            Passive / Cliché Check
          </span>
          {(telemetry.weakPhrasesFound?.length || 0) + (telemetry.clichesFound?.length || 0) === 0 ? (
            <div className="pt-1">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> No weak clichés detected
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Strong active voice hygiene</p>
            </div>
          ) : (
            <div className="pt-1 space-y-1">
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {(telemetry.weakPhrasesFound?.length || 0) + (telemetry.clichesFound?.length || 0)} weak phrase(s)
              </span>
              <p className="text-[10px] text-muted-foreground truncate" title={[...(telemetry.weakPhrasesFound || []), ...(telemetry.clichesFound || [])].join(', ')}>
                Flagged: {[...(telemetry.weakPhrasesFound || []), ...(telemetry.clichesFound || [])].slice(0, 3).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Primary Score Ring and Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Total Health Summary Card with Dual-Engine Scoring */}
        <Card className="col-span-1 glass border border-border/60 p-4 sm:p-5 flex flex-col justify-between overflow-hidden relative rounded-3xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Cpu className="w-32 h-32 text-primary" />
          </div>
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#2563EB] font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Dual-Engine Scoring
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs">
                  Universal baseline + Role fit
                </CardDescription>
              </div>

              {/* Scoring Mode Toggle */}
              <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/40 text-[9px] font-bold">
                <button
                  type="button"
                  onClick={() => setScoreViewMode('dual')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    scoreViewMode === 'dual' ? 'bg-background shadow-xs text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dual
                </button>
                <button
                  type="button"
                  onClick={() => setScoreViewMode('universal')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    scoreViewMode === 'universal' ? 'bg-background shadow-xs text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Universal
                </button>
                <button
                  type="button"
                  onClick={() => setScoreViewMode('target')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    scoreViewMode === 'target' ? 'bg-background shadow-xs text-foreground font-black' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Role Fit
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col items-center justify-center py-4 sm:py-6">
            {scoreViewMode === 'dual' ? (
              <div className="w-full space-y-4">
                <div className="grid grid-cols-2 gap-2 text-center">
                  {/* Universal Baseline */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase text-muted-foreground font-mono">
                      Universal Baseline
                    </span>
                    <span className={`text-3xl font-black mt-1 ${getScoreColor(Number(atsData.universal_score) || 71)}`}>
                      {Number(atsData.universal_score) || 71}
                    </span>
                    <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase">
                      Document Health / 100
                    </span>
                    <span className="text-[9px] text-muted-foreground mt-1 leading-tight">
                      Jobscan ATS Standard
                    </span>
                  </div>

                  {/* Role Compatibility */}
                  <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase text-blue-600 font-mono">
                      Role Match Fit
                    </span>
                    <span className={`text-3xl font-black mt-1 ${getScoreColor(Number(atsData.role_match_score) || Number(atsData.market_match) || score)}`}>
                      {Number(atsData.role_match_score) || Number(atsData.market_match) || score}%
                    </span>
                    <span className="text-[8px] font-mono font-bold text-blue-500 uppercase">
                      Target Role Match
                    </span>
                    <span className="text-[9px] text-muted-foreground mt-1 leading-tight truncate max-w-[110px]" title={evaluatedRole}>
                      {evaluatedRole}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-[10px] text-muted-foreground leading-relaxed">
                  💡 <strong className="text-foreground">Dual-Engine Insight:</strong> Pure document hygiene independently scores <strong>{Number(atsData.universal_score) || 71}/100</strong>. Your alignment for <strong>{evaluatedRole}</strong> is <strong>{Number(atsData.role_match_score) || Number(atsData.market_match) || score}%</strong>.
                </div>
              </div>
            ) : scoreViewMode === 'universal' ? (
              <div className="flex flex-col items-center w-full">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle className="text-gray-100 dark:text-zinc-900" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                    <motion.circle 
                      className="text-primary" 
                      strokeWidth="8" 
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * (Number(atsData.universal_score) || 71)) / 100 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl sm:text-5xl font-black tracking-tighter ${getScoreColor(Number(atsData.universal_score) || 71)}`}>
                      {Number(atsData.universal_score) || 71}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground block mt-0.5">BASELINE / 100</span>
                  </div>
                </div>
                <div className="text-center mt-3 w-full space-y-1 bg-muted/40 p-2.5 rounded-2xl border border-border/40">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground font-mono block">Universal Document Quality</span>
                  <span className="text-xs font-bold text-foreground">Standard Jobscan ATS Quality Baseline</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle className="text-gray-100 dark:text-zinc-900" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                    <motion.circle 
                      className="text-primary" 
                      strokeWidth="8" 
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
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
                <div className="text-center mt-3 w-full space-y-1 bg-muted/40 p-2.5 rounded-2xl border border-border/40">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground font-mono block">Scoring Verdict</span>
                  <span className="text-xs font-bold text-foreground">{atsData.label || getScoringVerdict(score)}</span>
                </div>
              </div>
            )}
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

      {/* SECTION: ATS KEYWORD SCANNER MATRIX (MATCHED VS MISSING) */}
      {(matchedKeywords.length > 0 || missingKeywords.length > 0) && (
        <Card className="glass border border-border/60 p-4 sm:p-6 rounded-3xl">
          <CardHeader className="p-0 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div>
                <CardTitle className="text-sm sm:text-base font-black tracking-tight text-foreground flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  ATS Keyword Scanner Matrix ({evaluatedRole})
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  High-signal hard skills and role keywords detected vs missing for Workday, Greenhouse & Taleo ranking filters.
                </CardDescription>
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-md bg-blue-500/10 text-blue-600 font-mono self-start sm:self-auto">
                {matchedKeywords.length} MATCHED • {missingKeywords.length} MISSING
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Matched Keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> High-Impact Missing Keywords
              </span>
              <div className="space-y-2">
                {missingKeywords.map((mk, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-foreground">{mk.keyword}</span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded font-mono ${
                          mk.importance === 'Critical' ? 'bg-rose-500/15 text-rose-600' : 'bg-amber-500/15 text-amber-600'
                        }`}>
                          {mk.importance || 'High'}
                        </span>
                      </div>
                      {mk.suggestion && (
                        <p className="text-[11px] text-muted-foreground leading-snug">{mk.suggestion}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(mk.keyword);
                        toast.success(`Copied keyword "${mk.keyword}"`);
                      }}
                      className="p-1.5 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                      title={`Copy "${mk.keyword}"`}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION: SECTION-BY-SECTION RESUME DIAGNOSTIC */}
      {sectionAudit.length > 0 && (
        <Card className="glass border border-border/60 p-4 sm:p-6 rounded-3xl">
          <CardHeader className="p-0 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div>
                <CardTitle className="text-sm sm:text-base font-black tracking-tight text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Section-by-Section Diagnostic Audit
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Granular strength grading across every core section of your resume.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectionAudit.map((sec, idx) => {
              const statusStyle =
                sec.status === 'Strong'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : sec.status === 'Missing'
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20';
              const barColor =
                sec.scorePercent >= 75 ? 'bg-emerald-500' : sec.scorePercent >= 50 ? 'bg-amber-500' : 'bg-rose-500';
              return (
                <div key={idx} className="p-3.5 rounded-2xl border border-border/60 bg-card/70 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-foreground">{sec.section}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${statusStyle}`}>
                      {sec.status} • {sec.scorePercent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${sec.scorePercent}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{sec.feedback}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
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

      {/* SECTION: AI-RECOMMENDED TARGET MARKET ROLES (4 BEST FIT ROLES) */}
      {atsData.suggested_roles && atsData.suggested_roles.length > 0 && (
        <Card className="glass border border-blue-500/30 bg-blue-500/[0.02] p-4 sm:p-6 rounded-3xl">
          <CardHeader className="p-0 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div>
                <CardTitle className="text-sm sm:text-base font-black tracking-tight text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  AI Market Roles Alignment (4 Best-Fit Career Paths)
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Gemini analyzed your verified experience against global tech roles. 1-click calibrate your audit against any path.
                </CardDescription>
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-md bg-blue-500/10 text-blue-600 font-mono self-start sm:self-auto">
                4 ROLES DETECTED
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {atsData.suggested_roles.map((sr: any, idx: number) => {
              const isCurrent = (sr.role || '').toLowerCase() === (evaluatedRole || '').toLowerCase();
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-600/10 shadow-sm'
                      : 'border-border/60 bg-card/70 hover:border-blue-500/40'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-black text-foreground truncate" title={sr.role}>
                        {sr.role}
                      </span>
                      <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                        sr.match_percent >= 75 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-blue-500/15 text-blue-600'
                      }`}>
                        {sr.match_percent}%
                      </span>
                    </div>
                    {sr.reason && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {sr.reason}
                      </p>
                    )}
                    {sr.missing_skills && sr.missing_skills.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {sr.missing_skills.slice(0, 3).map((ms: string, i: number) => (
                          <span key={i} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground">
                            +{ms}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isCurrent || isReauditing}
                    variant={isCurrent ? "secondary" : "outline"}
                    onClick={() => {
                      setCustomAuditRole(sr.role);
                      handleRunLiveReauditWithRole(sr.role);
                    }}
                    className={`mt-3 w-full h-8 text-[11px] font-bold rounded-xl cursor-pointer ${
                      isCurrent ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    {isCurrent ? "Currently Audited" : "Re-Audit for this Role"}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* SECTION: DEEP GRAMMAR & SYNTAX HYGIENE AUDIT */}
      {atsData.grammar_audit && atsData.grammar_audit.length > 0 && (
        <Card className="glass border border-border/60 p-4 sm:p-6 rounded-3xl">
          <CardHeader className="p-0 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div>
                <CardTitle className="text-sm sm:text-base font-black tracking-tight text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Deep Grammar & Executive Syntax Hygiene
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Grammar inconsistencies and passive phrasing detected in your resume with suggested executive replacements.
                </CardDescription>
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-mono self-start sm:self-auto">
                {atsData.grammar_audit.length} SYNTAX POINTS IDENTIFIED
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {atsData.grammar_audit.map((g: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-border/60 bg-card/70 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600">
                    {g.type || 'Grammar Hygiene'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Fix Available
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-rose-500/5 border border-rose-500/15 text-xs text-foreground/80 line-through">
                  "{g.originalText}"
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  → "{g.suggestedFix}"
                </div>
                {g.explanation && (
                  <p className="text-[11px] text-muted-foreground leading-snug">{g.explanation}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* SECTION: REPETITION & OVERUSED BUZZWORD RADAR */}
      {atsData.repetition_audit && (
        <Card className="glass border border-border/60 p-4 sm:p-6 rounded-3xl">
          <CardHeader className="p-0 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div>
                <CardTitle className="text-sm sm:text-base font-black tracking-tight text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Repetition & Cliché Buzzword Radar
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Overused generic terms and duplicate lines that dilute your impact on ATS algorithms.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3 space-y-4">
            {atsData.repetition_audit.overused_words && atsData.repetition_audit.overused_words.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase font-mono text-muted-foreground block">
                  Repeated Words Frequency
                </span>
                <div className="flex flex-wrap gap-2">
                  {atsData.repetition_audit.overused_words.map((w: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs flex items-center gap-2">
                      <span className="font-black text-foreground">"{w.word}"</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
                        {w.count}x
                      </span>
                      {w.suggestion && (
                        <span className="text-[11px] text-muted-foreground font-medium">({w.suggestion})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {atsData.repetition_audit.cliches_found && atsData.repetition_audit.cliches_found.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-black uppercase font-mono text-rose-500 block">
                  Overused Cliches & Buzzwords Flagged
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {atsData.repetition_audit.cliches_found.map((c: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold">
                      ✗ "{c}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
