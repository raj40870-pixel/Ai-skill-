import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Search, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  History, 
  Zap, 
  Shield, 
  Star,
  ChevronDown,
  ChevronUp,
  Github,
  Linkedin,
  Upload,
  Sparkles,
  AlertTriangle,
  Check,
  Loader2,
  RefreshCw,
  LifeBuoy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getUserAvatar, getUserCleanName } from '../lib/utils';
import { LegalAndInfoModal, ModalType } from './LegalAndInfoModal';
import { SupportDeskModal } from './SupportDeskModal';
import { toast } from 'sonner';

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const SAMPLE_RESUME_TEXT = `Alex Morgan
Senior Full Stack Engineer | alex.morgan@email.com | San Francisco, CA | linkedin.com/in/alexmorgan

PROFESSIONAL SUMMARY
Results-driven Full Stack Engineer with 4+ years of experience designing scalable microservices, high-concurrency web applications, and cloud-native systems. Proficient in React, Node.js, TypeScript, PostgreSQL, and AWS.

EXPERIENCE
Senior Software Engineer | CloudTech Solutions | 2022 - Present
- Architected a distributed messaging pipeline processing 10M+ daily events using Node.js, Kafka, and Redis, reducing latency by 42%.
- Led frontend modernization migrating legacy dashboard to React 18, Vite, and Tailwind CSS, improving Core Web Vitals to 98/100.
- Implemented CI/CD automated deployments with Docker and GitHub Actions, cutting release cycles from 3 days to 45 minutes.

Software Engineer | NextGen Apps | 2020 - 2022
- Developed responsive customer portal in TypeScript and React with real-time analytics.
- Designed RESTful and GraphQL APIs in Express and PostgreSQL handling 5,000 requests/sec.
- Mentored 4 junior engineers on clean code and automated testing with Jest.

EDUCATION
B.S. in Computer Science | California State University | 2016 - 2020

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML5/CSS3
Frameworks & Libraries: React, Node.js, Express, Next.js, Tailwind CSS
Cloud & DevOps: Docker, AWS (S3, EC2, Lambda), CI/CD, Git, Redis, PostgreSQL`;

interface LandingPageProps {
  onStart: () => void;
  user?: any;
  onGoToDashboard?: () => void;
  hideNavbar?: boolean;
  onUploadSuccess?: (data: { text: string; filename: string; userId: string }) => void;
}

