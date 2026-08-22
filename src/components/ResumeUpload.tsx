import React, { useState, useEffect } from 'react';
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
  RotateCcw
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

const FREE_RESUME_LIMIT = 5;

export function ResumeUpload({ onSuccess, userId, onNavigate }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);

  const [parsingStep, setParsingStep] = useState(0);
  const parsingMessages = [
    "Reading document structure...",
    "AI Vision analyzing candidate background...",
    "Extracting skills, experience & education...",
    "Preparing career flight deck..."
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

  const [usage, setUsage] = useState<{ availableCredits: number; limit: number; plan: string } | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    if (!userId) return;
    async function checkUsage() {
      try {
        setLoadingUsage(true);
        const res = await fetch(`/api/users/${userId}/usage`);
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

    // Check if free limit of 5 is exceeded
    if (savedCount >= FREE_RESUME_LIMIT) {
      toast.error(`Free Limit Reached (${savedCount}/${FREE_RESUME_LIMIT}). Please delete an older resume in History first.`);
      setError(`You have reached the free limit of ${FREE_RESUME_LIMIT} stored resumes. Please delete an older resume from History to upload a new one.`);
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
      setProgress(20);
      setError(null);

      // Prepare payload with automatic image optimization for high-res photos
      const { base64, mimeType } = await prepareFilePayload(file);
      
      if (!base64) {
        throw new Error("Unable to process file data. Please try selecting the file again.");
      }

      setProgress(45);
      setStatus('parsing');

      // Document Text Extraction & Multimodal AI Vision
      const res = await fetch('/api/resume/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          mimeType,
          filename: file.name
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Server error" }));
        throw new Error(errorData.error || "Failed to analyze document.");
      }

      const result = await res.json();
      setProgress(90);

      // Successfully parsed
      setStatus('success');
      setProgress(100);

      setTimeout(() => {
        onSuccess({
          parsedData: result.data,
          text: result.text,
          base64,
          mimeType,
          filename: file.name,
          analysisSpeed: result.analysisSpeed || '2.4s'
        });
      }, 400);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload and parse resume.");
      setStatus('error');
    }
  };

  const isLimitReached = savedCount >= FREE_RESUME_LIMIT;

  return (
    <div 
      className={cn(
        "relative rounded-[2.5rem] border-2 border-dashed transition-all p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[380px] bg-card/40 backdrop-blur-md",
        isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border/80 hover:border-primary/50",
        isLimitReached ? "border-amber-500/40 bg-amber-500/[0.02]" : ""
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
        {status === 'idle' && isLimitReached && (
          <motion.div
            key="limit-reached"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto space-y-5"
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 text-xs font-black uppercase tracking-wider">
                Free Limit Reached ({savedCount} / {FREE_RESUME_LIMIT} Resumes)
              </span>
              <h3 className="text-2xl font-black text-foreground tracking-tight pt-1">
                Storage Limit Full
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                You have reached the free limit of <strong>5 saved resumes</strong>. Your free scan allowance automatically refreshes every <strong>7 days</strong>, or you can delete an older resume from your Career History right now to free up a slot immediately.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {onNavigate && (
                <Button
                  onClick={() => onNavigate('history')}
                  className="rounded-2xl h-12 px-6 font-black bg-primary text-primary-foreground hover:bg-primary/90 text-xs uppercase tracking-wider shadow-lg shadow-primary/20 gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <History className="w-4 h-4" />
                  <span>Go to History & Free a Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {status === 'idle' && !isLimitReached && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            {/* Top Limit Meter */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/60 border border-border text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Free Quota: {savedCount} of {FREE_RESUME_LIMIT} Resumes Used</span>
              <span className="text-muted-foreground">({FREE_RESUME_LIMIT - savedCount} slots open)</span>
            </div>

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
              {usage?.plan !== 'PREMIUM' && (
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-colors",
                  usage && usage.availableCredits > 0 
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                )}>
                  <RotateCcw className={cn("w-3.5 h-3.5", usage && usage.availableCredits > 0 ? "animate-pulse" : "")} />
                  {loadingUsage ? "Checking Credits..." : `Scans Available: ${usage?.availableCredits ?? 0} / 3`}
                </span>
              )}
              {usage?.plan === 'PREMIUM' && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Premium: Unlimited Scans Available
                </span>
              )}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-sm text-center space-y-6"
          >
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Analyzing Resume...
                </h3>
              </div>
              <Progress value={progress} className="h-2 bg-primary/10 rounded-full" />
              <div className="flex items-center justify-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                  {parsingMessages[parsingStep]}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-3"
          >
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Analysis Complete!</h3>
            <p className="text-muted-foreground text-sm font-medium">Text parsed successfully in 2.4s. Loading roadmap insights...</p>
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
                {isLimitReached ? "Free Limit Reached" : "Upload Failed"}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                {error}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              {isLimitReached && onNavigate ? (
                <Button 
                  onClick={() => onNavigate('history')} 
                  className="rounded-xl font-bold cursor-pointer bg-primary text-primary-foreground gap-2"
                >
                  <History className="w-4 h-4" />
                  <span>Go to History</span>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setStatus('idle')} 
                  className="rounded-xl font-bold cursor-pointer"
                >
                  Try Again
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dragging Overlay */}
      {isDragging && !isLimitReached && (
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
