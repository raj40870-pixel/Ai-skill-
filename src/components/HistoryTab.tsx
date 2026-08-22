import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  FileText, 
  Calendar, 
  Trash2, 
  ArrowRight, 
  FileSpreadsheet,
  Image as ImageIcon,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Loader2,
  BarChart3
} from 'lucide-react';
import { mongoApi } from '../lib/mongoApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface HistoryTabProps {
  userId: string;
  onSelectResume: (resumeId: string, resumeData: any) => void;
  activeResumeId?: string;
  onDeleteResume?: (deletedResumeId: string) => void;
  onClearAllHistory?: () => void;
  onNavigate?: (tab: string) => void;
}

export function HistoryTab({ 
  userId, 
  onSelectResume, 
  activeResumeId, 
  onDeleteResume, 
  onClearAllHistory,
  onNavigate 
}: HistoryTabProps) {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Single delete state
  const [itemToDelete, setItemToDelete] = useState<{ id: string; filename: string } | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  
  // Clear all state
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      console.log(`[HistoryTab] Fetching history for userId: ${userId || 'EMPTY'}`);
      
      if (!userId) {
        setHistoryList([]);
        setLoading(false);
        return;
      }

      const list = await mongoApi.getResumes(userId);
      const validList = (list || [])
        .filter((item: any) => item && (item.id || item._id))
        .map((item: any) => {
          const rawId = item.id || item._id;
          const stringId = (typeof rawId === 'object' && rawId.$oid) ? rawId.$oid : rawId.toString();
          return {
            ...item,
            id: stringId,
            _id: stringId
          };
        });

      setHistoryList(validList);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load upload history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const handleDeleteSingle = async () => {
    if (!itemToDelete || !userId) return;
    
    try {
      setIsDeletingSingle(true);
      await mongoApi.deleteResume(userId, itemToDelete.id);
      
      // Update local state immediately
      setHistoryList(prev => prev.filter(r => r.id !== itemToDelete.id));
      toast.success(`"${itemToDelete.filename}" removed from history.`);
      
      // Notify parent if active resume was deleted
      if (onDeleteResume) {
        onDeleteResume(itemToDelete.id);
      }
      
      setItemToDelete(null);
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(error.message || "Failed to delete historical record.");
    } finally {
      setIsDeletingSingle(false);
    }
  };

  const handleClearAll = async () => {
    if (!userId) return;

    try {
      setIsClearingAll(true);
      await mongoApi.deleteAllResumes(userId);
      
      setHistoryList([]);
      toast.success("All career scan history cleared successfully.");
      
      if (onClearAllHistory) {
        onClearAllHistory();
      }
      
      setIsClearAllOpen(false);
    } catch (error: any) {
      console.error("Clear all failed:", error);
      toast.error(error.message || "Failed to clear history.");
    } finally {
      setIsClearingAll(false);
    }
  };

  const getFormatIcon = (mimeType?: string) => {
    if (!mimeType) return FileText;
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.includes('word') || mimeType.includes('officedocument')) return FileSpreadsheet;
    return FileText;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
            Career <span className="text-primary italic">History</span>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20">
              {historyList.length} / 5 Free Slots Used
            </span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm sm:text-base mt-1">
            Store and analyze 2 to 5 resumes for free with fast 2–5s instant delivery and permanent cloud storage.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {historyList.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearAllOpen(true)}
              className="rounded-2xl border-rose-500/30 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer text-xs font-bold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear All
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchHistory} 
            disabled={loading}
            className="rounded-2xl border-primary/20 hover:bg-primary/5 cursor-pointer text-xs font-bold transition-all"
          >
            <History className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {onNavigate && (
            <Button
              size="sm"
              onClick={() => onNavigate('upload')}
              className="rounded-2xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover:opacity-95 text-xs transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
              Upload New
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium italic">Scanning cloud career ledger...</p>
        </div>
      ) : historyList.length === 0 ? (
        <Card className="glass border border-dashed border-border/80 rounded-[2.5rem] p-12 sm:p-16 text-center max-w-xl mx-auto bg-card/60 shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black mb-2 tracking-tight">No History Found</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md mx-auto">
            You don't have any saved resume scans or career roadmaps yet. Upload a resume to generate an instant ATS audit and custom roadmap.
          </p>
          {onNavigate && (
            <Button
              onClick={() => onNavigate('upload')}
              className="rounded-2xl px-8 h-12 font-black shadow-lg shadow-primary/25 bg-primary text-primary-foreground"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload Your First Resume
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {historyList.map((item, idx) => {
              const Icon = getFormatIcon(item.mimeType);
              const isActive = activeResumeId === item.id;
              const rawDate = item.createdAt ? new Date(item.createdAt) : new Date();
              const formattedDate = rawDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              const score = item.ats?.score;
              const scoreLabel = item.ats?.label;
              const sprintsCount = item.roadmap?.sprints?.length || 0;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card 
                    onClick={() => onSelectResume(item.id, item)}
                    className={`group relative glass border rounded-[2rem] p-6 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                      isActive 
                        ? 'border-primary/50 ring-2 ring-primary/20 bg-primary/[0.03] dark:bg-primary/[0.04]' 
                        : 'border-border/60 bg-card/60 hover:border-primary/30 hover:bg-card/90'
                    }`}
                  >
                    {/* Active Ribbon Badge */}
                    {isActive && (
                      <div className="absolute top-0 right-14 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-b-xl shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active Context
                      </div>
                    )}

                    <div>
                      {/* Top Header with Icon & Delete Button */}
                      <div className="flex justify-between items-start mb-4 gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all shrink-0 ${
                            isActive 
                              ? 'bg-primary/20 text-primary border-primary/30' 
                              : 'bg-muted text-muted-foreground border-border/50 group-hover:text-primary group-hover:bg-primary/10'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm sm:text-base truncate" title={item.filename}>
                              {item.filename || 'Career Record'}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mt-0.5">
                              <Calendar className="w-3 h-3 text-primary/70" />
                              <span>{formattedDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Individual Delete Action */}
                        <button
                          type="button"
                          aria-label={`Delete ${item.filename || 'record'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete({ id: item.id, filename: item.filename || 'this record' });
                          }}
                          className="w-9 h-9 rounded-xl border border-transparent hover:border-rose-500/20 text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-500/10 flex items-center justify-center transition-all shrink-0 cursor-pointer"
                          title="Delete from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Score & Roadmap Badges */}
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {typeof score === 'number' && (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            score >= 80 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                              : score >= 60 
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}>
                            <BarChart3 className="w-3 h-3" />
                            ATS {score}% {scoreLabel ? `• ${scoreLabel}` : ''}
                          </span>
                        )}

                        {sprintsCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            <Sparkles className="w-3 h-3" />
                            {sprintsCount} Sprints Roadmap
                          </span>
                        )}
                      </div>

                      {/* Skills Tag Preview */}
                      <div className="flex flex-wrap gap-1.5 mb-6 min-h-[2.5rem]">
                        {item.parsedData?.skills?.slice(0, 4).map((skill: string) => (
                          <span key={skill} className="px-2 py-0.5 rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground">
                            {skill}
                          </span>
                        )) || (
                          <span className="italic text-xs text-muted-foreground/60">No explicit skills extracted</span>
                        )}
                        {item.parsedData?.skills && item.parsedData.skills.length > 4 && (
                          <span className="text-[10px] font-bold text-muted-foreground self-center">
                            +{item.parsedData.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-between pt-3.5 border-t border-border/40 text-xs">
                      <span className="text-muted-foreground font-medium text-[11px]">
                        {isActive ? 'Current active workspace' : 'Click card to switch'}
                      </span>
                      
                      <div className="flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider text-primary group-hover:translate-x-1 transition-transform">
                        {isActive ? 'Active' : 'Load Scan'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Single Item Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && !isDeletingSingle && setItemToDelete(null)}>
        <DialogContent className="rounded-3xl max-w-md p-6">
          <DialogHeader className="gap-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-1">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black">Delete Resume Record?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Are you sure you want to delete <strong className="text-foreground">{itemToDelete?.filename}</strong>?
              This will permanently remove the resume text, ATS score breakdown, and generated learning roadmap from your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setItemToDelete(null)}
              disabled={isDeletingSingle}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSingle}
              disabled={isDeletingSingle}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
            >
              {isDeletingSingle ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Record
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={isClearAllOpen} onOpenChange={(open) => !open && !isClearingAll && setIsClearAllOpen(false)}>
        <DialogContent className="rounded-3xl max-w-md p-6">
          <DialogHeader className="gap-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-1">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black">Clear All Scan History?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              This action will permanently delete all <strong className="text-foreground">{historyList.length} records</strong>, including all uploaded resumes, ATS scores, and roadmaps. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsClearAllOpen(false)}
              disabled={isClearingAll}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
            >
              {isClearingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Clearing All...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All ({historyList.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
