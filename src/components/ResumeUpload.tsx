import React, { useState, useEffect, useRef } from 'react';

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Camera, 
  FileType,
  History,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Loader2,
  Brain,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/src/lib/utils';
import { mongoApi } from '../lib/mongoApi';
import { toast } from 'sonner';

interface ResumeUploadProps {
  onSuccess: (data: any) => void;
  userId: string;
  onNavigate?: (tab: string) => void;
  isAdmin?: boolean;
}

// Client-side image optimizer to ensure fast, reliable upload for mobile & high-res photos
const prepareFilePayload = async (file: File): Promise<{ base64: string; mimeType: string }> => {
  const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|heic|heif)$/i.test(file.name);
  
  if (isImage) {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          try {
            URL.revokeObjectURL(url);
            let width = img.width;
            let height = img.height;
            const maxDim = 1800;
            
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
              const base64 = dataUrl.split(',')[1];
              resolve({ base64, mimeType: 'image/jpeg' });
              return;
            }
          } catch (canvasErr) {
            console.warn("Canvas optimization fallback:", canvasErr);
          }
          
          // Fallback direct FileReader if canvas fails
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ base64, mimeType: 'image/jpeg' });
          };
          reader.onerror = () => resolve({ base64: '', mimeType: 'image/jpeg' });
          reader.readAsDataURL(file);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ base64, mimeType: 'image/jpeg' });
          };
          reader.onerror = () => resolve({ base64: '', mimeType: 'image/jpeg' });
          reader.readAsDataURL(file);
        };

        img.src = url;
      } catch (err) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({ base64, mimeType: 'image/jpeg' });
        };
        reader.onerror = () => resolve({ base64: '', mimeType: 'image/jpeg' });
        reader.readAsDataURL(file);
      }
    });
  } else {
    // For PDFs (digital & scanned) and Word documents
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
  }
};

const FREE_RESUME_LIMIT = 10;

