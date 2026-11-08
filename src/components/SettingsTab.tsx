const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

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
import { mongoApi } from '../lib/mongoApi';

interface SettingsTabProps {
  userId?: string;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  onNavigate?: (tab: string) => void;
}

export function SettingsTab({ userId, onNavigate }: SettingsTabProps) {
  const [notifications, setNotifications] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [resumeCount, setResumeCount] = useState<number>(0);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [usageStats, setUsageStats] = useState<{ analysisCount: number; availableCredits: number; resetDate: string; plan: string; limit: number } | null>(null);

  const HISTORY_LIMIT = 3;

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
  const isHistoryLimitReached = usageStats?.plan !== 'PREMIUM' && usageStats?.plan !== 'ADMIN' && usageStats?.plan !== 'ENTERPRISE_ADMIN' && resumeCount >= HISTORY_LIMIT;
  
  const analysisLimit = usageStats?.limit || 3;
  const analysisCount = usageStats?.analysisCount || 0;
  const availableCredits = usageStats?.availableCredits ?? (analysisLimit - analysisCount);
  const isUnlimited = usageStats?.plan === 'PREMIUM' || usageStats?.plan === 'ADMIN' || usageStats?.plan === 'ENTERPRISE_ADMIN';
  const analysisPercent = isUnlimited ? 100 : Math.min(100, Math.round((availableCredits / analysisLimit) * 100));
  const isAnalysisLimitReached = !isUnlimited && availableCredits <= 0;

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
        {/* Free Plan / Active Quota Meter (Full Width since Pro card removed) */}
        <div className={`col-span-1 md:col-span-2 p-6 rounded-3xl bg-card border ${isUnlimited ? 'border-primary/30 bg-primary/[0.02]' : 'border-emerald-500/30 bg-emerald-500/[0.02]'} space-y-4 relative overflow-hidden shadow-xs`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isUnlimited ? 'bg-primary' : 'bg-emerald-500'} animate-pulse`} />
              <h3 className="font-black text-sm text-foreground">
                {(usageStats?.plan === 'ADMIN' || usageStats?.plan === 'ENTERPRISE_ADMIN') ? 'Founder / System Administrator' : usageStats?.plan === 'PREMIUM' ? 'Premium Tier Plan' : 'Standard Free Plan'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-extrabold flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                {(usageStats?.plan === 'ADMIN' || usageStats?.plan === 'ENTERPRISE_ADMIN') ? 'Unlimited Bypass' : '7-Day Cycle'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-extrabold">
                {(usageStats?.plan === 'ADMIN' || usageStats?.plan === 'ENTERPRISE_ADMIN') ? 'Founder Admin' : usageStats?.plan === 'PREMIUM' ? '$ Premium' : '$0 / Free'}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            {(usageStats?.plan === 'ADMIN' || usageStats?.plan === 'ENTERPRISE_ADMIN') 
              ? 'Complete system administrative access. Analysis bypass enabled. All history limits removed.'
              : usageStats?.plan === 'PREMIUM' 
              ? 'Unlimited resume analyses, deep reasoning Pro models, and priority career intelligence access.'
              : 'Free access to 3 scans every 7 days, ATS scoring, and custom career roadmaps.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Analysis Limit */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground flex items-center gap-1.5">
                  <span>Credits Available:</span>
                  <span className={isAnalysisLimitReached ? "text-amber-600 font-extrabold" : "text-primary"}>
                    {isUnlimited ? 'Unlimited' : `${availableCredits} / ${analysisLimit}`}
                  </span>
                </span>
                {!isUnlimited && (
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {isAnalysisLimitReached ? "Limit Reached" : `${availableCredits} credits left`}
                  </span>
                )}
              </div>

              {!isUnlimited && (
                <Progress 
                  value={analysisPercent} 
                  className="h-2.5 bg-muted rounded-full overflow-hidden"
                />
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-primary shrink-0" />
                  {isUnlimited ? (
                    <span>Administrative <strong>Always Active</strong></span>
                  ) : isAnalysisLimitReached ? (
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
                    {isUnlimited ? 'Unlimited' : `${resumeCount} / ${HISTORY_LIMIT} Used`}
                  </span>
                </span>
                {!isUnlimited && (
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {isHistoryLimitReached ? "Limit Reached" : `${HISTORY_LIMIT - resumeCount} slots open`}
                  </span>
                )}
              </div>

              {!isUnlimited && (
                <Progress 
                  value={historyPercent} 
                  className="h-2.5 bg-muted rounded-full"
                />
              )}

              {isHistoryLimitReached && !isUnlimited && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Delete old resumes in History to free up slots.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



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
