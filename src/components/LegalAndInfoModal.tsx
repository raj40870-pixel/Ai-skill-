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
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    1. Agreement to Terms
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    By accessing or using Career Navigation AI, developed by <strong>{developerName}</strong> ({developerEducation}), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    2. Service Description & Free Tier Usage
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Career Navigation AI provides AI-driven resume analysis, ATS scoring, and career roadmaps. All core features are currently provided free of charge under the following conditions:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground pt-1">
                    <li><strong>Account Capacity:</strong> Users are limited to 5 active resume analysis slots at any time.</li>
                    <li><strong>Quota Refresh:</strong> Free analysis quotas refresh every 7 days, or immediately upon manual deletion of old history records.</li>
                    <li><strong>AI Accuracy:</strong> While we use advanced Gemini models, all data, scores, and roadmaps are provided for guidance only and do not guarantee employment.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    3. Real Email Integrity & Account Security
                  </h3>
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">The Integrity Deal:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      To maintain a high-quality community, we enforce a strict <strong>Real Email Policy</strong>. Deal: Use a real email, get real career intelligence.
                    </p>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground pt-1">
                    <li><strong>Real Emails Only:</strong> Strictly one account is permitted per permanent email address from <strong>Gmail, Hotmail, or Outlook</strong>. All other email providers are strictly blocked.</li>
                    <li><strong>Automatic Purging:</strong> Any account identified using a "temp-mail" or "disposable email" service will be <strong>automatically and permanently deleted</strong> by our AI engine without prior notice.</li>
                    <li><strong>Anti-Fake Policy:</strong> Creation of fake, automated, or bot accounts is strictly forbidden. Gibberish names or accounts created with suspicious patterns will be purged during system boot.</li>
                    <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your credentials. Sharing accounts or attempting to bypass quota limits is prohibited.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-primary/30 bg-primary/[0.02] space-y-3">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    4. Intellectual Property & AI Models
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    The platform design, logos, and proprietary algorithms are the property of the developer. The platform utilizes Google's Gemini models for text processing and analysis.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                    <X className="w-4 h-4 text-destructive" />
                    5. Termination & Liability
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users of the service, us, or third parties.
                  </p>
                </div>
              </div>
            )}

            {/* 4. PRIVACY POLICY */}
            {type === 'privacy' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    1. Information Collection
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    We collect minimal information required to provide our career services:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground pt-1">
                    <li><strong>Account Data:</strong> Name, Email address, and secure password hashes.</li>
                    <li><strong>Professional Data:</strong> Resume files (PDF/Word/Images) and the text extracted from them for analysis.</li>
                    <li><strong>Usage Data:</strong> Analytics on feature usage to improve the AI response quality.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                    <Zap className="w-4 h-4 text-amber-500" />
                    2. Use of Information
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Your data is used strictly for:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground pt-1">
                    <li>Generating your ATS score and personalized learning roadmaps.</li>
                    <li>Securing your account and preventing duplicate or bot registrations.</li>
                    <li>Providing personalized salary benchmarks and market trends.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                    <Globe className="w-4 h-4 text-blue-500" />
                    3. Data Security & Third Parties
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    We implement industry-standard security measures including SSL/TLS encryption and secure hashing. We utilize Google's Gemini API to process your career data; however, your data is never sold to third-party advertisers.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-emerald-500/30 bg-emerald-500/[0.01] space-y-3">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                    <Target className="w-4 h-4 text-emerald-500" />
                    4. Your Rights (Data Control)
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    You maintain full control over your professional data. You can delete your resume history at any time, which permanently removes the associated analysis and files from our active database. For full account deletion, please contact the developer directly.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
                  <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Contact Privacy Officer</h3>
                  <p className="text-[11px] leading-relaxed">
                    For any privacy-related inquiries or to report data concerns, please contact <strong>{developerName}</strong> at <strong className="text-primary font-mono">{developerEmail}</strong>.
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