export function LandingPage({ onStart, user, onGoToDashboard, hideNavbar = false, onUploadSuccess }: LandingPageProps) {
  const [modalType, setModalType] = React.useState<ModalType>(null);
  const [isSupportDeskOpen, setIsSupportDeskOpen] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanStepIndex, setScanStepIndex] = React.useState(0);
  const [scanResult, setScanResult] = React.useState<any>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [cachedPayload, setCachedPayload] = React.useState<{ text: string; filename: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const scanSteps = [
    "Reading file & extracting clean text...",
    "Auditing typography, headers & contact details...",
    "Scanning keywords for role alignment & strict ATS...",
    "Generating instant diagnostic preview..."
  ];

  const prepareFilePayload = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        let mime = file.type || 'application/pdf';
        if (file.name.toLowerCase().endsWith('.pdf')) mime = 'application/pdf';
        else if (file.name.toLowerCase().endsWith('.docx')) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        resolve({ base64, mimeType: mime });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const processResumeFile = async (file: File) => {
    if (!file) return;

    // Strict authentication check: Unauthenticated users MUST register/sign in first
    if (!user || !user.uid || user.email === 'guest@careernav.ai') {
      toast.error("Please sign in or create an account to analyze your resume.");
      onStart();
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size exceeds 25MB limit.");
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      toast.error("Please upload a PDF, Word DOCX, or Photo (JPG/PNG).");
      return;
    }

    setIsScanning(true);
    setScanStepIndex(0);
    setScanResult(null);

    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => (prev + 1) % scanSteps.length);
    }, 1200);

    try {
      const { base64, mimeType } = await prepareFilePayload(file);
      const res = await fetch(`${BASE_URL}/api/resume/parse-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mimeType, filename: file.name })
      });
      const data = await res.json();
      if (!res.ok || !data.text) {
        throw new Error(data.error || "Failed to extract resume text.");
      }

      clearInterval(stepInterval);
      setCachedPayload({ text: data.text, filename: file.name });

      // Calculate instant preview metrics
      const wordCount = data.text.split(/\s+/).length;
      const lower = data.text.toLowerCase();
      const hasMetrics = /\d+[\%kKmM\+]|\$\d+/.test(data.text);
      const hasLinkedin = lower.includes('linkedin.com');
      const hasGithub = lower.includes('github.com');
      
      let baseScore = 62;
      if (wordCount >= 250 && wordCount <= 750) baseScore += 8;
      if (hasMetrics) baseScore += 10;
      if (hasLinkedin) baseScore += 5;
      if (hasGithub) baseScore += 5;
      baseScore = Math.min(94, Math.max(48, baseScore));

      const missingKeywords: string[] = [];
      if (!lower.includes('ci/cd') && !lower.includes('docker')) missingKeywords.push('Docker / CI/CD');
      if (!lower.includes('scalability') && !lower.includes('architecture')) missingKeywords.push('System Scalability');
      if (!lower.includes('cloud') && !lower.includes('aws') && !lower.includes('gcp')) missingKeywords.push('Cloud Architecture');
      if (!lower.includes('testing') && !lower.includes('jest') && !lower.includes('cypress')) missingKeywords.push('Automated Testing');
      if (missingKeywords.length === 0) missingKeywords.push('System Design', 'Performance Metrics');

      setScanResult({
        score: baseScore,
        grade: baseScore >= 80 ? 'A-' : baseScore >= 70 ? 'B' : baseScore >= 60 ? 'C+' : 'D',
        wordCount,
        formatScore: 92,
        keywordScore: baseScore >= 75 ? 78 : 55,
        impactScore: hasMetrics ? 82 : 46,
        missingKeywords: missingKeywords.slice(0, 4),
        filename: file.name
      });
      toast.success("Resume scanned successfully!");
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error("Instant scan error:", err);
      toast.error(err.message || "Failed to scan file. You can try the sample resume.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSampleResume = () => {
    if (!user || !user.uid || user.email === 'guest@careernav.ai') {
      toast.info("Please sign up or log in first to test sample resume analysis.");
      onStart();
      return;
    }

    setIsScanning(true);
    setScanStepIndex(0);
    setScanResult(null);

    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => (prev + 1) % scanSteps.length);
    }, 600);

    setTimeout(() => {
      clearInterval(stepInterval);
      setIsScanning(false);
      setCachedPayload({ text: SAMPLE_RESUME_TEXT, filename: "Alex_Morgan_Senior_Engineer_Resume.pdf" });
      setScanResult({
        score: 84,
        grade: 'A',
        wordCount: 310,
        formatScore: 96,
        keywordScore: 88,
        impactScore: 82,
        missingKeywords: ['Kubernetes', 'GraphQL Federation', 'Distributed Tracing'],
        filename: "Alex_Morgan_Senior_Engineer_Resume.pdf"
      });
      toast.success("Loaded sample engineering resume!");
    }, 1800);
  };

  const handleUnlockFullAudit = () => {
    if (!user || !user.uid || user.email === 'guest@careernav.ai') {
      toast.error("Please sign in or create an account to start career analysis.");
      onStart();
      return;
    }

    if (cachedPayload && onUploadSuccess) {
      onUploadSuccess({
        text: cachedPayload.text,
        filename: cachedPayload.filename,
        userId: user.uid
      });
    } else {
      onStart();
    }
  };
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* SECTION 1 — GLASS NAVBAR */}
      {!hideNavbar && (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-7xl glass rounded-full px-6 py-3 flex items-center justify-between border border-white/20 shadow-lg backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
                <Target className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Career Nav AI
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
              <a href="#testimonials" className="hover:text-primary transition-colors">About</a>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-xl border border-border/40 max-w-[180px]">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-100 shrink-0 shadow-inner">
                      <img 
                        src={getUserAvatar(user.email, user.displayName, user.photoURL)} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider truncate">
                      {getUserCleanName(user)}
                    </span>
                  </div>
                  <Button 
                    onClick={onGoToDashboard}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 transition-opacity rounded-full px-6 border-none text-white font-black text-xs h-10 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/20"
                  >
                    <Target className="w-4 h-4 text-white" />
                    Go to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={onStart} className="inline-flex font-bold text-xs sm:text-sm mr-1 shrink-0">
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={onStart}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 transition-opacity rounded-full px-4 sm:px-6 border-none text-white font-black text-[10px] sm:text-xs cursor-pointer"
                  >
                    Start Analysis
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </nav>
      )}

      {/* SECTION 2 — HERO AREA */}
      <section className={`relative pb-20 px-6 overflow-hidden ${hideNavbar ? 'pt-4 lg:pt-8' : 'pt-32 lg:pt-48'}`}>
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C3AED]/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2563EB]/20 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4 animate-pulse delay-700" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
              <Zap className="w-3 h-3 text-primary" />
              <span>AI Powered Career Intelligence Platform</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tighter">
              Navigate Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] to-[#2563EB]">Career Journey With AI</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl">
              AI-powered resume analysis, target career mapping, career roadmap generation, and salary intelligence based on real market trends.
            </p>
            <div className="flex flex-col gap-6">
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={onGoToDashboard}
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white font-extrabold text-lg shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Target className="w-5 h-5" />
                    Open Your AI Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={onStart}
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white font-extrabold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Zap className="w-5 h-5 fill-current text-yellow-300" />
                    Get Started Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={onStart}
                    className="h-14 px-8 rounded-2xl border-2 border-gray-200 dark:border-zinc-800 hover:bg-muted/50 font-bold text-lg flex items-center justify-center gap-2 text-foreground cursor-pointer shrink-0"
                  >
                    Sign In / Log In
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs font-medium text-muted-foreground">Trusted by 50,000+ Students</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Interactive Instant Free ATS Scanner & Live Audit Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-xl mx-auto lg:max-w-none relative"
          >
            <div className="glass rounded-[2rem] border border-white/20 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl relative">
              {/* Top Status Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-foreground leading-tight">Instant ATS Resume Scanner</h3>
                    <p className="text-[11px] text-muted-foreground">Test your CV against Fortune 500 recruiter algorithms</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Free Live Test
                </div>
              </div>

              {/* 1. SCANNING IN PROGRESS STATE */}
              {isScanning && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">AI Deep Audit in Progress</h4>
                    <p className="text-xs text-muted-foreground animate-pulse max-w-xs mx-auto">
                      {scanSteps[scanStepIndex]}
                    </p>
                  </div>
                  <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB]"
                      animate={{ width: ['10%', '55%', '90%'] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  </div>
                </div>
              )}

              {/* 2. SCAN RESULT TEASER PREVIEW */}
              {!isScanning && scanResult && (
                <div className="space-y-5 animate-in fade-in duration-500">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center">
                        <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex flex-col items-center justify-center text-white shadow-lg shadow-primary/25">
                          <span className="text-2xl font-black">{scanResult.score}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">/ 100</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary">
                            Grade {scanResult.grade}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {scanResult.score >= 80 ? "High ATS Match" : scanResult.score >= 65 ? "Moderate Match" : "At Risk of Rejection"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 truncate max-w-[200px] sm:max-w-[260px]">
                          📄 {scanResult.filename}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setScanResult(null)}
                      className="text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Scan Another
                    </Button>
                  </div>

                  {/* Diagnostic Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Format</p>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{scanResult.formatScore}%</p>
                      <span className="text-[9px] text-emerald-500 font-semibold">ATS Safe</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Keywords</p>
                      <p className={`text-base font-black mt-0.5 ${scanResult.keywordScore >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>{scanResult.keywordScore}%</p>
                      <span className="text-[9px] text-amber-500 font-semibold">Missing 4</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Impact</p>
                      <p className={`text-base font-black mt-0.5 ${scanResult.impactScore >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{scanResult.impactScore}%</p>
                      <span className="text-[9px] text-rose-500 font-semibold">Add Metrics</span>
                    </div>
                  </div>

                  {/* Missing Keywords Warning */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Critical Missing Keywords for Target Roles:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.missingKeywords.map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-200 font-medium text-[10px]">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Main CTA: Unlock Full 10-Page Audit */}
                  <Button 
                    onClick={handleUnlockFullAudit}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-primary/25 cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300 fill-current" />
                    Unlock Full 10-Page Diagnostic & Fix Roadmap
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}

              {/* 3. DEFAULT DROPZONE STATE (Unscanned) */}
              {!isScanning && !scanResult && (
                <div className="space-y-4">
                  {!user || user.email === 'guest@careernav.ai' ? (
                    /* Unauthenticated State: Clear Sign In Requirement Banner */
                    <div
                      onClick={onStart}
                      className="border-2 border-dashed border-primary/40 hover:border-primary rounded-2xl p-7 text-center cursor-pointer transition-all bg-primary/[0.03] hover:bg-primary/[0.07] group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED]/15 to-[#2563EB]/15 border border-primary/30 text-primary mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-black uppercase tracking-wider mb-2">
                        <span>🔒 Sign In Required</span>
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        Create an account or Sign In to analyze your resume
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">
                        To protect your private career data and generate persistent ATS diagnostics, please verify your email first.
                      </p>
                      <div className="mt-4">
                        <Button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); onStart(); }}
                          className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white font-bold text-xs shadow-md shadow-primary/20 hover:opacity-95 cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 text-yellow-300 fill-current" />
                          Sign Up / Log In to Upload
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Authenticated State: Active Drag & Drop Upload Zone */
                    <>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) processResumeFile(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                          dragActive 
                            ? 'border-primary bg-primary/10 scale-[1.01]' 
                            : 'border-border/80 hover:border-primary/60 hover:bg-muted/30 bg-muted/10'
                        }`}
                      >
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept=".pdf,.docx,.doc,image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) processResumeFile(file);
                          }}
                        />
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED]/10 to-[#2563EB]/10 border border-primary/20 text-primary mx-auto flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          Drag & drop your resume here, or <span className="text-primary hover:underline">browse files</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Supports PDF, Word DOCX, and photo/scans up to 25MB
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleSampleResume}
                          className="w-full h-10 rounded-xl text-xs font-bold border-border/80 hover:bg-primary/5 hover:text-primary cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                          ⚡ Try with Sample Resume (1-Click Test)
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-center gap-6 pt-2 text-[10px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" /> 100% Free Audit
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-500" /> Private & Encrypted
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-purple-500" /> Real Recruiter ATS Rules
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>



      {/* SECTION 4 — FEATURES SECTION */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              A Complete <span className="text-primary italic">AI Career</span> Ecosystem
            </h2>
            <p className="text-muted-foreground text-lg">
              Stop guessing. Use data-driven career intelligence to land your dream role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: <FileText className="text-[#7C3AED]" />, 
                title: "Resume Analysis", 
                desc: "Get deep institutional-grade parsing of your technical background." 
              },
              { 
                icon: <Zap className="text-yellow-500" />, 
                title: "Roadmap Builder", 
                desc: "AI-generated step-by-step learning paths to bridge your skill gaps." 
              },
              { 
                icon: <MessageSquare className="text-purple-500" />, 
                title: "AI Interview Prep", 
                desc: "Practice with custom questions tailored to your experience." 
              },
              { 
                icon: <Search className="text-blue-500" />, 
                title: "Skill Gap Detection", 
                desc: "Identify exactly what is missing between you and the job." 
              },
              { 
                icon: <History className="text-orange-500" />, 
                title: "Resume Versioning", 
                desc: "Track history and optimize multiple versions for different roles." 
              },
              { 
                icon: <Shield className="text-red-500" />, 
                title: "Verified Intelligence", 
                desc: "Built on real 2026 hiring data and recruitment insights." 
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="glass rounded-3xl p-8 border border-white/10 hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic opacity-80">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3 text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Everything you need to know about our AI resume audits, career roadmaps, and privacy.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does the AI ATS Resume Checker work?",
              a: "Career Navigation AI uses strict enterprise-grade parser rules and Google Gemini AI to analyze your document's formatting, keyword alignment with target job descriptions, quantified impact metrics, and ATS compliance score out of 100."
            },
            {
              q: "Is Career Navigation AI free to use?",
              a: "Yes! You can instantly test your resume with our Hero scanner, audit ATS compatibility, generate custom career roadmaps, and interact with the AI Career Mentor completely free."
            },
            {
              q: "What file formats can I upload?",
              a: "We support digital PDFs, Microsoft Word (.docx, .doc), and high-resolution photos/scans (JPG, PNG, WebP) powered by multimodal AI OCR text extraction."
            },
            {
              q: "How does Career Roadmap Generation help my job search?",
              a: "The engine compares your indexed skills against real live job postings for your desired role, discovers exact skill gaps, and generates a structured, step-by-step learning and portfolio roadmap."
            },
            {
              q: "Is my resume data safe and private?",
              a: "Yes, 100%. We use strict SSL/TLS encryption and secure database records. Your personal documents are private and never sold or shared with recruiters without your explicit permission."
            }
          ].map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div 
                key={i} 
                className="glass rounded-2xl border border-white/10 dark:border-zinc-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <div className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                  </div>
                </button>
                {isOpen && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/20 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-border/50 text-sm text-muted-foreground bg-muted/20">
        <div className="max-w-6xl mx-auto px-6">
          {/* System Configuration Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 mb-12 border-b border-border/40 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Verified Access</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Secure OTP-based email verification ensures every member of our community is authentic and protected.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Email Integrity</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Strict email uniqueness is enforced across our entire career ecosystem. No duplicate accounts allowed.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Cloud Resilience</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Your career data is backed by encrypted high-availability cloud storage with 99.9% uptime guaranteed.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center shadow-md">
                <Target className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-foreground tracking-tight">Career Navigation AI</span>
            </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground">
            <a 
              href="https://www.linkedin.com/in/kamal-jit-a6a081396/" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#0A66C2] transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-foreground"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>LinkedIn</span>
            </a>
            <a 
              href="https://github.com/raj40870-pixel" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-foreground"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <button 
              onClick={() => setModalType('privacy')} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setModalType('terms')} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => setModalType('about')} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => setIsSupportDeskOpen(true)} 
              className="text-red-600 dark:text-red-400 font-bold hover:underline transition-colors flex items-center gap-1.5 cursor-pointer bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-xl border border-red-500/25 shadow-xs"
              title="Report an error or ask for help"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Help & Support Desk</span>
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; 2026 <strong className="text-foreground">Career Navigation AI</strong> &bull; Autonomous Career Architecture & ATS Intelligence Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>

      {/* Legal & Info Modal */}
      <LegalAndInfoModal type={modalType} onClose={() => setModalType(null)} />
      
      {/* Help & Support Desk Modal */}
      <SupportDeskModal 
        isOpen={isSupportDeskOpen} 
        onClose={() => setIsSupportDeskOpen(false)} 
        currentUser={user} 
      />
    </div>
  );
}
