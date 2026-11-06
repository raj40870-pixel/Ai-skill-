import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, Sparkles, Brain, Cpu, Search, Database } from 'lucide-react';

interface ProcessingViewProps {
  status?: string;
  key?: string;
}

export function ProcessingView({ status }: ProcessingViewProps) {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Parsing Resume Structure", icon: Brain },
    { label: "Indexing Skills & Experience", icon: Database },
    { label: "Identifying Core Skill Alignment", icon: Cpu },
    { label: "Scouring 2026 Market Intelligence", icon: Search },
    { label: "Tailoring Career Roadmap", icon: Sparkles }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 2500);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        {/* Animated AI Brain/Grid effect */}
        <div className="relative w-32 h-32 mx-auto mb-12">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 0.9, 1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-2 border-dotted border-primary/20"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        </div>

        <h2 className="text-3xl font-black mb-4 tracking-tight">AI Analysis in Progress</h2>
        <p className="text-muted-foreground mb-12 text-sm italic">
          "AI is analyzing your resume using real 2026 market intelligence..."
        </p>

        <div className="space-y-4 text-left glass rounded-3xl p-6 border border-white/10 shadow-2xl">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-4 py-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${i <= step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {i < step ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className={`w-4 h-4 ${i === step ? 'animate-pulse' : ''}`} />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
                {i === step && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "linear" }}
                    className="h-0.5 bg-primary mt-1 rounded-full"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              Neural Network Active
            </div>
        </div>
      </div>
    </div>
  );
}
