import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Shield, 
  Info, 
  Mail, 
  Sparkles, 
  Globe, 
  Target, 
  Scale, 
  Zap, 
  TrendingUp, 
  Copy, 
  Check, 
  ExternalLink, 
  GraduationCap, 
  Github, 
  Code2, 
  MessageCircle,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type ModalType = 'terms' | 'about' | 'privacy' | 'contact' | null;

interface LegalAndInfoModalProps {
  type: ModalType;
  onClose: () => void;
}

export function LegalAndInfoModal({ type, onClose }: LegalAndInfoModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!type) return null;

  const developerName = "Kamaljit";
  const developerEmail = "kamaljit444501@gmail.com";
  const developerEducation = "BCA, Lovely Professional University (2026)";
  const developerGithub = "https://github.com/raj40870-pixel";
  const developerLinkedin = "https://linkedin.com/in/raj-kumar-2254a7371";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    setCopiedEmail(true);
    toast.success("Email copied: kamaljit444501@gmail.com");
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl max-h-[88vh] bg-background border border-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-border/80 bg-card/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                {type === 'terms' && <Scale className="w-5 h-5" />}
                {type === 'about' && <Info className="w-5 h-5" />}
                {type === 'privacy' && <Shield className="w-5 h-5" />}
                {type === 'contact' && <Mail className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {type === 'terms' && "Terms of Service"}
                  {type === 'about' && "About Developer & Website"}
                  {type === 'privacy' && "Privacy Policy"}
                  {type === 'contact' && "Contact & Inquiries"}
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Career Navigation building by {developerName} from {developerEducation}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full w-9 h-9 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-muted-foreground">
            
            {/* 1. CONTACT & INQUIRIES (PURE CONTENT - NO FORMS) */}
            {type === 'contact' && (
              <div className="space-y-6">
                {/* Developer Profile Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-black text-2xl flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                        K
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-foreground">{developerName}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-bold">
                            Creator & Developer
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span>{developerEducation}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={developerLinkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 text-[#0A66C2] text-xs font-bold shadow-xs hover:bg-[#0A66C2]/15 transition-all cursor-pointer"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>

                      <a
                        href={developerGithub}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/40 text-foreground text-xs font-bold shadow-xs hover:bg-muted/50 transition-all cursor-pointer"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub Profile</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </a>

                      <a
                        href={`mailto:${developerEmail}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email Me</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-foreground/85 pt-2 border-t border-border/60">
                    This website was created by <strong>{developerName}</strong>, a student pursuing <strong>BCA</strong> at <strong>Lovely Professional University (2026)</strong>.
                  </p>
                </div>

                {/* Direct Message via Email Content Box */}
                <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <h4>How to Reach Me for Issues or Inquiries</h4>
                  </div>

                  <p className="text-xs leading-relaxed">
                    If you encounter any <strong>error</strong>, <strong>bug</strong>, or <strong>issue with the content</strong> on this website, or if you have any questions or feedback regarding the platform, please message me directly via email. I will review and fix any issues promptly.
                  </p>

                  {/* Email & GitHub Details Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Email Address</span>
                        <a href={`mailto:${developerEmail}`} className="text-xs font-mono font-bold text-primary hover:underline block mt-0.5">
                          {developerEmail}
                        </a>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyEmail}
                        className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1 cursor-pointer shrink-0"
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedEmail ? "Copied" : "Copy"}</span>
                      </Button>
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">GitHub Projects</span>
                        <a href={developerGithub} target="_blank" rel="noreferrer" className="text-xs font-bold text-foreground hover:text-primary flex items-center gap-1 mt-0.5">
                          <span>github.com/raj40870-pixel</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </a>
                      </div>
                      <a
                        href={developerGithub}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-card border border-border hover:bg-muted text-foreground cursor-pointer"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Projects & Socials Note */}
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 text-xs leading-relaxed space-y-2">
                  <p>
                    💡 You can also check out my GitHub profile at <a href={developerGithub} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">https://github.com/raj40870-pixel</a> to see all the projects and code I have built so far.
                  </p>
                  <p>
                    🔗 Connect with me on LinkedIn: <a href={developerLinkedin} target="_blank" rel="noreferrer" className="text-[#0A66C2] font-bold hover:underline">https://linkedin.com/in/raj-kumar-2254a7371</a>
                  </p>
                </div>
              </div>
            )}

            {/* 2. ABOUT DEVELOPER & WEBSITE */}
            {type === 'about' && (
              <div className="space-y-6">
                {/* Developer Profile Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-black text-2xl flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                        K
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-foreground">{developerName}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-bold">
                            Creator & Developer
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span>{developerEducation}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={developerLinkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 text-[#0A66C2] text-xs font-bold shadow-xs hover:bg-[#0A66C2]/15 transition-all cursor-pointer"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>

                      <a
                        href={developerGithub}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/40 text-foreground text-xs font-bold shadow-xs hover:bg-muted/50 transition-all cursor-pointer"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub Profile</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </a>

                      <a
                        href={`mailto:${developerEmail}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email Me</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-foreground/85 pt-2 border-t border-border/60">
                    Hello! I am <strong>{developerName}</strong>, a student pursuing my <strong>BCA</strong> at <strong>Lovely Professional University (2026)</strong>. I created this Career Navigation platform to provide students and engineers with real market salary benchmarks, ATS resume scoring, and structured learning roadmaps.
                  </p>
                </div>

                {/* Key Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2 font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-foreground text-xs">Salary Telemetry</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Clear compensation matrices in Lakhs Per Month (LPM) and USD.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2 font-bold">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-foreground text-xs">Weekly Sprints</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Structured milestone steps to bridge technical skill gaps.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2 font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-foreground text-xs">ATS Resume Audits</h4>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Instant keyword and formatting checks for job applications.
                    </p>
                  </div>
                </div>

                {/* Direct Contact Notice */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-foreground block">Have questions or found an error?</span>
                    <span className="text-muted-foreground">Message me directly via email at <strong className="text-primary font-mono">{developerEmail}</strong>.</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyEmail}
                    className="shrink-0 rounded-xl text-xs font-bold gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? "Copied" : "Copy Email"}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* 3. TERMS OF SERVICE */}
            {type === 'terms' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    1. Website & Author Information
                  </h3>
                  <p className="text-xs leading-relaxed">
                    Career Navigation AI is an academic and professional project created, developed, and maintained by <strong>{developerName}</strong>, a student of BCA at <strong>Lovely Professional University (2026)</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-emerald-500/30 bg-emerald-500/[0.02] space-y-2">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    2. Free Plan Quotas, 5-Resume Limit & 7-Day Refresh Policy
                  </h3>
                  <p className="text-xs leading-relaxed">
                    All registered users receive 100% free access to core AI resume analysis and career roadmaps under our Free Tier:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground pt-1">
                    <li><strong>Maximum 5 Resumes Capacity:</strong> Each account can upload, analyze, and save up to a maximum of <strong>5 resumes</strong> in their history simultaneously.</li>
                    <li><strong>7-Day Automatic Quota Return:</strong> If you reach the 5-resume limit, your free scan quota automatically refreshes after <strong>7 days</strong>. You can return after 7 days to perform new resume analyses.</li>
                    <li><strong>Instant History Slot Recovery:</strong> If you wish to analyze a new resume immediately without waiting for the 7-day period, you must delete an older resume from your <strong>History</strong> tab to free up a storage slot.</li>
                    <li><strong>Fast 2–5 Seconds Instant AI Scan:</strong> Every document is processed and parsed in <strong>2 to 5 seconds</strong> using optimized Gemini AI.</li>
                    <li><strong>Permanent Cloud Storage:</strong> Stored resumes, ATS scores, and personalized 6-month roadmaps are permanently retained in your cloud account with zero expiration.</li>
                    <li><strong>Complimentary AI Models:</strong> Full access to switch between <strong>Gemini 3.7 Flash</strong>, <strong>Gemini 3.1 Flash Lite</strong>, and <strong>Gemini Flash Latest</strong>.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-primary/30 bg-primary/[0.02] space-y-2">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    3. Pro Plan Status (Paid Tier • Coming Soon)
                  </h3>
                  <p className="text-xs leading-relaxed">
                    The <strong>Pro Plan is a PAID subscription tier</strong> that is currently in development and marked as <strong>"Coming Soon"</strong>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground pt-1">
                    <li><strong>Not Free:</strong> The Pro Plan will be a paid premium upgrade when officially released.</li>
                    <li><strong>Upcoming Features:</strong> Will include <strong>Gemini 3.1 Pro</strong> for deep STEM system reasoning, unlimited lifetime resume archives, AI audio mock interview practice, and direct recruiter exports.</li>
                    <li><strong>Current Status:</strong> No payments, credit cards, or subscription fees are collected today. All active platform features remain completely free under the Free Plan.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <h3 className="font-bold text-foreground text-sm">4. Model Switching & Permission Rules</h3>
                  <p className="text-xs leading-relaxed">
                    Users can switch freely between all supported Free AI models in Settings. Advanced models designated as Pro Tier (e.g. Gemini 3.1 Pro) are locked with clear guidance until the Pro Plan is released, ensuring stability without system errors.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <h3 className="font-bold text-foreground text-sm">5. Content & Guidance Disclaimer</h3>
                  <p className="text-xs leading-relaxed">
                    Salary benchmarks and roadmap recommendations are generated using real-time search grounding for career planning purposes. Actual hiring decisions and compensations depend on individual company standards.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <h3 className="font-bold text-foreground text-sm">6. Error Reporting & Feedback</h3>
                  <p className="text-xs leading-relaxed">
                    If you encounter any bug, quota discrepancy, or issue on this website, please email <strong>{developerName}</strong> at <strong className="text-primary font-mono">{developerEmail}</strong> for prompt resolution.
                  </p>
                </div>
              </div>
            )}

            {/* 4. PRIVACY POLICY */}
            {type === 'privacy' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <h3 className="font-bold text-foreground text-sm">1. Resume Privacy</h3>
                  <p className="text-xs leading-relaxed">
                    Your uploaded resume content is used solely to generate your ATS score and roadmap. It is not shared, rented, or sold to third parties.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <h3 className="font-bold text-foreground text-sm">2. Inquiries & Data Privacy</h3>
                  <p className="text-xs leading-relaxed">
                    For any questions regarding your data or to report content concerns, please contact <strong className="text-primary font-mono">{developerEmail}</strong>.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="px-6 sm:px-8 py-4 border-t border-border bg-card/60 flex items-center justify-between shrink-0">
            <span className="text-xs text-muted-foreground font-medium">
              Built by Kamaljit (BCA • Lovely Professional University, 2026)
            </span>
            <Button
              onClick={onClose}
              className="rounded-xl h-9 px-5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold cursor-pointer"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
