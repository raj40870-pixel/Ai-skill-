import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  RefreshCw, 
  ChevronRight, 
  CheckCircle2, 
  Lightbulb, 
  Award,
  BookOpen,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { geminiService } from '../services/geminiService';

interface InterviewPrepTabProps {
  resumeData: any;
  targetRole?: string;
  onNavigate?: (tab: string) => void;
}

export function InterviewPrepTab({ resumeData, targetRole = "Software Engineer", onNavigate }: InterviewPrepTabProps) {
  const skills = resumeData?.parsedData?.skills || ['JavaScript', 'System Design', 'React / Next.js', 'Problem Solving'];

  const fallbackQuestions = [
    {
      id: 1,
      category: 'Technical Core',
      question: `Explain how you would handle scale and optimization challenges when deploying a high-throughput system utilizing ${skills[0] || 'modern web patterns'}.`,
      hint: "Mention specific profiling, troubleshooting, and design paradigms."
    },
    {
      id: 2,
      category: 'System Design',
      question: `Explain how you would design a scalable, low-latency architecture for a role as a ${targetRole}.`,
      hint: "Consider caching layers, CDNs, load balancing, message queues, and databases."
    },
    {
      id: 3,
      category: 'Behavioral',
      question: "Describe a challenging situation where team members disagreed on introducing a modern practice or dependency. How did you resolve it?",
      hint: "Use the STAR framework (Situation, Task, Action, Result) to showcase leadership, data-driven reasoning, and collaboration."
    }
  ];

  const skillsKey = Array.isArray(skills) ? skills.join(',') : '';
  const initialCacheKey = `questions_${skillsKey}_${targetRole}`;
  const initialCached = geminiService.getCache(initialCacheKey);

  const [questions, setQuestions] = useState<any[]>(initialCached || fallbackQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(initialCached ? initialCached[0] : fallbackQuestions[0]);
  const [answerText, setAnswerText] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const fetchAIQuestions = async (force: boolean = false) => {
    if (!resumeData || !resumeData.text) return;

    const skillsKey = Array.isArray(skills) ? skills.join(',') : '';
    const cacheKey = `questions_${skillsKey}_${targetRole}`;
    const cached = geminiService.getCache(cacheKey);
    if (!force && cached) {
      setQuestions(cached);
      if (!selectedQuestion) {
        setSelectedQuestion(cached[0]);
      }
      setIsLoadingQuestions(false);
      return;
    }

    try {
      if (force) {
        setIsLoadingQuestions(true);
        setSelectedQuestion(null);
        setEvaluationResult(null);
        setAnswerText('');
      }

      const list = await geminiService.getInterviewQuestions(skills, targetRole, force);
      if (Array.isArray(list) && list.length > 0) {
        setQuestions(list);
        if (force || !selectedQuestion) {
          setSelectedQuestion(list[0]);
        }
      } else {
        setQuestions(fallbackQuestions);
        if (force || !selectedQuestion) {
          setSelectedQuestion(fallbackQuestions[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load dynamic questions:", err);
      // Fallback is already the default state, no action needed unless forced
      if (force) {
        setQuestions(fallbackQuestions);
        setSelectedQuestion(fallbackQuestions[0]);
      }
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (resumeData && resumeData.text) {
      fetchAIQuestions(false);
    }
  }, [resumeData, targetRole]);

  const handleEvaluate = async () => {
    if (!answerText.trim()) {
      toast.warning("Please type your response before requesting AI grades.");
      return;
    }
    if (!selectedQuestion) return;

    try {
      setIsEvaluating(true);
      setEvaluationResult(null);

      const result = await geminiService.evaluateAnswer(selectedQuestion.question, answerText);
      setEvaluationResult(result);
      toast.success("AI feedback generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Evaluation failed: " + (err.message || "Unknown error"));
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!resumeData || !resumeData.text) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center glass rounded-[3rem] p-12 border-none shadow-xl">
        <BrainCircuit className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6 animate-pulse" />
        <h2 className="text-3xl font-black mb-4 tracking-tight">No Interview Simulator Available</h2>
        <p className="text-muted-foreground mb-8 italic">Please upload your resume to generate a personalized behavioral and technical interview challenge simulator.</p>
        <Button size="lg" className="h-14 rounded-2xl bg-primary text-white font-bold px-10" onClick={() => onNavigate && onNavigate('upload')}>
          Upload Resume
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mr-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            AI Interview <span className="text-primary italic">Practice</span>
          </h1>
          <p className="text-muted-foreground font-medium italic">Custom simulator tailored directly to your professional resume skill profile.</p>
        </div>
      </header>

      {isLoadingQuestions ? (
        <div className="py-24 text-center space-y-4">
          <BrainCircuit className="w-16 h-16 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground font-medium italic">AI is scanning your skillset profile and crafting specific questions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Question List Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Tailored Simulator Challenges</h3>
            <div className="space-y-4">
              {questions.map((q) => {
                const isSelected = selectedQuestion?.id === q.id;
                return (
                  <Card 
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestion(q);
                      setEvaluationResult(null);
                      setAnswerText('');
                    }}
                    className={`glass p-6 rounded-[2rem] border-none cursor-pointer hover:shadow-xl transition-all ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : 'bg-white/50 dark:bg-black/40 hover:bg-white/70'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
                        {q.category}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="font-bold text-sm leading-relaxed text-foreground/90 line-clamp-3">
                      {q.question}
                    </p>
                  </Card>
                );
              })}
            </div>

            <Card className="glass border-none rounded-[2rem] p-6 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Award className="w-24 h-24" />
              </div>
              <h4 className="font-black text-lg mb-2 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                Adaptive Prep Active
              </h4>
              <p className="text-xs opacity-85 leading-relaxed italic pr-4">
                This simulation assesses your structure, jargon accuracy, and metrics coverage to deliver real behavioral suggestions.
              </p>
            </Card>
          </div>

          {/* Practice Workbox */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedQuestion ? (
                <motion.div
                  key={selectedQuestion?.id || 'empty'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="glass border-none rounded-[2.5rem] p-8 bg-white/50 dark:bg-black/40 shadow-2xl space-y-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-85">Active Challenge</span>
                      <h3 className="text-2xl font-black tracking-tight">{selectedQuestion?.question}</h3>
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/60 flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        <span className="font-black uppercase not-italic">Hint:</span> {selectedQuestion?.hint}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 block">Your Answer</label>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Draft your professional response here (using STAR situation framing for higher scoring)..."
                        className="w-full h-44 rounded-2xl border bg-background/50 p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        onClick={handleEvaluate}
                        disabled={isEvaluating}
                        className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shrink-0"
                      >
                        {isEvaluating ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Evaluating performance...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 justify-center">
                            Submit Answer for Audit
                            <Send className="w-4 h-4" />
                          </span>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedQuestion(null);
                          setEvaluationResult(null);
                          setAnswerText('');
                        }}
                        className="h-14 rounded-2xl px-6 font-bold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card>

                  {/* Real evaluation result visual output */}
                  {evaluationResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="glass border-none rounded-[2.5rem] p-8 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/10 shadow-2xl space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                              <Award className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-black text-lg tracking-tight">AI Diagnostic Report</h4>
                              <p className="text-xs text-muted-foreground">{evaluationResult.verdict}</p>
                            </div>
                          </div>
                          <div className="px-6 py-2.5 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-extrabold text-2xl tracking-tight">
                            {evaluationResult.score} / 100
                          </div>
                        </div>

                        <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                          "{evaluationResult.summary}"
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-green-600 dark:text-green-400 flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5" />
                              Strong Components
                            </h5>
                            <ul className="space-y-2">
                              {evaluationResult.positives.map((p: string, i: number) => (
                                <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-3">
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                              <Lightbulb className="w-3.5 h-3.5" />
                              Key Optimization Fixes
                            </h5>
                            <ul className="space-y-2">
                              {evaluationResult.improvements.map((imp: string, i: number) => (
                                <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                                  <ArrowRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                  <span>{imp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 glass rounded-[2.5rem] bg-white/50 dark:bg-black/40 min-h-[400px]"
                >
                  <MessageSquare className="w-16 h-16 text-primary/20 mb-6 animate-bounce" />
                  <h3 className="text-2xl font-black tracking-tight mb-2">Initialize Simulation</h3>
                  <p className="text-muted-foreground italic max-w-sm mb-6 font-medium">
                    Choose one of the tailored preparation challenges on the left menu to start typing and practicing.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
