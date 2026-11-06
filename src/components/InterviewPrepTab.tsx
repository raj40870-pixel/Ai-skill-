import React, { useState, useEffect, useRef } from 'react';
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
  BrainCircuit,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Loader2,
  RotateCcw,
  Globe,
  Check
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
      category: 'Technical Core (20 Pts)',
      question: `In your work with ${skills[0] || 'core engineering frameworks'}, how do you approach architectural profiling, memory bounds, and latency minimization under peak load?`,
      hint: "Mention specific profiling metrics, async queues, and database connection overheads.",
      points: 20
    },
    {
      id: 2,
      category: 'System Design & Scalability (20 Pts)',
      question: `Explain how you would design a scalable, resilient distributed architecture for a ${targetRole} role handling millions of daily active users.`,
      hint: "Consider caching layers (Redis), CDNs, load balancing, message queues (Kafka/RabbitMQ), and database partitioning.",
      points: 20
    },
    {
      id: 3,
      category: 'Real-World Project Deep Dive (20 Pts)',
      question: "Describe the most technically challenging feature or service you have implemented. What unexpected failure scenario occurred, and how did you mitigate it?",
      hint: "Highlight production trade-offs, root cause analysis (RCA), and monitoring alerts.",
      points: 20
    },
    {
      id: 4,
      category: 'Problem Solving & Edge Cases (20 Pts)',
      question: "How do you systematically identify and resolve intermittent data inconsistency or race conditions across distributed microservices?",
      hint: "Discuss idempotency keys, distributed locks, database transaction isolation levels, and retry policies.",
      points: 20
    },
    {
      id: 5,
      category: 'Behavioral & Leadership (20 Pts)',
      question: "Tell me about a time when stakeholders had competing deadlines and conflicting technical requirements. How did you negotiate scope and align priorities?",
      hint: "Use the STAR framework (Situation, Task, Action, Result) to showcase leadership, data-driven decisions, and empathy.",
      points: 20
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
  
  // Track 100-Point Score across 5 questions (each evaluated answer adds up to 20 pts)
  const [questionScores, setQuestionScores] = useState<Record<number, number>>({});

  // Voice Input, Hindi-to-English Auto-Translate & Question Audio
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'hi-IN'>('en-US');
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);
  const [isTranslatingVoice, setIsTranslatingVoice] = useState(false);
  const [liveSpeechTranscript, setLiveSpeechTranscript] = useState('');
  const [lastTranslation, setLastTranslation] = useState<{
    originalHindi: string;
    translatedEnglish: string;
    summaryOfPoints?: string[];
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const baseAnswerRef = useRef<string>('');
  const accumulatedHindiSpeechRef = useRef<string>('');
  const isTranslatingRef = useRef<boolean>(false);

  // Function to translate Hindi/Hinglish text to corporate English
  const translateAndApplyEnglish = async (hindiText: string) => {
    if (!hindiText || !hindiText.trim() || isTranslatingRef.current) return;
    
    try {
      isTranslatingRef.current = true;
      setIsTranslatingVoice(true);
      
      const res = await geminiService.translateHindiAnswerToEnglish(
        hindiText.trim(),
        selectedQuestion?.question
      );

      if (res && res.translatedEnglish) {
        setAnswerText(prev => {
          const currentClean = prev.trim();
          // If previous text was just the temporary Hindi speech, replace it completely
          if (currentClean === hindiText.trim() || (baseAnswerRef.current === '' && currentClean.includes(hindiText.trim()))) {
            return res.translatedEnglish;
          }
          // If appending to prior English text
          const prefix = baseAnswerRef.current.trim();
          return prefix ? `${prefix} ${res.translatedEnglish}` : res.translatedEnglish;
        });

        setLastTranslation({
          originalHindi: hindiText.trim(),
          translatedEnglish: res.translatedEnglish,
          summaryOfPoints: res.summaryOfPoints || []
        });

        toast.success("Hindi speech auto-translated to Professional Corporate English!");
      }
    } catch (err: any) {
      console.warn("Auto-translate error:", err);
      toast.error("Auto-translation notice: saved original speech text.");
    } finally {
      isTranslatingRef.current = false;
      setIsTranslatingVoice(false);
      setLiveSpeechTranscript('');
      accumulatedHindiSpeechRef.current = '';
    }
  };

  // Cleanup speech resources on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported by your current browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      
      // If stopping while in Hindi mode and we have accumulated speech, translate it immediately
      if (voiceLang === 'hi-IN' && accumulatedHindiSpeechRef.current.trim()) {
        const spoken = accumulatedHindiSpeechRef.current.trim();
        translateAndApplyEnglish(spoken);
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      baseAnswerRef.current = answerText;
      accumulatedHindiSpeechRef.current = '';
      setLiveSpeechTranscript('');

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (voiceLang === 'hi-IN') {
          // In Hindi mode, display live transcript and accumulate for smart translation
          if (currentFinal) {
            accumulatedHindiSpeechRef.current = (accumulatedHindiSpeechRef.current + ' ' + currentFinal).trim();
            setLiveSpeechTranscript(accumulatedHindiSpeechRef.current);
            // Also update the answer textarea with current transcript so user sees what is heard
            const prefix = baseAnswerRef.current ? baseAnswerRef.current.trim() + ' ' : '';
            setAnswerText(prefix + accumulatedHindiSpeechRef.current);
          } else if (currentInterim) {
            const preview = (accumulatedHindiSpeechRef.current + ' ' + currentInterim).trim();
            setLiveSpeechTranscript(preview);
            const prefix = baseAnswerRef.current ? baseAnswerRef.current.trim() + ' ' : '';
            setAnswerText(prefix + preview);
          }
        } else {
          // In English mode, direct text transcription into the textarea
          if (currentFinal) {
            const prefix = baseAnswerRef.current ? baseAnswerRef.current.trim() + ' ' : '';
            baseAnswerRef.current = prefix + currentFinal.trim();
            setAnswerText(baseAnswerRef.current);
          } else if (currentInterim) {
            const prefix = baseAnswerRef.current ? baseAnswerRef.current.trim() + ' ' : '';
            setAnswerText(prefix + currentInterim.trim());
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error in Interview Prep:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission was denied. Please allow microphone access in your browser.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If ended naturally and we have accumulated Hindi speech, translate it
        if (voiceLang === 'hi-IN' && accumulatedHindiSpeechRef.current.trim() && !isTranslatingRef.current) {
          const spoken = accumulatedHindiSpeechRef.current.trim();
          translateAndApplyEnglish(spoken);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
    }
  };

  const toggleQuestionAudio = (questionText: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error("Text-to-speech is not supported in this environment.");
      return;
    }

    if (isPlayingQuestion) {
      window.speechSynthesis.cancel();
      setIsPlayingQuestion(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = questionText.replace(/[*#_`~\[\]]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceLang === 'hi-IN' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingQuestion(false);
    utterance.onerror = () => setIsPlayingQuestion(false);

    setIsPlayingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

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
      
      if (selectedQuestion?.id) {
        // Result score is 0-100, normalize each to 20 points
        const scaledScore = Math.min(20, Math.max(5, Math.round((result.score || 70) * 0.2)));
        setQuestionScores(prev => ({ ...prev, [selectedQuestion.id]: scaledScore }));
      }
      
      toast.success("AI feedback generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Evaluation failed: " + (err.message || "Unknown error"));
    } finally {
      setIsEvaluating(false);
    }
  };

  const answeredCount = Object.keys(questionScores).length;
  const totalScore = Object.values(questionScores).reduce((a, b) => a + b, 0);

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
          <p className="text-muted-foreground font-medium">
            Full 5-Question Architecture & Behavioral Assessment. Each question is worth 20 points (100 pts total).
          </p>
        </div>

        {/* 100-Point Scorecard Banner */}
        <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-2xl border border-border/60">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-white flex flex-col items-center justify-center font-black">
            <span className="text-base leading-none">{totalScore}</span>
            <span className="text-[9px] uppercase opacity-80">/ 100</span>
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">
              Readiness Score: {answeredCount}/5 Evaluated
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {answeredCount === 5 
                ? (totalScore >= 80 ? "🏆 Tier-1 Ready" : "⚡ Keep Practicing") 
                : `${5 - answeredCount} questions remaining`}
            </div>
          </div>
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
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-85">
                          {voiceLang === 'hi-IN' ? 'सक्रिय प्रश्न (Active Question)' : 'Active Challenge'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleQuestionAudio(selectedQuestion?.question)}
                          title={isPlayingQuestion ? (voiceLang === 'hi-IN' ? "रोकें" : "Stop reading question") : (voiceLang === 'hi-IN' ? "प्रश्न सुनें" : "Listen to question")}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl border transition-all font-semibold ${
                            isPlayingQuestion 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 animate-pulse' 
                              : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                          }`}
                        >
                          {isPlayingQuestion ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isPlayingQuestion ? (voiceLang === 'hi-IN' ? 'बोल रहे हैं...' : 'Speaking...') : (voiceLang === 'hi-IN' ? 'प्रश्न सुनें' : 'Listen')}</span>
                        </button>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">{selectedQuestion?.question}</h3>
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/60 flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        <span className="font-black uppercase not-italic">
                          {voiceLang === 'hi-IN' ? 'संकेत (Hint):' : 'Hint:'}
                        </span>{' '}
                        {selectedQuestion?.hint}
                      </p>
                    </div>

                    {/* Career Coach Recommendation Banner - Fully localized based on voiceLang */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      voiceLang === 'hi-IN'
                        ? 'bg-amber-50/80 dark:bg-amber-950/25 border-amber-300/80 dark:border-amber-800/50 text-amber-950 dark:text-amber-200'
                        : 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-300/80 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-200'
                    }`}>
                      <div className="flex items-start gap-3.5">
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          voiceLang === 'hi-IN' 
                            ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300' 
                            : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                              {voiceLang === 'hi-IN' ? (
                                <span>🎯 करियर कोच टिप: इंग्लिश में अपनी स्किल बनाएं</span>
                              ) : (
                                <span>🎯 Career Coach Tip: Build Your Interview Skills in English</span>
                              )}
                              {voiceLang === 'en-US' ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-800/80 text-[10px] font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Recommended Mode Active
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-800/80 text-[10px] font-bold text-amber-900 dark:text-amber-100">
                                  Assist Mode
                                </span>
                              )}
                            </span>

                            {voiceLang === 'hi-IN' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setVoiceLang('en-US');
                                  toast.success("Switched to Direct English Mode! Best for interview confidence.");
                                }}
                                className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1 bg-white dark:bg-black/60 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 shadow-2xs"
                              >
                                <span>⚡ Switch to English Mode</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {voiceLang === 'hi-IN' ? (
                            <>
                              <p className="text-xs leading-relaxed opacity-90">
                                <strong>हमेशा इंग्लिश में उत्तर देने की कोशिश करें:</strong> वास्तविक जॉब इंटरव्यू हमेशा इंग्लिश में ही होते हैं। अपनी कम्युनिकेशन स्किल, वोकैबुलरी और कॉन्फिडेंस को मजबूत बनाने के लिए सीधे इंग्लिश में बोलने की आदत डालें।
                              </p>
                              <p className="text-[11px] leading-relaxed opacity-80 italic">
                                💡 <em>हिंदी ट्रांसलेटर सिर्फ शुरुआती झिझक मिटाने या कॉन्सेप्ट समझने के लिए है। जैसे ही आप सहज हों, ऊपर से सीधे <strong>'English'</strong> सेलेक्ट करें और असल इंटरव्यू जैसा अभ्यास करें!</em>
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs leading-relaxed opacity-90">
                                <strong>Always strive to answer directly in English:</strong> Real-world tech and corporate interviews are conducted exclusively in English. Speaking and drafting directly in English builds spontaneous fluency, technical vocabulary, and genuine hiring confidence.
                              </p>
                              <p className="text-[11px] leading-relaxed opacity-80 italic">
                                ✨ <em>Excellent choice! Direct English practice builds muscle memory and real interview readiness for technical and HR rounds.</em>
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 block">
                            {voiceLang === 'hi-IN' ? 'आपका उत्तर (ऑटो-ट्रांसलेट टू इंग्लिश)' : 'Your Answer (Direct English)'}
                          </label>
                        </div>

                        {/* Voice typing controls & Mode Selector */}
                        <div className="flex items-center gap-2">
                          {/* Segmented Mode Selector */}
                          <div className="flex items-center p-1 bg-muted/60 dark:bg-muted/40 rounded-xl border border-border/60">
                            <button
                              type="button"
                              onClick={() => {
                                setVoiceLang('en-US');
                                if (isListening && recognitionRef.current) {
                                  try {
                                    recognitionRef.current.stop();
                                    setTimeout(() => toggleListening(), 100);
                                  } catch (e) {}
                                }
                              }}
                              className={`h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                voiceLang === 'en-US'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title={voiceLang === 'hi-IN' ? "सीधे इंग्लिश में बोलें (सर्वोत्तम)" : "Speak directly in English (Recommended for real interviews)"}
                            >
                              <span>English</span>
                              <span className={`text-[9px] px-1 py-0.2 rounded-full font-black uppercase ${
                                voiceLang === 'en-US' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              }`}>
                                {voiceLang === 'hi-IN' ? 'बेस्ट ⭐' : 'Best ⭐'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setVoiceLang('hi-IN');
                                if (isListening && recognitionRef.current) {
                                  try {
                                    recognitionRef.current.stop();
                                    setTimeout(() => toggleListening(), 100);
                                  } catch (e) {}
                                }
                              }}
                              className={`h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                voiceLang === 'hi-IN'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title={voiceLang === 'hi-IN' ? "असिस्ट मोड: हिंदी में बोलें, इंग्लिश में ट्रांसलेट होगा" : "Assist mode: Speak in Hindi, AI translates to English"}
                            >
                              <span>{voiceLang === 'hi-IN' ? 'हिन्दी ➔ En' : 'Hindi ➔ En'}</span>
                              <span className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                                voiceLang === 'hi-IN' ? 'bg-indigo-700 text-white' : 'bg-muted text-muted-foreground'
                              }`}>
                                {voiceLang === 'hi-IN' ? 'असिस्ट' : 'Assist'}
                              </span>
                            </button>
                          </div>

                          {/* Mic Voice Typing Button */}
                          <button
                            type="button"
                            onClick={toggleListening}
                            disabled={isTranslatingVoice}
                            title={
                              isListening 
                                ? (voiceLang === 'hi-IN' ? "रिकॉर्डिंग रोकें व ट्रांसलेट करें (Stop & Translate)" : "Stop voice recording") 
                                : (voiceLang === 'hi-IN' ? "हिंदी में बोलें ➔ इंग्लिश में ट्रांसलेट होगा" : "Voice typing in English (Click and speak)")
                            }
                            className={`h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                              isListening 
                                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-300' 
                                : voiceLang === 'en-US'
                                  ? 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                                  : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20'
                            }`}
                          >
                            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                            <span>
                              {isListening 
                                ? (voiceLang === 'hi-IN' ? 'सुन रहे हैं...' : 'Listening...') 
                                : (voiceLang === 'hi-IN' ? 'माइक (हिन्दी)' : 'Voice Typing')}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Active recording notice banner */}
                      <AnimatePresence>
                        {isListening && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-50 via-indigo-50 to-rose-50 dark:from-rose-950/40 dark:via-indigo-950/40 dark:to-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                                </div>
                                <div className="text-xs text-slate-800 dark:text-slate-200 truncate">
                                  {voiceLang === 'hi-IN' ? (
                                    <span>
                                      <strong className="text-indigo-700 dark:text-indigo-400 font-bold">हिन्दी में बोलें:</strong>{' '}
                                      {liveSpeechTranscript ? `"${liveSpeechTranscript}"` : 'जैसे ही बोलना बंद करेंगे, यह कॉर्पोरेट इंग्लिश में बदल जाएगा...'}
                                    </span>
                                  ) : (
                                    <span>
                                      <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Listening in English:</strong> Speak clearly (transcribing directly in real-time)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={toggleListening}
                                className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline bg-white dark:bg-black px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 shrink-0 self-end sm:self-auto"
                              >
                                {voiceLang === 'hi-IN' ? 'रोकें व ट्रांसलेट करें (Done)' : 'Stop Recording'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* AI Translating in progress status */}
                      <AnimatePresence>
                        {isTranslatingVoice && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-2 rounded-xl bg-indigo-600 text-white flex items-center justify-between shadow-md text-xs font-semibold">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                                <span>
                                  {voiceLang === 'hi-IN' 
                                    ? 'आपके हिंदी उत्तर को प्रोफेशनल कॉर्पोरेट इंग्लिश में ट्रांसलेट किया जा रहा है...' 
                                    : 'Translating response into professional corporate English...'}
                                </span>
                              </div>
                              <span className="text-[10px] bg-indigo-700 px-2 py-0.5 rounded-md font-mono uppercase tracking-wider text-indigo-200">
                                Gemini AI
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Last Translation summary & restore card */}
                      <AnimatePresence>
                        {lastTranslation && !isTranslatingVoice && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-indigo-950 dark:text-indigo-200">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>
                                  {voiceLang === 'hi-IN' 
                                    ? 'ऑटो-ट्रांसलेटेड (हिन्दी ➔ Corporate English)' 
                                    : 'Auto-Translated (Hindi ➔ Corporate English)'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setAnswerText(lastTranslation.originalHindi);
                                  toast.info(voiceLang === 'hi-IN' ? "मूल हिंदी टेक्स्ट बॉक्स में रिस्टोर कर दिया गया है।" : "Original Hindi speech restored in the box.");
                                }}
                                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>
                                  {voiceLang === 'hi-IN' ? 'मूल हिंदी देखें (Restore Hindi)' : 'Restore Original Hindi'}
                                </span>
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 not-italic">Original Spoken:</span> "{lastTranslation.originalHindi}"
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder={
                          isListening
                            ? (voiceLang === 'hi-IN' ? "सुन रहे हैं... जो बोलेंगे वो रिकॉर्ड हो रहा है..." : "Listening... speak your response now...")
                            : (voiceLang === 'hi-IN' 
                                ? "अपना उत्तर यहाँ टाइप करें या ऊपर माइक दबाकर हिंदी में बोलें — यह तुरंत उच्च कोटि की कॉर्पोरेट इंग्लिश में ट्रांसलेट होगा..." 
                                : "Draft your professional response in English here (or click Voice Typing above to speak)...")
                        }
                        className={`w-full h-44 rounded-2xl border bg-background/50 p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${
                          isListening ? 'border-rose-400 ring-2 ring-rose-200 dark:ring-rose-900/40' : ''
                        }`}
                      />

                      {/* Helper button to manually translate if Hindi characters are detected in the textarea */}
                      {/[\u0900-\u097F]/.test(answerText) && !isTranslatingVoice && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                          <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                            {voiceLang === 'hi-IN' 
                              ? "💡 आपके उत्तर में हिंदी शब्द हैं। इसे इंटरव्यू के लिए इंग्लिश में बदलें:" 
                              : "💡 Hindi detected in your answer. Translate it to corporate English:"}
                          </span>
                          <button
                            type="button"
                            onClick={() => translateAndApplyEnglish(answerText)}
                            disabled={isTranslatingVoice}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs self-start sm:self-auto shrink-0"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{voiceLang === 'hi-IN' ? "इंग्लिश में बदलें (Translate)" : "Translate to English"}</span>
                          </button>
                        </div>
                      )}
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
                            {voiceLang === 'hi-IN' ? 'उत्तर का मूल्यांकन हो रहा है...' : 'Evaluating performance...'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 justify-center">
                            {voiceLang === 'hi-IN' ? 'उत्तर सबमिट करें (Submit Answer)' : 'Submit Answer for Audit'}
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
                        {voiceLang === 'hi-IN' ? 'रद्द करें (Cancel)' : 'Cancel'}
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
