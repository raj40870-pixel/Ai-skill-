import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LifeBuoy, 
  X, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Search, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldAlert, 
  Sparkles,
  Bug,
  FileQuestion,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { mongoApi, SupportTicket } from '../lib/mongoApi';

interface SupportDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
}

export function SupportDeskModal({ isOpen, onClose, currentUser }: SupportDeskModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'status'>('create');
  
  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bug / Technical Error');
  const [priority, setPriority] = useState('Medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  // Status / Track State
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize email/name/url from currentUser or browser
  useEffect(() => {
    if (currentUser) {
      if (currentUser.email && currentUser.email !== 'guest@careernav.ai') {
        setEmail(currentUser.email);
      }
      if (currentUser.displayName) {
        setName(currentUser.displayName);
      }
    } else {
      const stored = localStorage.getItem('careernav_guest_email');
      if (stored) setEmail(stored);
    }
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.pathname + window.location.search);
    }
  }, [currentUser, isOpen]);

  // Fetch user tickets when switching to status tab
  useEffect(() => {
    if (isOpen && activeTab === 'status') {
      fetchTickets();
    }
  }, [isOpen, activeTab, email, currentUser]);

  const fetchTickets = async () => {
    const searchEmail = email.trim() || (currentUser?.email && currentUser.email !== 'guest@careernav.ai' ? currentUser.email : '');
    const uid = currentUser?.uid || '';
    if (!searchEmail && !uid) return;

    setIsLoadingTickets(true);
    try {
      const tickets = await mongoApi.getMySupportTickets(searchEmail, uid);
      setMyTickets(tickets);
    } catch (err) {
      console.warn("Could not load user tickets:", err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    if (!cleanEmail || !cleanTitle || !cleanDesc) {
      toast.error("Please fill in email, title, and issue details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await mongoApi.createSupportTicket({
        userId: currentUser?.uid || '',
        userEmail: cleanEmail,
        userName: name.trim() || cleanEmail.split('@')[0],
        category,
        priority,
        title: cleanTitle,
        description: cleanDesc,
        pageUrl: pageUrl || window.location.href
      });

      setSubmittedTicket(res.ticket);
      toast.success(res.message || "Ticket submitted successfully!");
      // Reset form
      setTitle('');
      setDescription('');
      // Save email for next time
      localStorage.setItem('careernav_guest_email', cleanEmail);
    } catch (err: any) {
      console.error("[SupportDesk] Submit error:", err);
      toast.error(err.message || "Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicketId = (tId: string) => {
    navigator.clipboard.writeText(tId);
    setCopiedId(tId);
    toast.success(`Copied ticket ID: ${tId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Submitted • Under Review
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            In Progress • Fixing Now
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Resolved & Deployed
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const filteredTickets = myTickets.filter(t => 
    (t.ticketId && t.ticketId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-border rounded-3xl shadow-2xl overflow-hidden my-auto z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-red-500/10 via-primary/5 to-transparent flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight text-foreground">
                    Help & Issue Support Desk
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                    Live
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Report any bug, error, or glitch. The founder and dev team review and resolve all tickets quickly.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-border bg-muted/30 px-6 pt-2">
            <button
              onClick={() => {
                setActiveTab('create');
                setSubmittedTicket(null);
              }}
              className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bug className="w-4 h-4" />
              <span>Report An Issue</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('status');
                fetchTickets();
              }}
              className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'status'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Track Ticket Status {myTickets.length > 0 && `(${myTickets.length})`}</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* TAB 1: REPORT NEW ISSUE */}
            {activeTab === 'create' && (
              <>
                {submittedTicket ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-foreground">Issue Submitted Successfully!</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                        Your issue has been logged in our engineering issue tracker and an instant alert was dispatched to the founder.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-border inline-flex items-center gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block font-mono">Your Ticket Reference</span>
                        <span className="text-lg font-mono font-black text-red-600 dark:text-red-400">{submittedTicket.ticketId}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyTicketId(submittedTicket.ticketId)}
                        className="rounded-xl border-border h-9"
                      >
                        {copiedId === submittedTicket.ticketId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        onClick={() => setActiveTab('status')}
                        className="w-full sm:w-auto rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                      >
                        Track Ticket Status
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setSubmittedTicket(null)}
                        className="w-full sm:w-auto rounded-xl text-xs font-semibold"
                      >
                        Submit Another Issue
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                          Your Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full h-11 px-3.5 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:border-red-500 text-foreground transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Kamaljit / Guest"
                          className="w-full h-11 px-3.5 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:border-red-500 text-foreground transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                          Issue Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-muted/40 border border-border text-xs font-bold text-foreground focus:outline-none focus:border-red-500"
                        >
                          <option value="Bug / Technical Error">🐛 Bug / Technical Error</option>
                          <option value="Resume Parsing Issue">📄 Resume Parsing Issue</option>
                          <option value="ATS Score & Analysis Issue">📊 ATS Score & Analysis Issue</option>
                          <option value="Roadmap & AI Generation Glitch">🗺️ Roadmap & AI Generation Glitch</option>
                          <option value="Account, Login & 2FA Issue">🔐 Account, Login & 2FA Issue</option>
                          <option value="Website Performance & UI">⚡ Website Performance & UI</option>
                          <option value="Feature Request / Suggestion">💡 Feature Request / Suggestion</option>
                          <option value="General Question">❓ Other / General Question</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                          Severity / Priority
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-muted/40 border border-border text-xs font-bold text-foreground focus:outline-none focus:border-red-500"
                        >
                          <option value="Low">Low (Minor visual / typo)</option>
                          <option value="Medium">Medium (Feature slow or unexpected)</option>
                          <option value="High">High (Important feature broken)</option>
                          <option value="Critical">Critical (Cannot login / page crashes)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                        Issue Title / Summary <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. ATS score shows error 500 when uploading PDF resume"
                        className="w-full h-11 px-3.5 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:border-red-500 text-foreground transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                        Detailed Description & Error Text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please describe exactly what happened. What buttons did you click? Did any error message appear on screen?"
                        className="w-full p-3.5 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:border-red-500 text-foreground transition-all resize-none leading-relaxed"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Submitting this ticket alerts the <strong>Career Navigation AI</strong> admin team immediately. You will receive updates directly here and at your email address.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Logging Ticket...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Submit Issue to Engineering Desk
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </>
            )}

            {/* TAB 2: TRACK STATUS & ADMIN REPLIES */}
            {activeTab === 'status' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tickets by reference ID or title..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/40 border border-border text-xs focus:outline-none focus:border-red-500 text-foreground"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTickets}
                    disabled={isLoadingTickets}
                    className="h-10 rounded-xl border-border text-xs font-bold cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingTickets ? 'animate-spin' : ''}`} />
                    Refresh Status
                  </Button>
                </div>

                {isLoadingTickets ? (
                  <div className="py-12 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-red-500 animate-spin mx-auto" />
                    <p className="text-xs text-muted-foreground">Checking live ticket updates...</p>
                  </div>
                ) : filteredTickets.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTickets.map((t) => (
                      <Card key={t.ticketId} className="p-4 sm:p-5 rounded-2xl border-border bg-card/60 space-y-3 relative overflow-hidden">
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-red-600 dark:text-red-400">
                              #{t.ticketId}
                            </span>
                            <button
                              onClick={() => handleCopyTicketId(t.ticketId)}
                              className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                              title="Copy ID"
                            >
                              {copiedId === t.ticketId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-bold uppercase text-muted-foreground">
                              {t.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusBadge(t.status)}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-bold text-foreground text-sm sm:text-base">{t.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                            {t.description}
                          </p>
                          <span className="text-[10px] text-zinc-400 mt-2 block font-mono">
                            Reported on: {new Date(t.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>

                        {/* Founder / Admin Reply Box */}
                        {t.adminReply ? (
                          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2 mt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                <UserCheck className="w-4 h-4" />
                                Official Response from Founder ({t.adminRepliedBy || 'Kamaljit'}):
                              </span>
                              {t.adminRepliedAt && (
                                <span className="text-[10px] font-mono text-blue-400">
                                  {new Date(t.adminRepliedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-foreground font-medium whitespace-pre-wrap leading-relaxed">
                              {t.adminReply}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-muted/40 border border-dashed border-border/80 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Founder and engineering team are reviewing this error. You will see their reply right here once processed.</span>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <FileQuestion className="w-8 h-8 text-muted-foreground mx-auto" />
                    <div>
                      <h4 className="font-bold text-foreground text-sm">No Tickets Found</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {email ? `No active tickets found for ${email}.` : "Enter your email or submit a new ticket."}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('create')}
                      className="rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Submit a New Issue
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