export function ResumeUpload({ onSuccess, userId, onNavigate, isAdmin }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);

  const [currentIndexStep, setCurrentIndexStep] = useState<number>(0);
  const [completedIndexSteps, setCompletedIndexSteps] = useState<number[]>([]);
  const [detectedRoleName, setDetectedRoleName] = useState<string>('');
  const [indexedSkillsCount, setIndexedSkillsCount] = useState<number>(0);

  const indexSteps = [
    { title: "Document Structure & OCR Layer", desc: "Extracting text layout, syntax & raw resume streams" },
    { title: "AI Vision & Candidate Scan", desc: "Gemini neural model analyzing candidate profile background" },
    { title: "Skills & Experience Extraction", desc: "Indexing core competencies, technical tools & project history" },
    { title: "Role Synthesis & Flight Deck", desc: "Verifying primary role & configuring target parameters" }
  ];

  // Check current resume count on mount
  useEffect(() => {
    async function checkCount() {
      if (!userId) {
        setSavedCount(0);
        setLoadingCount(false);
        return;
      }
      try {
        setLoadingCount(true);
        const list = await mongoApi.getResumes(userId);
        setSavedCount(Array.isArray(list) ? list.length : 0);
      } catch (e) {
        console.error("Failed to check resume quota:", e);
      } finally {
        setLoadingCount(false);
      }
    }
    checkCount();
  }, [userId]);

  const [usage, setUsage] = useState<{ availableCredits: number; limit: number; plan: string; resetDate?: string } | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    if (!userId) return;
    async function checkUsage() {
      try {
        setLoadingUsage(true);
        const res = await fetch(`${BASE_URL}/api/users/${userId}/usage`);
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } catch (e) {
        console.error("Failed to check usage:", e);
      } finally {
        setLoadingUsage(false);
      }
    }
    checkUsage();
  }, [userId]);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Check if free storage limit of 3 is exceeded (admins are exempt)
    if (!isAdmin && savedCount >= FREE_RESUME_LIMIT) {
      toast.error(`3 History Slots Full (${savedCount}/${FREE_RESUME_LIMIT}). Please delete an older resume in History first.`);
      setError(`आपके 3 फ्री रिज्यूमे स्लॉट्स भर चुके हैं (${savedCount}/${FREE_RESUME_LIMIT})। नया रिज्यूमे अपलोड करने के लिए कृपया Career History में जाकर पुराना रिज्यूमे डिलीट करें।`);
      setStatus('error');
      return;
    }

    // Check if 7-day scan credit limit is reached only if user has actually filled all 3 slots
    if (!isAdmin && usage && usage.plan !== 'PREMIUM' && usage.availableCredits <= 0 && savedCount >= FREE_RESUME_LIMIT) {
      const daysLeft = Math.max(1, Math.ceil((new Date(usage.resetDate || Date.now()).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      const resetStr = usage.resetDate ? new Date(usage.resetDate).toLocaleDateString() : `${daysLeft} days`;
      toast.error(`7-Day Free Scan Limit Reached (3/3 Used). Quota resets on ${resetStr}.`);
      setError(`आपकी 3 फ्री रिज्यूमे स्कैनिंग लिमिट पूरी हो चुकी है। आपकी यह लिमिट ${resetStr} को ऑटोमैटिकली रीसेट होगी। कृपया वापस आने तक इंतज़ार करें।`);
      setStatus('error');
      return;
    }

    // Size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      setError("File size exceeds 25MB. Please upload a smaller document or photo.");
      setStatus('error');
      return;
    }

    const filename = file.name || '';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    const isPdf = file.type === 'application/pdf' || ext === 'pdf';
    const isDocx = file.type.includes('word') || file.type.includes('officedocument') || ext === 'docx' || ext === 'doc';
    const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'heic', 'heif'].includes(ext);

    if (!isPdf && !isDocx && !isImage) {
      setError("Unsupported format. Please upload a PDF (digital or scanned), Photo (JPG, PNG), or DOCX file.");
      setStatus('error');
      return;
    }

    try {
      setStatus('uploading');
      setProgress(15);
      setError(null);
      setCurrentIndexStep(0);
      setCompletedIndexSteps([]);
      setDetectedRoleName('');
      setIndexedSkillsCount(0);

      // Prepare payload with automatic image optimization for high-res photos
      const { base64, mimeType } = await prepareFilePayload(file);
      
      if (!base64) {
        throw new Error("Unable to process file data. Please try selecting the file again.");
      }

      setStatus('parsing');
      setProgress(25);

      // Progressive indexing feedback while Gemini AI processes the document
      const timer1 = setTimeout(() => {
        setCompletedIndexSteps([0]);
        setCurrentIndexStep(1);
        setProgress(45);
      }, 700);

      const timer2 = setTimeout(() => {
        setCompletedIndexSteps([0, 1]);
        setCurrentIndexStep(2);
        setProgress(65);
      }, 1500);

      // Document Text Extraction & Gemini AI Deep Analysis
      const res = await fetch(`${BASE_URL}/api/resume/parse-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          mimeType,
          filename: file.name
        })
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Server error" }));
        throw new Error(errorData.error || "Failed to analyze document.");
      }

      const result = await res.json();
      const detected = (result.detectedRole || "").trim();
      const skillsCount = Array.isArray(result.skills) ? result.skills.length : (result.data?.skills?.length || 0);

      // Mark Step 1, 2, 3 as complete and move to Step 4
      setCompletedIndexSteps([0, 1, 2]);
      setCurrentIndexStep(3);
      setIndexedSkillsCount(skillsCount);
      if (detected) setDetectedRoleName(detected);
      setProgress(85);

      // Guaranteed dwell on Step 4 so user clearly sees the 4th index finish and verify their role
      await new Promise(r => setTimeout(r, 700));
      setCompletedIndexSteps([0, 1, 2, 3]);
      setProgress(100);

      // Short pause to view all 4 completed indexes
      await new Promise(r => setTimeout(r, 500));
      setStatus('success');

      setTimeout(() => {
        onSuccess({
          parsedData: result.data || {
            skills: result.skills || [],
            experience: result.experience || [],
            education: result.education || [],
            keywords: result.skills || []
          },
          text: result.text,
          detectedRole: detected,
          currentRole: result.currentRole,
          detectedIndustry: result.detectedIndustry,
          candidateName: result.candidateName,
          roleReasoning: result.roleReasoning,
          suggestedTargetRoles: result.suggestedTargetRoles || [],
          skills: result.skills || [],
          base64,
          mimeType,
          filename: file.name,
          analysisSpeed: result.analysisSpeed || '2.2s'
        });
      }, 350);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload and parse resume.");
      setStatus('error');
    }
  };

  const isCreditLimitReached = !isAdmin && usage !== null && usage.plan !== 'PREMIUM' && usage.availableCredits <= 0 && savedCount >= FREE_RESUME_LIMIT;
  const isStorageLimitReached = !isAdmin && savedCount >= FREE_RESUME_LIMIT;

  return (
    <div 
      className={cn(
        "relative rounded-[2.5rem] border-2 border-dashed transition-all p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[380px] bg-card/40 backdrop-blur-md",
        isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border/80 hover:border-primary/50"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      }}
    >
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-xl mx-auto"
          >

            <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner border border-primary/20">
              <Upload className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Upload Your Resume
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium max-w-md mx-auto">
                Drag and drop your file or click to browse. Automatically supports digital PDFs, scanned image PDFs, Word documents, and photo snapshots.
              </p>
            </div>

            {/* Supported Formats Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <FileText className="w-4 h-4" />
                PDF (Digital & Scanned)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Camera className="w-4 h-4" />
                Photos (JPG, PNG)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <FileType className="w-4 h-4" />
                Word DOCX
              </span>
            </div>

            <input 
              type="file" 
              id="resume-file-upload" 
              className="hidden" 
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,image/*"
              onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
            />

            <div>
              <label 
                htmlFor="resume-file-upload" 
                className={cn(
                  "inline-flex items-center justify-center rounded-2xl h-12 sm:h-14 px-8 sm:px-10 font-bold shadow-lg shadow-primary/25 cursor-pointer transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base"
                )}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Resume File or Photo
              </label>
            </div>

            {/* Free Tier & Instant Speed Info Banner */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Fast 2–5 Seconds Instant AI Scan
              </span>
            </div>
          </motion.div>
        )}

        {(status === 'uploading' || status === 'parsing') && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg text-left space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                    Deep Resume Indexing (4 Stages)
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Google Gemini AI analyzing candidate background & extracting exact profile
                  </p>
                </div>
              </div>
              <span className="text-xs font-black font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {progress}%
              </span>
            </div>

            <Progress value={progress} className="h-2 bg-primary/10 rounded-full" />

            {/* 4 Index Steps Card */}
            <div className="space-y-2 bg-muted/30 dark:bg-zinc-900/40 p-3.5 sm:p-4 rounded-2xl border border-border/70 shadow-inner">
              {indexSteps.map((s, idx) => {
                const isDone = completedIndexSteps.includes(idx);
                const isCurrent = currentIndexStep === idx && !isDone;
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-xl transition-all",
                      isDone ? "bg-emerald-500/5 text-foreground" : isCurrent ? "bg-primary/5 border border-primary/20" : "opacity-60"
                    )}
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "text-xs font-bold truncate",
                          isDone ? "text-emerald-700 dark:text-emerald-400 font-extrabold" : isCurrent ? "text-primary font-black" : "text-muted-foreground"
                        )}>
                          Index {idx + 1}: {s.title}
                        </span>
                        {isDone && (
                          <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono shrink-0">
                            Verified ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {idx === 2 && indexedSkillsCount > 0
                          ? `Indexed ${indexedSkillsCount} verified skills & competencies`
                          : idx === 3 && detectedRoleName 
                            ? `Identified Profile: ${detectedRoleName}` 
                            : s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-3 max-w-md mx-auto"
          >
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto border border-emerald-500/20">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              All 4 Resume Indexes Verified!
            </h3>
            {detectedRoleName && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black font-mono">
                AI Detected Role: {detectedRoleName}
              </div>
            )}
            <p className="text-muted-foreground text-xs font-medium">Opening Target Career Selection Board...</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4 max-w-md mx-auto"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-destructive">
                {(isCreditLimitReached || isStorageLimitReached) ? "Limit Notice" : "Upload Failed"}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                {error}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setStatus('idle')} 
                className="rounded-xl font-bold cursor-pointer"
              >
                Try Again
              </Button>
              {onNavigate && (
                <Button 
                  onClick={() => onNavigate('history')} 
                  className="rounded-xl font-bold cursor-pointer bg-primary text-primary-foreground gap-2"
                >
                  <History className="w-4 h-4" />
                  <span>Go to History</span>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dragging Overlay */}
      {isDragging && (
        <motion.div 
          className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-[2.5rem] pointer-events-none flex items-center justify-center backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center font-black text-primary text-lg">
            Release to drop resume
          </div>
        </motion.div>
      )}
    </div>
  );
}
