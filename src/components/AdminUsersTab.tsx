import React, { useState, useEffect } from 'react';
import { mongoApi, SupportTicket } from '../lib/mongoApi';
import { 
  Users, 
  Search, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Calendar,
  RefreshCw,
  Zap,
  Sparkles,
  Lock,
  Crown,
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  X,
  Filter,
  ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_EMAILS = [
  "kamaljit444501@gmail.com",
  "kamaljit44501@gmail.com"
];

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export function AdminUsersTab() {
  const [currentSection, setCurrentSection] = useState<'users' | 'tickets'>('tickets');
  
  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'premium' | 'free'>('all');

  // Support Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [ticketStatusUpdate, setTicketStatusUpdate] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('RESOLVED');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, ticketsData] = await Promise.all([
        mongoApi.getAdminUsers().catch(err => {
          console.warn("Could not load admin users:", err);
          return [];
        }),
        mongoApi.getAdminSupportTickets().catch(err => {
          console.warn("Could not load admin support tickets:", err);
          return [];
        })
      ]);
      setUsers(usersData || []);
      setTickets(ticketsData || []);
    } catch (err: any) {
      console.error("Failed to fetch admin data:", err);
      toast.error(err.message || "Access denied or session expired.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const isUserAdmin = (u: any) => {
    const emailLower = (u.email || '').toLowerCase().trim();
    return ADMIN_EMAILS.includes(emailLower) || u.plan === 'ENTERPRISE_ADMIN' || u.plan === 'ADMIN' || u.isAdmin === true || u.role === 'admin';
  };

  // Filtered Users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterRole === 'admin') return isUserAdmin(user);
    if (filterRole === 'premium') return user.plan === 'PREMIUM' || user.plan === 'ENTERPRISE_ADMIN';
    if (filterRole === 'free') return !isUserAdmin(user) && user.plan !== 'PREMIUM';
    return true;
  });

  // Filtered Tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      (t.ticketId && t.ticketId.toLowerCase().includes(ticketSearch.toLowerCase())) ||
      (t.title && t.title.toLowerCase().includes(ticketSearch.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(ticketSearch.toLowerCase())) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(ticketSearch.toLowerCase())) ||
      (t.userName && t.userName.toLowerCase().includes(ticketSearch.toLowerCase()));

    if (!matchesSearch) return false;
    if (ticketStatusFilter !== 'all' && t.status !== ticketStatusFilter) return false;
    return true;
  });

  const totalAdmins = users.filter(isUserAdmin).length;
  const totalPremium = users.filter(u => u.plan === 'PREMIUM' || u.plan === 'ENTERPRISE_ADMIN').length;
  const openTicketsCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressTicketsCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedTicketsCount = tickets.filter(t => t.status === 'RESOLVED').length;

  const handleOpenReplyModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setAdminReplyText(ticket.adminReply || '');
    setTicketStatusUpdate(ticket.status === 'OPEN' ? 'RESOLVED' : ticket.status);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!adminReplyText.trim()) {
      toast.error("Please enter a reply message for the user.");
      return;
    }

    setIsSubmittingReply(true);
    try {
      const res = await mongoApi.replyAdminSupportTicket(selectedTicket.ticketId, {
        adminReply: adminReplyText.trim(),
        status: ticketStatusUpdate,
        adminRepliedBy: 'Kamaljit (Founder)'
      });

      toast.success(res.message || "Reply sent to user and ticket updated!");
      // Update local state
      setTickets(prev => prev.map(t => t.ticketId === selectedTicket.ticketId ? res.ticket : t));
      setSelectedTicket(null);
    } catch (err: any) {
      console.error("Reply error:", err);
      toast.error(err.message || "Failed to update ticket.");
    } finally {
      setIsSubmittingReplyReply(false);
    }
  };

  const setIsSubmittingReplyReply = (val: boolean) => setIsSubmittingReply(val);

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Founder & Admin Management Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-red-500/20 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3" />
              Founder & Master Admin Console
            </span>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              2FA Active
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 text-foreground">
            Startup Control Center & Support Desk
          </h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Resolve user issues, review system tickets, and monitor platform accounts in real time.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-xl border-red-500/30 text-red-600 hover:bg-red-500/10 hover:border-red-500/50 cursor-pointer font-bold h-9"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", refreshing && "animate-spin")} />
            Refresh Records
          </Button>
        </div>
      </div>

      {/* Primary Section Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-border pb-1">
        <button
          onClick={() => setCurrentSection('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            currentSection === 'tickets'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Support & Error Tickets</span>
          {openTicketsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-white text-red-600 text-[10px] font-black animate-pulse">
              {openTicketsCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentSection('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            currentSection === 'users'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Users ({users.length})</span>
        </button>
      </div>

      {/* SECTION 1: SUPPORT TICKETS & ERROR RESOLUTION */}
      {currentSection === 'tickets' && (
        <div className="space-y-6">
          {/* Support KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 rounded-2xl border-red-500/20 bg-red-500/[0.03] space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-500 block font-mono">Open / Urgent</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-red-600 dark:text-red-400">{openTicketsCount}</span>
                <span className="text-[10px] text-red-500 font-bold">Needs Action</span>
              </div>
            </Card>

            <Card className="p-4 rounded-2xl border-blue-500/20 bg-blue-500/[0.03] space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 block font-mono">In Progress</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{inProgressTicketsCount}</span>
                <span className="text-[10px] text-blue-500 font-bold">Fixing</span>
              </div>
            </Card>

            <Card className="p-4 rounded-2xl border-emerald-500/20 bg-emerald-500/[0.03] space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block font-mono">Resolved</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{resolvedTicketsCount}</span>
                <span className="text-[10px] text-emerald-600 font-bold">Deployed</span>
              </div>
            </Card>

            <Card className="p-4 rounded-2xl border-border bg-card/60 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block font-mono">Total Submitted</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">{tickets.length}</span>
                <span className="text-[10px] text-muted-foreground font-bold">All Time</span>
              </div>
            </Card>
          </div>

          {/* Ticket Filters & Search */}
          <Card className="p-4 rounded-2xl border-border bg-card/60 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search tickets by ID, title, error description, or user email..." 
                  className="w-full bg-background border border-border pl-10 pr-4 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none h-11 text-sm transition-all"
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                {(['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setTicketStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                      ticketStatusFilter === status
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {status === 'all' && `All (${tickets.length})`}
                    {status === 'OPEN' && `Open (${openTicketsCount})`}
                    {status === 'IN_PROGRESS' && `In Progress (${inProgressTicketsCount})`}
                    {status === 'RESOLVED' && `Resolved (${resolvedTicketsCount})`}
                    {status === 'CLOSED' && "Closed"}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Ticket Cards List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => {
                const isUrgent = t.priority === 'Critical' || t.priority === 'High';
                return (
                  <Card key={t.ticketId} className={cn(
                    "p-5 rounded-2xl border-border bg-card/70 transition-all space-y-4 hover:border-red-500/30",
                    t.status === 'OPEN' && "border-amber-500/40 bg-amber-500/[0.01]"
                  )}>
                    {/* Top Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-black text-red-600 dark:text-red-400">
                          #{t.ticketId}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold uppercase text-muted-foreground">
                          {t.category}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                          t.priority === 'Critical' ? "bg-red-500/20 text-red-600" :
                          t.priority === 'High' ? "bg-amber-500/20 text-amber-600" :
                          "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                        )}>
                          {t.priority} Priority
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {t.status === 'OPEN' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            Awaiting Reply
                          </span>
                        )}
                        {t.status === 'IN_PROGRESS' && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-black uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            In Progress
                          </span>
                        )}
                        {t.status === 'RESOLVED' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Resolved
                          </span>
                        )}
                        {t.status === 'CLOSED' && (
                          <span className="px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-600 border border-zinc-500/20 text-[10px] font-black uppercase">
                            Closed
                          </span>
                        )}

                        <Button
                          size="sm"
                          onClick={() => handleOpenReplyModal(t)}
                          className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-8 px-3 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          Reply / Resolve
                        </Button>
                      </div>
                    </div>

                    {/* User and Issue Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-1.5">
                        <span className="font-bold text-foreground">User: {t.userName || 'Anonymous'}</span>
                        <span className="font-mono text-zinc-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {t.userEmail}
                        </span>
                        <span>Date: {new Date(t.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        {t.pageUrl && (
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {t.pageUrl}
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-foreground text-base mt-2">{t.title}</h4>
                      <div className="p-3.5 rounded-xl bg-background border border-border mt-2">
                        <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-sans">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    {/* Existing Admin Reply */}
                    {t.adminReply && (
                      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Your Reply ({t.adminRepliedBy || 'Founder'}):
                          </span>
                          {t.adminRepliedAt && (
                            <span className="text-[10px] font-mono text-blue-400">
                              {new Date(t.adminRepliedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-medium">
                          {t.adminReply}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })
            ) : (
              <div className="py-20 text-center space-y-3 bg-card/40 rounded-3xl border border-dashed border-border">
                <LifeBuoy className="w-10 h-10 text-muted-foreground mx-auto" />
                <h4 className="font-bold text-foreground text-base">No Tickets Found</h4>
                <p className="text-xs text-muted-foreground">No reported issues match your current search or filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: REGISTERED USERS */}
      {currentSection === 'users' && (
        <div className="space-y-6">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 rounded-2xl border-border bg-card/60 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block font-mono">Total Users</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">{users.length}</span>
                <span className="text-[10px] text-emerald-600 font-bold">Registered</span>
              </div>
            </Card>

            <Card className="p-4 rounded-2xl border-red-500/20 bg-red-500/[0.03] space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-500 block font-mono">Admins & Founders</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-red-600 dark:text-red-400">{totalAdmins}</span>
                <span className="text-[10px] text-red-500 font-bold">Full Access</span>
              </div>
            </Card>

            <Card className="p-4 rounded-2xl border-amber-500/20 bg-amber-500/[0.03] space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block font-mono">Premium / Enterprise</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalPremium}</span>
                <span className="text-[10px] text-amber-500 font-bold">Unlimited</span>
              </div>
            </Card>

            <Card className="p-4 rounded-2xl border-emerald-500/20 bg-emerald-500/[0.03] space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block font-mono">Security Status</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-emerald-600">Active</span>
                <span className="text-[10px] text-emerald-600 font-bold">OTP 2FA On</span>
              </div>
            </Card>
          </div>

          {/* Search and Role Filter */}
          <Card className="p-4 rounded-2xl border-border bg-card/60 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search users by name or email address..." 
                  className="w-full bg-background border border-border pl-10 pr-4 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none h-11 text-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                {(['all', 'admin', 'premium', 'free'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setFilterRole(role)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                      filterRole === role
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {role === 'all' && `All (${users.length})`}
                    {role === 'admin' && `Admins (${totalAdmins})`}
                    {role === 'premium' && `Premium (${totalPremium})`}
                    {role === 'free' && "Standard"}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Users List */}
          <div className="grid grid-cols-1 gap-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => {
                const isAdmin = isUserAdmin(user);
                const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A';
                
                return (
                  <motion.div
                    key={user.uid || user._id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <Card className={cn(
                      "p-5 rounded-2xl border-border hover:border-red-500/30 transition-all group relative overflow-hidden bg-card/70 shadow-xs",
                      isAdmin && "border-red-500/30 bg-red-500/[0.02]"
                    )}>
                      {isAdmin && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-red-600 to-amber-600 text-[9px] font-black text-white rounded-bl-xl uppercase tracking-widest flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-3 h-3" />
                          Master Admin
                        </div>
                      )}
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 border",
                          isAdmin 
                            ? "bg-red-500/10 border-red-500/30 text-red-600" 
                            : "bg-muted border-border text-muted-foreground"
                        )}>
                          {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground truncate text-sm sm:text-base">
                              {user.displayName || 'Registered User'}
                            </h4>
                            {isAdmin && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[9px] font-black uppercase flex items-center gap-1 border border-red-500/20">
                                <Crown className="w-2.5 h-2.5" />
                                Founder
                              </span>
                            )}
                            {(user.plan === 'PREMIUM' || user.plan === 'ENTERPRISE_ADMIN') && !isAdmin && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase flex items-center gap-1 border border-amber-500/20">
                                <Sparkles className="w-2.5 h-2.5" />
                                Premium
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                              <Mail className="w-3.5 h-3.5 text-zinc-400" />
                              {user.email}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                              Joined: {date}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              Plan: <strong className="text-foreground">{user.plan || 'FREE'}</strong>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 md:border-l md:pl-6 border-border pt-2 md:pt-0">
                          <div className="text-center min-w-[60px]">
                            <div className="text-xs font-black text-foreground">{user.xpPoints || 0}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">XP Points</div>
                          </div>
                          <div className="text-center min-w-[50px]">
                            <div className="text-xs font-black text-red-600 dark:text-red-400">{user.streak || 0}d</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Streak</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-20 text-center space-y-3 bg-card/40 rounded-3xl border border-dashed border-border">
                <Users className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground font-medium">No users match your current search criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESOLUTION & REPLY MODAL */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-border rounded-3xl shadow-2xl overflow-hidden my-auto z-10 p-6 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-red-600">
                      #{selectedTicket.ticketId}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-black uppercase text-muted-foreground">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-foreground mt-1">{selectedTicket.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    User: {selectedTicket.userEmail} ({selectedTicket.userName || 'Anonymous'})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Issue Detail View */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block font-mono">Reported User Error Detail:</span>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto font-sans">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                    Update Ticket Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setTicketStatusUpdate(st)}
                        className={cn(
                          "py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border",
                          ticketStatusUpdate === st
                            ? st === 'RESOLVED' ? "bg-emerald-600 text-white border-emerald-600" :
                              st === 'IN_PROGRESS' ? "bg-blue-600 text-white border-blue-600" :
                              "bg-zinc-700 text-white border-zinc-700"
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {st === 'IN_PROGRESS' && "In Progress"}
                        {st === 'RESOLVED' && "Resolved"}
                        {st === 'CLOSED' && "Closed"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
                    Reply Message for User (Will appear in user's ticket thread & email) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="e.g. Hi, thanks for letting us know! We have investigated the issue and deployed a fix to resolve this error. Please try uploading again."
                    className="w-full p-3.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-red-500 text-foreground transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedTicket(null)}
                    className="rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingReply}
                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10 px-4 cursor-pointer"
                  >
                    {isSubmittingReply ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving & Notifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" />
                        Send Reply & Update Status
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
