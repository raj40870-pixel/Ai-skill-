const BASE_URL = (import.meta.env.VITE_API_URL || 'https://ais-pre-zzgehztczlcl5evoujectb-435432813811.asia-southeast1.run.app').replace(/\/$/, '');

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Trash2, 
  Cpu,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Clock,
  AlertTriangle,
  History,
  RotateCcw,
  Check,
  Flame,
  Gauge
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { AVAILABLE_GEMINI_MODELS, getActiveAIModel, AIModelOption } from '../services/geminiService';
import { mongoApi } from '../lib/mongoApi';

interface SettingsTabProps {
  userId?: string;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  onNavigate?: (tab: string) => void;
}

export function SettingsTab({ userId, selectedModel = 'gemini-3.7-flash', onModelChange, onNavigate }: SettingsTabProps) {
  const [engineLevel, setEngineLevel] = useState<string>(() => {
    return getActiveAIModel();
  });
  const [notifications, setNotifications] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [resumeCount, setResumeCount] = useState<number>(0);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [usageStats, setUsageStats] = useState<{ analysisCount: number; availableCredits: number; resetDate: string; plan: string; limit: number } | null>(null);

  const HISTORY_LIMIT = 5;

  useEffect(() => {
    if (selectedModel) {
      setEngineLevel(selectedModel);
    }
  }, [selectedModel]);

  useEffect(() => {
    async function loadUsage() {
      if (!userId) {
        setResumeCount(0);
        setLoadingUsage(false);
        return;
      }
      try {
        setLoadingUsage(true);
        const [list, statsRes] = await Promise.all([
          mongoApi.getResumes(userId),
          fetch(`${BASE_URL}/api/users/${userId}/usage`)
        ]);
        setResumeCount(Array.isArray(list) ? list.length : 0);
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setUsageStats(stats);
        }
      } catch (err) {
        console.error("Failed to load quota usage in settings:", err);
      } finally {
        setLoadingUsage(false);
      }
    }
    loadUsage();
  }, [userId]);

  const handleModelSelect = (model: AIModelOption) => {
    // If user clicks a Pro / Locked model, prevent switching & show friendly alert
    if (model.tier === 'pro' && usageStats?.plan !== 'PREMIUM') {
      toast.error(
        `${model.name} is reserved for the Premium Plan. Active model remains on ${AVAILABLE_GEMINI_MODELS.find(m => m.id === engineLevel)?.name || 'Gemini 3.7 Flash'}.`,
        { duration: 4000 }
      );
      return;
    }

    setEngineLevel(model.id);
    localStorage.setItem('careernav_ai_model', model.id);
    if (onModelChange) {
      onModelChange(model.id);
    }
    toast.success(`Active AI engine switched to ${model.name} (Free Tier)`);
  };

  const handleClearCache = async () => {
    try {
      setClearing(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      const model = localStorage.getItem('careernav_ai_model');
      localStorage.clear();
      if (model) {
        localStorage.setItem('careernav_ai_model', model);
      }
      toast.success("Identity vector cache wiped successfully.");
    } catch {
      toast.error("Wipe failed.");
    } finally {
      setClearing(false);
    }
  };

  const historyPercent = Math.min(100, Math.round((resumeCount / HISTORY_LIMIT) * 100));
  const isHistoryLimitReached = resumeCount >= HISTORY_LIMIT;
  
  const analysisLimit = usageStats?.limit || 3;
  const analysisCount = usageStats?.analysisCount || 0;
  const availableCredits = usageStats?.availableCredits ?? (analysisLimit - analysisCount);
  const analysisPercent = usageStats?.plan === 'PREMIUM' ? 100 : Math.min(100, Math.round((availableCredits / analysisLimit) * 100));
  const isAnalysisLimitReached = usageStats?.plan !== 'PREMIUM' && availableCredits <= 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mr-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Platform <span className="text-primary italic">Settings</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Switch AI models, configure plans, and monitor 7-day reset cycles.
          </p>
        </div>
      </header>

      {/* Plans & 7-Day Reset Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Active Plan Card */}
        <div className={`p-6 rounded-3xl bg-card border ${usageStats?.plan === 'PREMIUM' ? 'border-primary/30 bg-primary/[0.02]' : 'border-emerald-500/30 bg-emerald-500/[0.02]'} space-y-4 relative overflow-hidden shadow-xs`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${usageStats?.plan === 'PREMIUM' ? 'bg-primary' : 'bg-emerald-500'} animate-pulse`} />
              <h3 className="font-black text-sm text-foreground">{usageStats?.plan === 'PREMIUM' ? 'Premium Tier Plan' : 'Free Tier Plan'}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-extrabold flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                7-Day Cycle
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-extrabold">
                {usageStats?.plan === 'PREMIUM' ? '$ Premium' : '$0 / Free'}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {usageStats?.plan === 'PREMIUM' 
              ? 'Unlimited resume analyses, deep reasoning Pro models, and priority career intelligence access.'
              : 'Free access to 3 scans every 7 days, ATS scoring, and custom career roadmaps.'}
          </p>

          {/* Live Limit Meter Bars */}
          <div className="space-y-4 pt-2">
            {/* Analysis Limit */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground flex items-center gap-1.5">
                  <span>Credits Available:</span>
                  <span className={isAnalysisLimitReached ? "text-amber-600 font-extrabold" : "text-primary"}>
                    {usageStats?.plan === 'PREMIUM' ? 'Unlimited' : `${availableCredits} / ${analysisLimit}`}
                  </span>
                </span>
                {usageStats?.plan !== 'PREMIUM' && (
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {isAnalysisLimitReached ? "Limit Reached" : `${availableCredits} credits left`}
                  </span>
                )}
              </div>

              {usageStats?.plan !== 'PREMIUM' && (
                <Progress 
                  value={analysisPercent} 
                  className="h-2.5 bg-muted rounded-full overflow-hidden"
                />
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-primary shrink-0" />
                  {isAnalysisLimitReached ? (
                    <span>Resets on: <strong>{usageStats?.resetDate ? new Date(usageStats.resetDate).toLocaleDateString() : '7 days'}</strong></span>
                  ) : (
                    <span>Full refresh every <strong>7 days</strong></span>
                  )}
                </span>
              </div>
            </div>

            {/* History Limit */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground flex items-center gap-1.5">
                  <span>Resume History Slots:</span>
                  <span className={isHistoryLimitReached ? "text-amber-600 font-extrabold" : "text-primary"}>
                    {usageStats?.plan === 'PREMIUM' ? 'Unlimited' : `${resumeCount} / ${HISTORY_LIMIT} Used`}
                  </span>
                </span>
                {usageStats?.plan !== 'PREMIUM' && (
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {isHistoryLimitReached ? "Limit Reached" : `${HISTORY_LIMIT - resumeCount} slots open`}
                  </span>
                )}
              </div>

              {usageStats?.plan !== 'PREMIUM' && (
                <Progress 
                  value={historyPercent} 
                  className="h-2.5 bg-muted rounded-full"
                />
              )}

              {isHistoryLimitReached && usageStats?.plan !== 'PREMIUM' && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Delete old resumes in History to free up slots.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pro Plan - Coming Soon */}
        <div className="p-6 rounded-3xl bg-muted/25 border border-border/80 space-y-4 relative overflow-hidden opacity-95 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-black text-sm text-foreground">Pro Tier (Paid Plan)</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-extrabold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Paid • Coming Soon
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Not Free:</strong> A premium paid tier currently in active development. When launched, it will offer advanced STEM deep reasoning, unlimited resume comparison archives, and interactive mock interview simulators.
            </p>

            <div className="p-3.5 rounded-2xl bg-card border border-border/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Plan Status:</span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Paid Tier (Coming Soon)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Pro Model Access:</span>
                <span className="text-[11px] font-semibold text-primary">Gemini 3.1 Pro (Deep STEM)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Resume Scans:</span>
                <span className="text-[11px] font-semibold text-emerald-600">Unlimited Lifetime</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">AI Audio Interview:</span>
                <span className="text-[11px] font-semibold text-primary">Voice Simulator</span>
              </div>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              <span>Gemini 3.1 Pro Preview</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              <span>Unlimited Resumes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              <span>AI Voice Mock Interview</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
              <span>Direct Recruiter Export</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Switching Section */}
      <Card className="glass border-none rounded-[2.5rem] p-6 sm:p-8 bg-card/60 shadow-xl space-y-6 border border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-xl tracking-tight flex items-center gap-2 text-foreground">
              <Cpu className="w-5 h-5 text-primary" />
              AI Cognitive Model Switcher
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select which free Gemini model to use for resume text extraction, ATS scoring, and roadmap generation.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 self-start sm:self-auto">
            Current: {AVAILABLE_GEMINI_MODELS.find(m => m.id === engineLevel)?.name || engineLevel}
          </span>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_GEMINI_MODELS.map((model) => {
            const isSelected = engineLevel === model.id;
            const isPro = model.tier === 'pro';

            return (
              <div
                key={model.id}
                onClick={() => handleModelSelect(model)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? "bg-primary/5 border-primary shadow-md shadow-primary/10 ring-2 ring-primary/20" 
                    : isPro
                    ? "bg-muted/20 border-border/60 opacity-75 hover:opacity-90"
                    : "bg-card/80 border-border/80 hover:border-primary/40 hover:bg-card"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : isPro
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted/60 text-foreground"
                      }`}>
                        {isPro ? <Lock className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-foreground flex items-center gap-1.5">
                          {model.name}
                          {model.isRecommended && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold">
                              Recommended
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-semibold block">
                          {model.speed}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center gap-1 shadow-xs">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    ) : isPro ? (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Pro Tier
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                        Free Tier
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {model.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border/40 mt-3 text-[11px]">
                  <span className="text-muted-foreground font-medium truncate max-w-[200px]">
                    Best for: <strong className="text-foreground">{model.bestFor.split(',')[0]}</strong>
                  </span>
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    disabled={isPro}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModelSelect(model);
                    }}
                    className={`h-7 px-3 text-[11px] font-bold rounded-xl ${
                      isSelected ? "bg-primary text-primary-foreground" : "cursor-pointer"
                    }`}
                  >
                    {isSelected ? "Selected" : isPro ? "Locked (Pro)" : "Switch Model"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Additional Configuration & Storage Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feedback Tone */}
        <Card className="glass border-none rounded-[2.5rem] p-6 bg-card/60 shadow-xl space-y-4 border border-border/50 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Sound & Haptic Feedback
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Play subtle chime cues when resume analysis completes and weekly roadmap sprints finish.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-muted-foreground">Audio Status</span>
            <Button 
              variant={notifications ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setNotifications(!notifications)}
              className="rounded-full px-5 font-bold text-xs cursor-pointer"
            >
              {notifications ? 'Enabled' : 'Muted'}
            </Button>
          </div>
        </Card>

        {/* Security & Cache */}
        <Card className="glass border-none rounded-[2.5rem] p-6 bg-card/60 shadow-xl space-y-4 border border-border/50 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Local Vector Cache & Storage
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clear temporary browser cached analysis tokens. Cloud history stored in MongoDB remains safe.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-muted-foreground">Temporary Cache</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearCache}
              disabled={clearing}
              className="rounded-xl px-4 font-bold text-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              <span>{clearing ? "Wiping..." : "Clear Cache"}</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
