import React from 'react';
import { Card } from '@/components/ui/card';
import { ResumeUpload } from './ResumeUpload';
import { Sparkles, HelpCircle, FileText, Camera, ShieldCheck, FileType, CheckCircle2 } from 'lucide-react';

interface UploadResumeTabProps {
  userId: string;
  onSuccess: (data: any) => void;
  onNavigate?: (tab: string) => void;
}

export function UploadResumeTab({ userId, onSuccess, onNavigate }: UploadResumeTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mr-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Upload <span className="text-primary italic">Resume</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm sm:text-base">
            Upload digital PDFs, scanned image PDFs, Word documents, or photos (JPG, PNG) for instant analysis.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="glass border-none rounded-[2.5rem] p-1 bg-card/60 overflow-hidden shadow-xl border border-border/50">
            <ResumeUpload onSuccess={onSuccess} userId={userId} onNavigate={onNavigate} />
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="glass border-none rounded-[2rem] p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <FileText className="w-24 h-24 text-primary" />
            </div>
            <h3 className="font-black text-lg mb-3 flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-primary" />
              Unified Document Analysis
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4 font-medium">
              Career Nav AI seamlessly processes all resume formats without requiring manual scanner configuration:
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Digital PDFs (MS Word/Docs):</strong>
                  <span>Instant high-precision extraction of structured text.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Camera className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Scanned PDFs & Photos (JPG/PNG):</strong>
                  <span>AI visual reading transcribes scanned pages and snapshots accurately.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Automatic Career Mapping:</strong>
                  <span>Auto-extracts skills, work experience, education, and calculates ATS compatibility.</span>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="glass border-none rounded-[2rem] p-6 space-y-3 bg-card/60 border border-border/50">
            <h4 className="font-black text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-primary" />
              Free Quota & Limit Rules
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                • <strong>2 to 5 Resumes Free:</strong> You can save up to 5 resumes simultaneously.
              </p>
              <p>
                • <strong>Instant Refresh:</strong> When full, delete any old resume from your History to free up a slot immediately.
              </p>
              <p>
                • <strong>Fast Delivery:</strong> Every scan finishes in 2 to 5 seconds.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
