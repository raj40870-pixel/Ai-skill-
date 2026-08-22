import React from 'react';
import { motion } from 'motion/react';
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
  Github,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getUserAvatar, getUserCleanName } from '../lib/utils';
import { LegalAndInfoModal, ModalType } from './LegalAndInfoModal';

interface LandingPageProps {
  onStart: () => void;
  user?: any;
  onGoToDashboard?: () => void;
  hideNavbar?: boolean;
  onUploadSuccess?: (data: { text: string; filename: string; userId: string }) => void;
}

export function LandingPage({ onStart, user, onGoToDashboard, hideNavbar = false, onUploadSuccess }: LandingPageProps) {
  const [modalType, setModalType] = React.useState<ModalType>(null);
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

          {/* Right Side: Professional Demo Analytics Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative perspective-1000 hidden lg:block"
          >
            <div className="glass rounded-[2rem] border border-white/20 shadow-2xl p-6 overflow-hidden bg-white/50 dark:bg-black/40 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  LIVE AI ANALYSIS
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-white/40 dark:bg-black/20 border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 mb-1 tracking-wider">SKILLS INDEXED</p>
                    <div className="text-3xl font-black text-primary">24+</div>
                    <span className="text-xs opacity-50 block font-normal mt-0.5">Mapped Nodes</span>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4 glass rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold">Skill Gap Analysis</span>
                  <span className="text-[10px] text-primary font-bold">View Roadmap</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'System Design', score: 65, color: '#7C3AED' },
                    { label: 'Cloud Architecture', score: 82, color: '#2563EB' },
                    { label: 'DevOps (CI/CD)', score: 45, color: '#F59E0B' },
                  ].map((skill, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-medium">
                        <span>{skill.label}</span>
                        <span>{skill.score}%</span>
                      </div>
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.score}%` }}
                          transition={{ delay: 1.5 + (i * 0.2), duration: 1 }}
                          className="h-full"
                          style={{ backgroundColor: skill.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <div className="flex-1 glass rounded-xl p-3 border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-[10px]">MS</div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold">Solutions Architect</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">Microsoft • Remote</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements around preview */}
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
        <h2 className="text-3xl font-black mb-12 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "How does the AI skill analysis work?", a: "Our AI uses institutional-grade parsing logic to compare your resume skills directly against the target role requirements and industry standards." },
            { q: "Is my data secure?", a: "Yes, we use enterprise-level encryption. Your resumes are stored on secure Firestore instances and are never shared with third parties without consent." }
          ].map((faq, i) => (
            <div key={i} className="glass rounded-2xl p-6 border border-white/10">
              <h4 className="font-bold mb-2 flex items-center justify-between">
                {faq.q}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-border/50 text-center text-sm text-muted-foreground">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center shadow-md">
              <Target className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-foreground tracking-tight">Career Navigation AI</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground">
            <a 
              href="https://linkedin.com/in/raj-kumar-2254a7371" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#0A66C2] transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <Linkedin className="w-3.5 h-3.5" />
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
              onClick={() => setModalType('contact')} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button 
              onClick={() => setModalType('about')} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              About
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Career Navigation building by <strong className="text-foreground">Kamaljit</strong> from BCA, Lovely Professional University, 2026
          </p>
        </div>
      </footer>

      {/* Legal & Info Modal */}
      <LegalAndInfoModal type={modalType} onClose={() => setModalType(null)} />
    </div>
  );
}
