import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  ChevronLeft,
  Settings2,
  Clock,
  Zap,
  Info,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Paperclip,
  FileText,
  Image as ImageIcon,
  X,
  File,
  ExternalLink,
  Loader2,
  Target,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mongoApi, MongoUser } from '../lib/mongoApi';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export interface ChatAttachment {
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'file';
  size: number;
  mimeType: string;
  base64?: string;
  dataUrl?: string;
  text?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
}

interface ChatSession {
  _id: string;
  title: string;
  messages: Message[];
  model: string;
  updatedAt: string;
}

interface MentorshipTabProps {
  user: MongoUser | null;
}

const MentorshipTab: React.FC<MentorshipTabProps> = ({ user }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [tokenInfo, setTokenInfo] = useState<{ used: number; limit: number; isAdmin: boolean } | null>(() => {
    if (user) {
      const adminEmails = [
        "kamaljit444501@gmail.com",
        "kamaljit44501@gmail.com"
      ];
      const isAdmin = !!(user.email && adminEmails.includes(user.email.toLowerCase())) || user.plan === 'ENTERPRISE_ADMIN' || user.plan === 'ADMIN' || user.isAdmin === true;
      return {
        used: user.usage?.tokensUsed || 0,
        limit: user.usage?.tokenLimit || (user.plan === 'PREMIUM' || isAdmin ? 1000000 : 50000),
        isAdmin
      };
    }
    return null;
  });

  // Voice Typing & Audio state
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-US'>('en-US');
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);

  // Attachments State (PDF, Resume, Images/Photos)
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');

  const quickActions = [
    { label: 'System Architecture', icon: Layout, prompt: 'Evaluate trade-offs between PostgreSQL compound indexes vs Redis caching for high-concurrency feeds.' },
    { label: 'Google XYZ Bullets', icon: FileText, prompt: 'Review my resume technical bullets and rewrite them using Google\'s XYZ formula with quantifiable impact.' },
    { label: 'Staff Interview Drills', icon: Target, prompt: 'Drill me on distributed systems, microservices failure recovery, and STAR leadership scenarios.' },
    { label: 'Offer & Compensation', icon: Zap, prompt: 'How do I negotiate compensation between multiple senior engineering offers to maximize equity and base?' }
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFile(true);
    const added: ChatAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 15MB limit.`);
        continue;
      }

      const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.name);
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      const isDoc = file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');

      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            resolve(res.split(',')[1] || '');
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const dataUrl = isImg ? `data:${file.type || 'image/jpeg'};base64,${base64Data}` : undefined;

        added.push({
          name: file.name,
          type: isImg ? 'image' : (isPdf ? 'pdf' : (isDoc ? 'doc' : 'file')),
          size: file.size,
          mimeType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
          base64: base64Data,
          dataUrl
        });
      } catch (err) {
        console.error("Attachment read error:", err);
        toast.error(`Failed to read file ${file.name}`);
      }
    }

    if (added.length > 0) {
      setAttachments(prev => [...prev, ...added]);
      toast.success(
        voiceLang === 'hi-IN' 
          ? `${added.length} फाइल अटैच हो गई। अब आप अपना सवाल पूछ सकते हैं!` 
          : `${added.length} file(s) attached. Ask your question now!`
      );
    }
    setIsProcessingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const loadUsage = async () => {
    if (!user?.uid) return;
    try {
      const data = await mongoApi.getUserUsage(user.uid);
      if (data) {
        setTokenInfo({
          used: data.tokensUsed ?? 0,
          limit: data.tokenLimit ?? (data.plan === 'PREMIUM' || data.isAdmin ? 1000000 : 50000),
          isAdmin: !!data.isAdmin || data.plan === 'ADMIN'
        });
      }
    } catch (err) {
      console.warn('Failed to load mentorship token usage:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadSessions();
      loadUsage();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Clean up speech recognition & synthesis on unmount
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang; // 'hi-IN' for Hindi/Hinglish or 'en-US' for English

      baseTextRef.current = input;

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

        if (currentFinal) {
          const prefix = baseTextRef.current ? baseTextRef.current.trim() + ' ' : '';
          baseTextRef.current = prefix + currentFinal.trim();
          setInput(baseTextRef.current);
        } else if (currentInterim) {
          const prefix = baseTextRef.current ? baseTextRef.current.trim() + ' ' : '';
          setInput(prefix + currentInterim.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permission in your browser settings.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
    }
  };

  const toggleSpeech = (text: string, index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (playingMessageIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingMessageIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Remove markdown formatting symbols for cleaner voice narration
    const cleanText = text
      .replace(/[*#_`~\[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceLang === 'hi-IN' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setPlayingMessageIndex(null);
    };
    utterance.onerror = () => {
      setPlayingMessageIndex(null);
    };

    setPlayingMessageIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const loadSessions = async () => {
    if (!user) return;
    try {
      const data = await mongoApi.getChatSessions(user.uid);
      if (Array.isArray(data)) {
        setSessions(data);
        if (data.length > 0 && !currentSession) {
          setCurrentSession(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const createNewSession = async () => {
    if (!user) return;
    try {
      const session = await mongoApi.createChatSession(user.uid, "New Career Discussion", selectedModel);
      if (session && session._id) {
        setSessions(prev => [session, ...prev.filter(s => s._id !== session._id)]);
        setCurrentSession(session);
        setInput('');
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await mongoApi.deleteChatSession(user.uid, id);
      const updatedSessions = sessions.filter(s => s._id !== id);
      setSessions(updatedSessions);
      if (currentSession?._id === id) {
        setCurrentSession(updatedSessions[0] || null);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = (reader.result as string).split(',')[1] || '';
            const newAtt: ChatAttachment = {
              name: `screenshot-${Date.now().toString().slice(-4)}.png`,
              type: 'image',
              size: file.size,
              mimeType: file.type || 'image/png',
              base64: base64Data,
              dataUrl: reader.result as string
            };
            setAttachments(prev => [...prev, newAtt]);
            toast.success(voiceLang === 'hi-IN' ? "स्क्रीनशॉट अटैच हो गया!" : "Screenshot attached from clipboard!");
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = input.trim();
    const currentAttachments = [...attachments];

    if ((!userMessage && currentAttachments.length === 0) || !currentSession || !user || isLoading) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    setInput('');
    setAttachments([]);
    setIsLoading(true);

    // Optimistically add user message with attachments
    const optimisticContent = userMessage || (currentAttachments.length > 0 ? `Uploaded ${currentAttachments.map(a => a.name).join(', ')}` : '');
    const updatedMessages: Message[] = [
      ...currentSession.messages,
      { 
        role: 'user', 
        content: optimisticContent, 
        attachments: currentAttachments,
        timestamp: new Date() 
      }
    ];
    setCurrentSession({ ...currentSession, messages: updatedMessages });

    try {
      const data = await mongoApi.sendMentorMessage(user.uid, currentSession._id, userMessage, selectedModel, currentAttachments);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setCurrentSession({
        ...currentSession,
        messages: [...updatedMessages, assistantMessage]
      });

      setTokenInfo({
        used: data.tokensUsed ?? tokenInfo?.used ?? 0,
        limit: data.tokenLimit ?? tokenInfo?.limit ?? 50000,
        isAdmin: typeof data.isAdmin === 'boolean' ? data.isAdmin : (tokenInfo?.isAdmin ?? false)
      });

      // Update sessions list to reflect new message/updatedAt
      loadSessions();
    } catch (err: any) {
      console.error('Chat failed:', err);
      // Revert optimism or show error
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${err.message || 'Something went wrong. Please try again.'}`,
        timestamp: new Date()
      };
      setCurrentSession({
        ...currentSession,
        messages: [...updatedMessages, errorMessage]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTokens = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const models = [
    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', desc: 'Ultra-Fast & High Precision (Recommended)', icon: Sparkles },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Highly Stable & Intelligent', icon: Zap }
  ];

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-slate-200 bg-slate-50 flex flex-col"
          >
            <div className="p-4 border-b border-slate-200 bg-white">
              <button 
                onClick={createNewSession}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-medium shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Plus size={18} />
                <span>New Discussion</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 p-4 text-center">
                  <Clock size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">No discussions yet. Start your journey!</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => setCurrentSession(session)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setCurrentSession(session);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative cursor-pointer select-none ${
                      currentSession?._id === session._id 
                        ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <MessageSquare size={18} className={currentSession?._id === session._id ? 'text-indigo-600' : 'text-slate-400'} />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate pr-6">{session.title}</p>
                      <p className="text-[10px] opacity-60">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => deleteSession(e, session._id)}
                      title="Delete discussion"
                      className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Token Tracker */}
            {user && (
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Mentorship Usage</span>
                  <span className="text-[11px] font-medium text-slate-900">
                    {tokenInfo ? `${formatTokens(tokenInfo.used)} / ${tokenInfo.isAdmin ? '∞' : formatTokens(tokenInfo.limit)}` : `${user?.usage?.tokensUsed ? formatTokens(user.usage.tokensUsed) : '0'} / 50K`}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: tokenInfo?.isAdmin ? '100%' : `${Math.min(100, ((tokenInfo?.used || 0) / (tokenInfo?.limit || 50000)) * 100)}%` }}
                    className={`h-full rounded-full ${
                      tokenInfo?.isAdmin ? 'bg-indigo-500' : 
                      ((tokenInfo?.used || 0) / (tokenInfo?.limit || 50000)) > 0.9 ? 'bg-rose-500' : 'bg-indigo-600'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                  <Info size={10} />
                  Tokens are used for long-term career context.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {/* Header */}
        <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronLeft size={20} className={isSidebarOpen ? '' : 'rotate-180'} />
            </button>
            <div>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                {currentSession?.title || 'AI Career Mentor'}
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">MULTITASKING</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    selectedModel === model.id 
                      ? 'bg-white text-indigo-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <model.icon size={14} />
                  {model.name}
                </button>
              ))}
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
              <Settings2 size={20} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!currentSession ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 text-indigo-600 shadow-sm border border-indigo-100">
                <Bot size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Career & Architecture Mentor</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Your 24/7 Staff-level engineering mentor. Get authoritative guidance on system design trade-offs, Google XYZ resume rewrites, senior salary negotiation, and STAR interview drills.
              </p>
              <button 
                onClick={createNewSession}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Start Mentorship
              </button>
            </div>
          ) : (
            <>
              {currentSession.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center max-w-sm mx-auto">
                  <Sparkles className="text-indigo-400 mb-4 animate-pulse" size={40} />
                  <p className="text-slate-500 font-medium">Hello {user?.displayName}! I'm your Staff Career & Architecture Mentor. Ask me anything about systems design, resume optimization, salary negotiation, or technical interview drills.</p>
                </div>
              )}
              {currentSession.messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-600'
                  }`}>
                    {msg.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {/* Render message attachments if present */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {msg.attachments.map((att, aIdx) => {
                          const isImg = att.type === 'image' || att.mimeType?.startsWith('image/');
                          return (
                            <div 
                              key={aIdx} 
                              className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                                msg.role === 'user' 
                                  ? 'bg-indigo-700/80 border-indigo-400/40 text-white' 
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              {isImg && (att.dataUrl || att.base64) ? (
                                <div 
                                  onClick={() => setLightboxImage({ 
                                    url: att.dataUrl || `data:${att.mimeType || 'image/jpeg'};base64,${att.base64}`, 
                                    name: att.name 
                                  })}
                                  className="relative group cursor-pointer overflow-hidden rounded-lg w-16 h-16 sm:w-20 sm:h-20 bg-slate-900/10 shrink-0"
                                  title="Click to view full image"
                                >
                                  <img 
                                    src={att.dataUrl || `data:${att.mimeType || 'image/jpeg'};base64,${att.base64}`} 
                                    alt={att.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <ExternalLink size={14} className="text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-2 py-1">
                                  <div className={`p-1.5 rounded-lg shrink-0 ${msg.role === 'user' ? 'bg-indigo-800 text-indigo-200' : 'bg-red-50 text-red-600'}`}>
                                    {att.type === 'pdf' ? <FileText size={16} /> : <File size={16} />}
                                  </div>
                                  <div className="text-left overflow-hidden">
                                    <p className="text-xs font-semibold max-w-[130px] sm:max-w-[170px] truncate">{att.name}</p>
                                    <p className={`text-[10px] ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                      {att.type?.toUpperCase() || 'FILE'} {att.size ? `• ${(att.size / 1024).toFixed(0)} KB` : ''}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none prose-slate">
                      <div className={msg.role === 'user' ? 'text-white' : 'text-slate-800'}>
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-slate-100/50">
                      <div className={`text-[10px] opacity-60 ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {msg.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => toggleSpeech(msg.content, idx)}
                          title={
                            playingMessageIndex === idx
                              ? (voiceLang === 'hi-IN' ? "आवाज़ रोकें (Stop narration)" : "Stop narration")
                              : (voiceLang === 'hi-IN' ? "आवाज़ में सुनें (Listen to answer)" : "Listen to answer")
                          }
                          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md transition-all font-medium ${
                            playingMessageIndex === idx
                              ? 'bg-indigo-100 text-indigo-700 animate-pulse'
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                          }`}
                        >
                          {playingMessageIndex === idx ? (
                            <>
                              <VolumeX size={11} className="text-indigo-600" />
                              <span>{voiceLang === 'hi-IN' ? 'बोल रहा है...' : 'Speaking...'}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={11} />
                              <span>{voiceLang === 'hi-IN' ? 'सुने' : 'Listen'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                    <Bot size={18} />
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {currentSession && (
          <div className="p-4 sm:p-6 bg-white border-t border-slate-200">
            <div className="max-w-4xl mx-auto">
              {/* Quick Action Suggestion Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(action.prompt);
                      // focus text area if needed
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all shrink-0 group active:scale-95"
                  >
                    <action.icon size={15} className="text-slate-400 group-hover:text-indigo-600" />
                    <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-900 whitespace-nowrap">{action.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="mb-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-50 via-indigo-50 to-rose-50 border border-rose-200 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                      </div>
                      <div className="text-xs font-medium text-slate-800 flex items-center gap-2">
                        <span className="font-bold text-rose-600">
                          {voiceLang === 'hi-IN' ? 'सुन रहे हैं... बोलिए' : 'Listening... Speak now'}
                        </span>
                        <span className="hidden sm:inline text-slate-500 text-[11px]">
                          {voiceLang === 'hi-IN' 
                            ? '(हिन्दी / Hinglish) — आपके बोलते ही यहाँ टाइप हो रहा है'
                            : '(English) — Transcribing your speech in real-time'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleListening}
                      className="text-xs font-bold text-rose-700 hover:text-rose-950 bg-white hover:bg-rose-100/60 px-3 py-1 rounded-xl border border-rose-200 transition-all shadow-2xs"
                    >
                      {voiceLang === 'hi-IN' ? 'रोकें (Done)' : 'Stop'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden File Input for PDF, Resume, Documents, and Images */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Attachments Preview Bar */}
              <AnimatePresence>
                {attachments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2.5 p-2 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-wrap items-center gap-2"
                  >
                    <div className="text-[11px] font-bold text-indigo-900 px-1 flex items-center gap-1">
                      <Paperclip size={12} className="text-indigo-600" />
                      <span>{attachments.length} {attachments.length === 1 ? 'file' : 'files'} attached:</span>
                    </div>

                    {attachments.map((att, idx) => {
                      const isImg = att.type === 'image' || att.mimeType?.startsWith('image/');
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-white border border-indigo-200 rounded-xl pl-2 pr-1.5 py-1 shadow-2xs text-xs group"
                        >
                          {isImg && att.dataUrl ? (
                            <img src={att.dataUrl} alt={att.name} className="w-5 h-5 rounded-md object-cover" />
                          ) : att.type === 'pdf' ? (
                            <FileText size={14} className="text-rose-600" />
                          ) : (
                            <File size={14} className="text-indigo-600" />
                          )}
                          <span className="font-medium text-slate-800 max-w-[120px] sm:max-w-[160px] truncate">
                            {att.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({(att.size / 1024).toFixed(0)}KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="w-5 h-5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors ml-0.5"
                            title="Remove file"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-white/80 px-2 py-1 rounded-lg transition-all flex items-center gap-1 ml-auto"
                    >
                      <Plus size={13} />
                      <span>{voiceLang === 'hi-IN' ? '+ और फाइल जोड़ें' : '+ Add more'}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                {/* Plus (+) Upload Button for File/Photo Input */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingFile || isLoading}
                  title={
                    voiceLang === 'hi-IN' 
                      ? 'फाइल, रीज़्यूम या फोटो जोड़ें (+)' 
                      : 'Attach PDF, Resume, or Photo (+)'
                  }
                  className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center transition-all border shadow-2xs group relative ${
                    attachments.length > 0 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-200' 
                      : 'bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  {isProcessingFile ? (
                    <Loader2 size={20} className="animate-spin text-indigo-600" />
                  ) : (
                    <>
                      <Plus size={22} className="group-hover:rotate-90 transition-transform duration-200" />
                      {attachments.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {attachments.length}
                        </span>
                      )}
                    </>
                  )}
                </button>

                <div className="relative flex-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPaste={handlePaste}
                    placeholder={
                      isListening 
                        ? (voiceLang === 'hi-IN' ? "सुन रहे हैं... जो बोलेंगे यहाँ टाइप होगा..." : "Listening... speak now to type...")
                        : (attachments.length > 0
                            ? (voiceLang === 'hi-IN' ? "इस फाइल के बारे में पूछें (जैसे: 'इसे रिव्यू करो' या 'समझाओ')..." : "Ask about attached file(s) (e.g. 'Review this resume' or 'Explain this code')...")
                            : (voiceLang === 'hi-IN' ? "अपने मेंटर से पूछें, बोलें या + दबाकर फाइल जोड़ें..." : "Ask your career mentor, speak, or click + to attach files...")
                          )
                    }
                    className={`w-full bg-slate-50 border rounded-2xl py-3.5 pl-4 pr-36 sm:pr-44 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 shadow-inner ${
                      isListening ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />

                  <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1.5">
                    {/* Language Toggle for Voice Recognition */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextLang = voiceLang === 'hi-IN' ? 'en-US' : 'hi-IN';
                        setVoiceLang(nextLang);
                        if (isListening && recognitionRef.current) {
                          try {
                            recognitionRef.current.stop();
                            setTimeout(() => toggleListening(), 100);
                          } catch (e) {}
                        }
                      }}
                      title={voiceLang === 'hi-IN' ? 'Current: Hindi / Hinglish (Click to switch to English)' : 'Current: English (Click to switch to Hindi / Hinglish)'}
                      className="h-9 sm:h-10 px-2 sm:px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-all shadow-2xs"
                    >
                      <Languages size={13} className="text-indigo-600" />
                      <span>{voiceLang === 'hi-IN' ? 'हिन्दी' : 'English'}</span>
                    </button>

                    {/* Mic Button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      title={
                        isListening 
                          ? (voiceLang === 'hi-IN' ? "रिकॉर्डिंग रोकें (Stop)" : "Stop recording")
                          : (voiceLang === 'hi-IN' ? "बोलकर टाइप करें (Voice Typing)" : "Voice typing (Click and speak)")
                      }
                      className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center transition-all ${
                        isListening 
                          ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-200 ring-2 ring-rose-300' 
                          : 'bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={(!input.trim() && attachments.length === 0) || isLoading}
                      className={`h-9 sm:h-10 px-3.5 rounded-xl transition-all flex items-center justify-center ${
                        (input.trim() || attachments.length > 0) && !isLoading 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Send message"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </form>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-2.5 px-1 gap-2">
                <span className="flex items-center gap-1.5 flex-wrap">
                  {voiceLang === 'hi-IN' ? (
                    <>
                      <span>🎙️ <strong>माइक:</strong> बोलकर टाइप करें</span>
                      <span>•</span>
                      <span>➕ <strong>प्लस बटन:</strong> PDF, रीज़्यूम या फोटो जोड़ें</span>
                      <span>•</span>
                      <span className="hidden sm:inline">📋 स्क्रीनशॉट सीधे पेस्ट (Ctrl+V) भी कर सकते हैं</span>
                    </>
                  ) : (
                    <>
                      <span>🎙️ <strong>Mic:</strong> Speak to type</span>
                      <span>•</span>
                      <span>➕ <strong>Plus (+):</strong> Upload PDF, resume, or photo</span>
                      <span>•</span>
                      <span className="hidden sm:inline">📋 You can also paste screenshots (Ctrl+V)</span>
                    </>
                  )}
                </span>
                <span className="hidden sm:inline text-slate-400">
                  {voiceLang === 'hi-IN' ? 'AI भाषा: द्विभाषी (Eng + हिन्दी)' : 'AI Language: Bilingual Context'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Previewing Attached Images */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700 text-white">
                <p className="text-xs font-semibold truncate max-w-sm">{lightboxImage.name}</p>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-2 overflow-auto flex items-center justify-center bg-black/50">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.name}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-md"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentorshipTab;
