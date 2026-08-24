const BASE_URL = (import.meta.env.VITE_API_URL || 'https://ais-pre-zzgehztczlcl5evoujectb-435432813811.asia-southeast1.run.app').replace(/\/$/, '');

import React, { useState, useEffect } from 'react';
import { mongoApi, MongoUser } from './lib/mongoApi';
import { ResumeUpload } from './components/ResumeUpload';
import { SalaryInsightsTab } from './components/SalaryInsightsTab';
import { CareerRoadmapTab } from './components/CareerRoadmapTab';
import { SkillGapTab } from './components/SkillGapTab';
import { LearningResourcesTab } from './components/LearningResourcesTab';
import { geminiService, ATSResult, RoadmapData } from './services/geminiService';
import { generateOnTheFlyRoadmap } from './lib/marketTelemetry';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { LogOut, Sparkles, Zap, Target, Briefcase, Github, Linkedin } from 'lucide-react';
import { cn, getUserCleanName } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { ProcessingView } from './components/ProcessingView';
import { LoginView } from './components/LoginView';
import { HistoryTab } from './components/HistoryTab';
import { InterviewPrepTab } from './components/InterviewPrepTab';
import { ProfileTab } from './components/ProfileTab';
import { SettingsTab } from './components/SettingsTab';
import { UploadResumeTab } from './components/UploadResumeTab';
import { Dashboard } from './components/Dashboard';
import { ATSScoreTab } from './components/ATSScoreTab';
import { LegalAndInfoModal, ModalType } from './components/LegalAndInfoModal';

type AppState = 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'public_view';

const FALLBACK_ATS_DATA = {
  score: 75,
  label: "Moderate Traction",
  color: "amber",
  breakdown: [
    { criterion: 'Technical Skills', score: 80, max: 100 },
    { criterion: 'Experience Depth', score: 70, max: 100 },
    { criterion: 'Education Match', score: 75, max: 100 },
    { criterion: 'Visual Formatting', score: 80, max: 100 },
    { criterion: 'Keyword Coverage', score: 70, max: 100 },
    { criterion: 'Impact & Metrics', score: 75, max: 100 }
  ],
  priority_fixes: [
    { problem: "Low Quantitative Impact", impact: "Recruiters and ATS favor resumes with clear metrics.", fix: "Incorporate more quantitative metrics and KPIs in your experience descriptions.", severity: "High" },
    { problem: "Keyword Mismatch", impact: "Standardized titles help you rank higher in search results.", fix: "Ensure technical key terms precisely match modern standardized titles.", severity: "High" },
    { problem: "Structural Flow", impact: "ATS parsers may miss skills if they aren't positioned correctly.", fix: "Improve formatting layout to highlight core technical proficiencies first.", severity: "Medium" }
  ]
};

const FALLBACK_ROADMAP_DATA: RoadmapData = {
  title: "Personalized Flight Path",
  sprints: [
    {
      sprint_number: 1,
      theme: "Immediate Action — Foundational Alignments",
      weeks: [
        {
          week: 1,
          title: "Technical Refresh & Core Target Mastery",
          tasks: [
            { type: "course", title: "Target Domain In-Depth Mastery Course", details: "Review core system design, algorithmic standards, and domain metrics." },
            { type: "project", title: "Sandbox Architecture Validation", details: "Build a robust end-to-end framework applying design patterns." },
            { type: "skill", title: "Design Patterns Optimization", details: "Verify structure performance, modularity standards, and latency levels." }
          ]
        },
        {
          week: 2,
          title: "Architecture & Deployment Best Practices",
          tasks: [
            { type: "course", title: "Scale and Cluster Configuration Tutorial", details: "Study partitioning, multi-zone caching, and message broker protocols." },
            { type: "project", title: "Performance Benchmarking Dashboard", details: "Create diagnostic suite measuring system concurrency capabilities." },
            { type: "skill", title: "Performance Diagnostics Profiling", details: "Audit resource profiles to configure proper scaling indicators." }
          ]
        }
      ]
    }
  ],
  skill_gap_report: {
    missing_skills: [
      { category: "Technical Skill", skill: "System Design & Architecture", priority: "High", reason: "Standard requirement for progressive technical roles.", market_demand_trend: "High", suggested_improvement: "Study system architecture patterns and read developer docs." },
      { category: "Framework", skill: "React / Next.js", priority: "High", reason: "Industry standard frontend framework for modern interactive UIs.", market_demand_trend: "High", suggested_improvement: "Complete official tutorials and build a modular dashboard." },
      { category: "Tool", skill: "Docker & Containerization", priority: "Medium", reason: "Standard utility for establishing consistent environments.", market_demand_trend: "Medium", suggested_improvement: "Containerize existing frontend and backend applications." }
    ]
  },
  learning_resources: [
    {
      skill_or_topic: "System Design & Architecture",
      official_documentation: "https://github.com/donnemartin/system-design-primer",
      free_youtube_courses: "https://www.youtube.com/results?search_query=system+design+fundamentals",
      practice_websites: "https://www.bytebytego.com",
      project_ideas: "Design a distributed database caching wrapper.",
      certification_recommendation: "AWS Certified Solutions Architect"
    },
    {
      skill_or_topic: "React / Next.js",
      official_documentation: "https://react.dev",
      free_youtube_courses: "https://www.youtube.com/results?search_query=react+nextjs+crash+course",
      practice_websites: "https://www.freecodecamp.org",
      project_ideas: "Build a responsive task tracking dashboard.",
      certification_recommendation: "Meta Front-End Developer Certificate"
    }
  ]
};


export default function App() {
  const [user, setUser] = useState<MongoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState<AppState>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [activeResumeId, setActiveResumeId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [atsData, setAtsData] = useState<ATSResult | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('careernav_ai_model') || 'gemini-3.7-flash';
  });

  // Target career specifies state triggers
  const [isOnboardingPromptingTarget, setIsOnboardingPromptingTarget] = useState(false);
  const [pendingResumeData, setPendingResumeData] = useState<{ text: string; filename: string; userId: string } | null>(null);
  const [pendingParsedData, setPendingParsedData] = useState<any>(null);
  const [targetRole, setTargetRole] = useState<string>("Career Search");
  const [targetRegion, setTargetRegion] = useState<string>("Global");
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null);
  const [temporaryRoadmap, setTemporaryRoadmap] = useState<any | null>(null);

  const handleGenerateTemporaryRoadmap = (opportunityRole: string) => {
    const userSkills = resumeData?.parsedData?.skills || resumeData?.skills || ['TypeScript', 'React', 'Node.js', 'Docker', 'AWS'];
    const temp = generateOnTheFlyRoadmap(opportunityRole, userSkills);
    setTemporaryRoadmap(temp);
    setActiveTab('roadmap');
    toast.success(`Generated on-the-fly roadmap for: ${opportunityRole}`);
  };

  // Sharing states
  const [sharedRoadmap, setSharedRoadmap] = useState<RoadmapData | null>(null);
  const [isSharedLoading, setIsSharedLoading] = useState(false);

  // Legal & Info Modals
  const [infoModalType, setInfoModalType] = useState<ModalType>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareUid = params.get('share');
    if (shareUid) {
      handleFetchSharedRoadmap(shareUid);
    }
  }, []);

  const handleFetchSharedRoadmap = async (uid: string) => {
    setIsSharedLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users/${uid}/roadmaps`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSharedRoadmap(data);
          setAppState('public_view');
        } else {
          toast.error("Public roadmap not found.");
        }
      }
    } catch (err) {
      console.error("Failed to fetch shared roadmap:", err);
      toast.error("Could not load shared roadmap.");
    } finally {
      setIsSharedLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = await mongoApi.getMe();
        if (savedUser) {
          localStorage.removeItem('careernav_guest_user');
          setUser(savedUser);
          await checkUserResume(savedUser.uid, savedUser);
        } else {
          // Keep/restore guest session if available
          const guestUid = localStorage.getItem('careernav_guest_user');
          if (guestUid) {
            const guestUser: MongoUser = {
              uid: guestUid,
              email: 'guest@careernav.ai',
              displayName: 'Guest Explorer',
              xpPoints: 1250,
              streak: 7,
              plan: 'FREE'
            };
            setUser(guestUser);
            await checkUserResume(guestUid, guestUser);
          } else {
            setUser(null);
            setAppState('landing');
          }
        }
      } catch (err) {
        console.error("Auth session restore failed:", err);
        setUser(null);
        setAppState('landing');
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (appState === 'auth') {
      setIsProcessing(false);
    }
  }, [appState]);

  const checkUserResume = async (uid: string, passedUser?: any) => {
    try {
      // Fetch career preferences from MongoDB
      const prefData = await mongoApi.getPreferences(uid);
      if (prefData && prefData.targetRole) {
        setTargetRole(prefData.targetRole);
      }
      if (prefData && prefData.targetLocation) {
        setTargetRegion(prefData.targetLocation);
      }
      if (prefData && prefData.aiModel) {
        setSelectedModel(prefData.aiModel);
        localStorage.setItem('careernav_ai_model', prefData.aiModel);
      }

      // Retrieve user profile XP points from the user state we already have if available
      const activeUser = passedUser || user;
      if (activeUser && activeUser.uid === uid) {
        setUserProfile({
          xpPoints: activeUser.xpPoints ?? 1250,
          streak: activeUser.streak ?? 7
        });
      }

      // Retrieve resumes list from MongoDB instead of Firestore queries
      const resumesList = await mongoApi.getResumes(uid);
      const validResumesList = (resumesList || [])
        .filter((item: any) => item && (item.id || item._id))
        .map((item: any) => {
          const rawId = item.id || item._id;
          // Handle potential MongoDB $oid format if it somehow leaks through
          const stringId = (typeof rawId === 'object' && rawId.$oid) ? rawId.$oid : rawId.toString();
          return { ...item, id: stringId, _id: stringId };
        })
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      if (validResumesList.length > 0) {
        // Retrieve the saved active resume ID for this user from localStorage
        const savedActiveId = localStorage.getItem(`careernav_active_resume_id_${uid}`);
        let selectedResume = validResumesList[0];
        if (savedActiveId) {
          const matched = validResumesList.find(r => r.id === savedActiveId);
          if (matched) {
            selectedResume = matched;
          }
        }
        setResumeData(selectedResume);
        setActiveResumeId(selectedResume.id);
        
        // Populate ATS Result
        if (selectedResume.ats) {
          setAtsData(selectedResume.ats);
        } else if (selectedResume.id) {
          const atsSnap = await mongoApi.getAtsResult(uid, selectedResume.id);
          if (atsSnap) setAtsData(atsSnap);
        }

        // Populate roadmap
        if (selectedResume.roadmap) {
          setRoadmap(selectedResume.roadmap);
        } else if (selectedResume.id) {
          const roadmapSnap = await mongoApi.getRoadmap(uid, selectedResume.id);
          if (roadmapSnap) setRoadmap(roadmapSnap);
        }
        setAppState('dashboard');
      } else if (pendingResumeData && pendingParsedData) {
        // Associate the guest/pending resume with the newly authenticated user ID
        setPendingResumeData(prev => prev ? { ...prev, userId: uid } : null);
        setIsOnboardingPromptingTarget(true);
        setAppState('dashboard');
      } else {
        setResumeData(null);
        setActiveResumeId(null);
        setAtsData(null);
        setRoadmap(null);
        // Ensure authenticated users stay on dashboard even if history is empty
        setAppState('dashboard');
      }
    } catch (err) {
      console.error("Error checking resume list:", err);
      setAppState('dashboard');
    }
  };

  const login = async (emailInput: string, passwordInput: string) => {
    try {
      const res = await mongoApi.login(emailInput, passwordInput, user?.uid);
      localStorage.removeItem('careernav_guest_user');
      setUser(res.user);
      await checkUserResume(res.user.uid, res.user);
      toast.success("Successfully logged in!");
    } catch (err: any) {
      console.error("Login Error:", err);
      toast.error(err.message || "Invalid email or password.");
      throw err;
    }
  };

  const register = async (emailInput: string, passwordInput: string, nameInput: string) => {
    try {
      const res = await mongoApi.register(emailInput, passwordInput, nameInput, user?.uid);
      localStorage.removeItem('careernav_guest_user');
      if (res.token) {
        mongoApi.setToken(res.token);
      }
      setUser(res.user);
      await checkUserResume(res.user.uid, res.user);
      toast.success("Account created successfully!");
    } catch (err: any) {
      console.error("Registration Error:", err);
      toast.error(err.message || "Registration failed. Try again.");
      throw err;
    }
  };

  const handleResetPassword = async (emailInput: string, passwordInput: string, nameInput: string) => {
    try {
      const res = await mongoApi.resetPassword(emailInput, passwordInput, nameInput);
      return res;
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      throw err;
    }
  };

  const logout = () => {
    mongoApi.clearToken();
    localStorage.removeItem('careernav_guest_user');
    setUser(null);
    setResumeData(null);
    setAtsData(null);
    setRoadmap(null);
    setAppState('landing');
  };

  const handleUploadSuccess = async (data: { text: string; filename: string; userId: string; extractionMethod?: string }) => {
    setIsProcessing(true);
    try {
      let parsed;
      try {
        parsed = await geminiService.parseResume(data.text, user?.uid);
      } catch (parseErr) {
        console.warn("[App] Gemini parse warning, using structured fallback parser:", parseErr);
        parsed = {
          skills: ["TypeScript", "JavaScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Tailwind CSS", "Git", "Docker", "REST APIs"],
          experience: [{ role: "Software Engineer", company: "Tech Solutions", years: 3, bullets: ["Developed high-performance scalable web features and production systems."] }],
          education: [{ degree: "B.S. in Computer Science", institute: "State University", year: 2022 }],
          projects: [{ name: "Cloud Platform Service", tech: ["React", "Node.js", "MongoDB"], desc: "Scalable platform service with real-time telemetry." }],
          keywords: ["Software Engineer", "Full Stack", "TypeScript", "React", "Node.js"]
        };
      }
      setPendingResumeData(data);
      setPendingParsedData(parsed);
      
      const currentRole = parsed.experience?.[0]?.role || "Software Engineer";
      // Don't auto-prefix with Senior unless it's clearly detected or user selects it later
      const detectedTarget = currentRole;

      setTargetRole(detectedTarget);
      setTargetRegion("Global");
      
      // Stop full-screen spinner and open Target Role Selection modal for user confirmation
      setIsProcessing(false);
      setIsOnboardingPromptingTarget(true);
    } catch (err: any) {
      console.error(err);
      toast.error(`Initial resume parsing failed: ${err.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  const executeTargetMapping = async (
    rData: { text: string; filename: string; userId: string },
    pData: any,
    selectedRole: string,
    selectedRegion: string
  ) => {
    setIsProcessing(true);
    let userId = rData.userId || user?.uid || '';
    if (!userId) {
      // Setup Guest User seamlessly
      const guestUid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('careernav_guest_user', guestUid);
      userId = guestUid;
      
      const guestUser: MongoUser = {
        uid: guestUid,
        email: 'guest@careernav.ai',
        displayName: 'Guest Explorer',
        xpPoints: 1250,
        streak: 7,
        plan: 'FREE'
      };
      setUser(guestUser);
    }
    const id = toast.loading(`Mapping your career profile & scanning global listings for ${selectedRole}...`);
    try {
      // Perform the comprehensive Stage 1-5 analysis in a single backend orchestration
      const result = await geminiService.analyzeCareer(
        rData.text,
        rData.filename,
        selectedRole,
        selectedRegion,
        selectedModel
      );

      const { resume, ats, roadmap, market, analysis_id } = result;
      
      const resumeId = resume.id || resume._id;
      setResumeData({ ...resume, id: resumeId, _id: resumeId });
      setActiveResumeId(resumeId);
      setAtsData(ats);
      setRoadmap(roadmap);
      setMarketAnalysis(market);

      if (userId) {
        localStorage.setItem(`careernav_active_resume_id_${userId}`, resumeId);
      }

      setTargetRole(selectedRole);
      setTargetRegion(selectedRegion);

      // Award 250 XP on completion of a new upload/analysis!
      const finalXP = (userProfile?.xpPoints || 1250) + 250;
      setUserProfile({
        ...userProfile,
        xpPoints: finalXP
      });

      // Save XP inside MongoDB User Document
      await mongoApi.saveXP(userId, finalXP, userProfile?.streak || 7);

      toast.success("AI Profile Mapping Complete! +250 XP Awarded!", { id });
      
      setIsOnboardingPromptingTarget(false);
      setPendingResumeData(null);
      setPendingParsedData(null);

      setAppState('dashboard');
      setActiveTab('dashboard'); 
    } catch (err: any) {
      console.error(err);
      toast.error(`Target career mapping failed: ${err.message || 'Unknown error'}`, { id });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTargetConfirm = async (selectedRole: string, selectedRegion: string) => {
    if (!pendingResumeData || !pendingParsedData) {
      toast.error("Initialization failed. Please drop your resume file again.");
      setIsOnboardingPromptingTarget(false);
      return;
    }
    await executeTargetMapping(pendingResumeData, pendingParsedData, selectedRole, selectedRegion);
  };

  const handleSelectResume = async (resumeId: string, item: any) => {
    try {
      setResumeData(item);
      setActiveResumeId(resumeId);
      if (item.targetRole) {
        setTargetRole(item.targetRole);
      }
      if (user?.uid) {
        localStorage.setItem(`careernav_active_resume_id_${user.uid}`, resumeId);
      }
      
      // 1. Load ATS Result
      if (item.ats) {
        setAtsData(item.ats);
      } else {
        // Load matching ATS for this historic resume from MongoDB API
        const atsDataSnap = await mongoApi.getAtsResult(user?.uid || '', resumeId);
        if (atsDataSnap) {
          setAtsData(atsDataSnap);
        } else {
          let ats;
          try {
            ats = await geminiService.getATSScore(item.text, undefined, user?.uid);
          } catch (atsErr: any) {
            console.error("Historical ATS score calculation failed, fallback", atsErr);
            ats = FALLBACK_ATS_DATA;
            toast.error("ATS calculation failed; restored historical context with safety parameters.");
          }
          setAtsData(ats);
          await mongoApi.saveAtsResult(user?.uid || '', resumeId, ats);
        }
      }

      // 2. Load Roadmap
      if (item.roadmap) {
        setRoadmap(item.roadmap);
        if (item.roadmap.marketAnalysis) {
          setMarketAnalysis(item.roadmap.marketAnalysis);
        } else {
          setMarketAnalysis(null);
        }
        if (item.roadmap.title) {
          setTargetRole(item.roadmap.title.replace("Learning Roadmap for ", ""));
        } else {
          setTargetRole(item.parsedData?.experience?.[0]?.role || userProfile?.preferences?.targetRole || 'Software Engineer');
        }
      } else {
        // Check for corresponding roadmap via MongoDB API
        const roadmapDataSnap = await mongoApi.getRoadmap(user?.uid || '', resumeId);
        if (roadmapDataSnap) {
          setRoadmap(roadmapDataSnap);
          if (roadmapDataSnap.marketAnalysis) {
            setMarketAnalysis(roadmapDataSnap.marketAnalysis);
          } else {
            setMarketAnalysis(null);
          }
          if (roadmapDataSnap.title) {
            setTargetRole(roadmapDataSnap.title.replace("Learning Roadmap for ", ""));
          } else {
            setTargetRole(item.parsedData?.experience?.[0]?.role || userProfile?.preferences?.targetRole || 'Software Engineer');
          }
        } else {
          setRoadmap(null);
          setMarketAnalysis(null);
          setTargetRole(item.parsedData?.experience?.[0]?.role || userProfile?.preferences?.targetRole || 'Software Engineer');
        }
      }

      setTargetRegion(userProfile?.preferences?.targetLocation || 'Global');

      setActiveTab('dashboard');
      toast.success(`Restored state from parsed asset: ${item.filename}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to swap historical context.");
    }
  };

  const handleDeleteResume = async (deletedId: string) => {
    if (activeResumeId === deletedId) {
      if (user?.uid) {
        localStorage.removeItem(`careernav_active_resume_id_${user.uid}`);
      }
      try {
        const remaining = await mongoApi.getResumes(user?.uid || '');
        const valid = (remaining || []).filter((r: any) => (r.id || r._id) !== deletedId);
        if (valid.length > 0) {
          const nextResume = valid[0];
          const nextId = nextResume.id || nextResume._id;
          handleSelectResume(nextId, nextResume);
        } else {
          setResumeData(null);
          setActiveResumeId('');
          setAtsData(null);
          setRoadmap(null);
          setMarketAnalysis(null);
        }
      } catch (err) {
        console.error("Error refreshing active state after delete:", err);
      }
    }
  };

  const handleClearAllHistory = () => {
    if (user?.uid) {
      localStorage.removeItem(`careernav_active_resume_id_${user.uid}`);
    }
    setResumeData(null);
    setActiveResumeId('');
    setAtsData(null);
    setRoadmap(null);
    setMarketAnalysis(null);
  };

  const handleApplyReward = async (amount: number) => {
    if (!user) return;
    try {
      const finalXP = (userProfile?.xpPoints || 1250) + amount;
      const updatedProfile = {
        ...userProfile,
        xpPoints: finalXP
      };
      setUserProfile(updatedProfile);
      await mongoApi.saveXP(user.uid, finalXP, userProfile?.streak || 7);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateRoadmap = async (targetRole: string) => {
    setIsProcessing(true);
    const id = toast.loading(`Generating custom Flight Path for ${targetRole}...`);
    try {
      const currentSkills = resumeData?.parsedData?.skills || [];
      const currentRole = resumeData?.parsedData?.experience?.[0]?.role || "Software Engineer";
      const yoe = resumeData?.parsedData?.experience?.[0]?.years || 3;
      
      const parsedResumeContext = resumeData?.parsedData || {
        skills: currentSkills,
        experience: [{ role: currentRole, company: "Tech Company", years: yoe, bullets: [] }],
        education: [],
        projects: [],
        keywords: []
      };

      const generated = await geminiService.generateRoadmap(
        parsedResumeContext,
        currentRole,
        targetRole,
        yoe,
        user?.uid
      );

      setRoadmap(generated);
      setTargetRole(targetRole);

      if (user && activeResumeId) {
        await mongoApi.saveRoadmap(user.uid, activeResumeId, generated);
        try {
          const prefData = await mongoApi.getPreferences(user.uid);
          await mongoApi.savePreferences(user.uid, {
            ...prefData,
            targetRole: targetRole
          });
        } catch (prefErr) {
          console.error("Failed to update preferences targetRole:", prefErr);
        }
      }

      toast.success(`Welcome to your customized flight path to ${targetRole}!`, { id });
      setActiveTab('skillgap');
    } catch (err: any) {
      console.error(err);
      toast.error(`Roadmap generation failed: ${err.message || 'Unknown error'}`, { id });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center shadow-lg"
        >
          <Sparkles className="text-white w-6 h-6" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Toaster position="bottom-right" expand={true} richColors />

      {/* Target Spec Board Overlay */}
      <AnimatePresence>
        {isOnboardingPromptingTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-6 md:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/45 flex items-center justify-center text-[#2563EB] shrink-0">
                  <Target className="w-6 h-6 text-[#2563EB]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block font-mono">STEP 2: TARGET SELECTION</span>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Specify Your Target Role</h3>
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic leading-relaxed">
                Enter your desired career landing role. Based on your target selection, Career Nav AI will evaluate your profile and compile your custom 6-month learning journey.
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                const fData = new FormData(e.currentTarget);
                const role = fData.get('targetRole') as string;
                const region = fData.get('targetRegion') as string;
                handleTargetConfirm(role, region);
              }} className="space-y-5">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground uppercase tracking-widest block font-mono">
                    Desired Target Job Role
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      name="targetRole"
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Data Analyst, Backend Developer, Product Manager..."
                      className="w-full bg-muted/45 border border-border rounded-xl h-12 pl-11 pr-4 text-xs font-bold focus:outline-none focus:border-[#2563EB] transition-all text-foreground"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Quick select triggers */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block font-mono">Quick Search Suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Senior Full Stack Developer", "Frontend Developer", "Backend Developer", "Full Stack Dev", "Data Analyst", "Product Manager", "Machine Learning Eng"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setTargetRole(role)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50/50 hover:bg-blue-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/5 transition-all text-left cursor-pointer"
                      >
                        + {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground uppercase tracking-widest block font-mono">
                    Target Market Region
                  </label>
                  <input type="hidden" name="targetRegion" value={targetRegion} />
                  <div className="grid grid-cols-4 gap-2">
                    {["Global", "India", "USA", "Remote"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setTargetRegion(r)}
                        className={cn(
                          "py-2.5 rounded-xl border text-[11px] font-extrabold transition-all hover:scale-[1.01] cursor-pointer",
                          targetRegion === r 
                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25" 
                            : "bg-muted/40 border-border/40 hover:bg-muted/65 text-foreground"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsOnboardingPromptingTarget(false);
                      setPendingResumeData(null);
                      setPendingParsedData(null);
                    }}
                    className="flex-1 rounded-xl h-12 text-xs font-bold uppercase tracking-wider cursor-pointer border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl h-12 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                    Analyze & Generate Roadmap
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* 1. Global Processing Overlay - Highest Priority */}
      {isProcessing && appState !== 'auth' && <ProcessingView key="processing" />}

      {/* 2. Main App Content - Mutually exclusive with Processing Overlay */}
      <AnimatePresence mode="wait">
        {!(isProcessing && appState !== 'auth') && appState === 'landing' && (
          <motion.div 
            key="landing" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <LandingPage 
              onStart={() => {
                if (user) {
                  setAppState('dashboard');
                } else {
                  setAppState('auth');
                }
              }} 
              user={user}
              onGoToDashboard={() => setAppState('dashboard')}
              onUploadSuccess={handleUploadSuccess}
            />
          </motion.div>
        )}

        {!(isProcessing && appState !== 'auth') && appState === 'auth' && (
          <motion.div 
            key="auth" 
            initial={{ x: 100, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -100, opacity: 0 }}
            className="w-full"
          >
            <LoginView 
              onLogin={login} 
              onRegister={register}
              onBack={() => setAppState('landing')} 
              onResetPassword={handleResetPassword}
            />
          </motion.div>
        )}

        {!(isProcessing && appState !== 'auth') && appState === 'onboarding' && (
          <motion.div 
            key="onboarding" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 1.05 }} 
            className="min-h-screen flex flex-col p-6 items-center justify-center bg-gradient-to-br from-background to-muted/50"
          >
            <div className="max-w-3xl w-full text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight">Ready for <span className="text-primary italic">Lift Off?</span></h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  Analyze your resume with real market intelligence.
                </p>
              </div>
              <div className="glass p-1 rounded-[2.5rem] shadow-2xl bg-white/50 dark:bg-black/20 border border-white/20">
                <ResumeUpload onSuccess={handleUploadSuccess} userId={user?.uid || ''} />
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </Button>
                <Button variant="outline" onClick={() => setAppState('dashboard')} className="text-muted-foreground hover:text-primary transition-colors border-gray-200 dark:border-zinc-800 rounded-xl">
                  Explore Dashboard First
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {!(isProcessing && appState !== 'auth') && appState === 'dashboard' && (
          <motion.div 
            key="dashboard" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="min-h-screen bg-background flex flex-col"
          >
            <Header 
              activeTab={activeTab} 
              onTabChange={(tab) => {
                if (tab === 'logout') {
                  logout();
                } else if (tab === 'register_account') {
                  setAppState('auth');
                } else {
                  setActiveTab(tab);
                }
              }} 
              onLogout={logout} 
              user={user}
            />
            <main className="flex-1 min-h-[calc(100vh-120px)] bg-neutral-50/50 dark:bg-zinc-950/40 pt-[90px] lg:pt-[140px] flex flex-col">
              <div className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'dashboard' && (
                    <motion.div key="main_dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Dashboard 
                        user={{
                          uid: user?.uid || '',
                          name: getUserCleanName(user || userProfile) || 'Kamaljit',
                          xpPoints: userProfile?.xpPoints ?? 1500,
                          streak: userProfile?.streak ?? 9
                        }} 
                        resume={resumeData} 
                        atsData={atsData} 
                        targetRole={targetRole}
                        onNavigate={(tab) => setActiveTab(tab)} 
                        onGenerateRoadmap={handleGenerateRoadmap}
                        onGenerateTemporaryRoadmap={handleGenerateTemporaryRoadmap}
                        onUploadComplete={handleUploadSuccess}
                      />
                    </motion.div>
                  )}
                  {activeTab === 'ats' && (
                    <motion.div key="ats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <ATSScoreTab 
                        resumeData={resumeData} 
                        atsData={atsData} 
                        onNavigate={(tab) => setActiveTab(tab)} 
                      />
                    </motion.div>
                  )}
                  {activeTab === 'salary' && (
                    <motion.div key="salary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <SalaryInsightsTab 
                        resumeData={resumeData}
                        targetRole={targetRole}
                        onNavigate={(tab) => setActiveTab(tab)}
                        onGenerateTemporaryRoadmap={handleGenerateTemporaryRoadmap}
                      />
                    </motion.div>
                  )}
                   {activeTab === 'roadmap' && (
                    <motion.div key="roadmap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <CareerRoadmapTab 
                        roadmap={temporaryRoadmap || roadmap}
                        isTemporary={!!temporaryRoadmap}
                        onClearTemporary={() => setTemporaryRoadmap(null)}
                        onNavigate={(tab) => setActiveTab(tab)} 
                      />
                    </motion.div>
                  )}
                  {activeTab === 'skillgap' && (
                    <motion.div key="skillgap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <SkillGapTab 
                        roadmap={roadmap} 
                        onNavigate={(tab) => setActiveTab(tab)} 
                      />
                    </motion.div>
                  )}
                  {activeTab === 'resources' && (
                    <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <LearningResourcesTab 
                        roadmap={roadmap} 
                        onNavigate={(tab) => setActiveTab(tab)} 
                      />
                    </motion.div>
                  )}
                  {activeTab === 'upload' && (
                    <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <UploadResumeTab 
                        userId={user?.uid || ''} 
                        onSuccess={handleUploadSuccess} 
                        onNavigate={(tab) => setActiveTab(tab)}
                      />
                    </motion.div>
                  )}
                  {activeTab === 'history' && (
                    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <HistoryTab 
                        userId={user?.uid || ''} 
                        onSelectResume={handleSelectResume} 
                        activeResumeId={activeResumeId || undefined} 
                        onDeleteResume={handleDeleteResume}
                        onClearAllHistory={handleClearAllHistory}
                        onNavigate={(tab) => setActiveTab(tab)}
                      />
                    </motion.div>
                  )}
                  {activeTab === 'interview' && (
                    <motion.div key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <InterviewPrepTab 
                        resumeData={resumeData} 
                        targetRole={targetRole} 
                        onNavigate={(tab) => setActiveTab(tab)}
                      />
                    </motion.div>
                  )}
                  {activeTab === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <ProfileTab user={user} resumeData={resumeData} onUserUpdate={setUser} />
                    </motion.div>
                  )}
                  {activeTab === 'settings' && (
                    <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <SettingsTab 
                        userId={user?.uid || ''}
                        selectedModel={selectedModel}
                        onNavigate={(tab) => setActiveTab(tab)}
                        onModelChange={async (newModel) => {
                          setSelectedModel(newModel);
                          localStorage.setItem('careernav_ai_model', newModel);
                          if (user?.uid) {
                            try {
                              const prefData = await mongoApi.getPreferences(user.uid);
                              await mongoApi.savePreferences(user.uid, {
                                ...prefData,
                                aiModel: newModel
                              });
                            } catch (err) {
                              console.error("Failed to save model preference to DB:", err);
                            }
                          }
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>

            {/* Professional Footer */}
            <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-8 px-6 mt-auto">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* System Configuration Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8 border-b border-zinc-200/50 dark:border-zinc-800/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Anti-Fake Defense</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">AI blocks suspicious bot names in real-time.</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Email Integrity</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">Strict email uniqueness enforced across database.</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Auto-Purge Engine</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">Self-cleaning DB removes duplicates on boot.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                  <div>
                    Career Navigation building by <strong className="text-foreground">Kamaljit</strong> from BCA, Lovely Professional University, 2026
                  </div>
                  <div className="flex items-center gap-6">
                    <a 
                      href="https://github.com/raj40870-pixel" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                    <button onClick={() => setInfoModalType('privacy')} className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</button>
                    <button onClick={() => setInfoModalType('terms')} className="hover:text-primary transition-colors cursor-pointer">Terms of Service</button>
                    <button onClick={() => setInfoModalType('contact')} className="hover:text-primary transition-colors cursor-pointer">Contact</button>
                    <button onClick={() => setInfoModalType('about')} className="hover:text-primary transition-colors cursor-pointer">About</button>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {appState === 'public_view' && sharedRoadmap && (
          <motion.div 
            key="public_view" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="min-h-screen bg-background flex flex-col"
          >
            <div className="w-full h-16 border-b border-border flex items-center justify-between px-6 bg-white dark:bg-zinc-950 sticky top-0 z-[100]">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                   <Target className="w-5 h-5 text-primary" />
                 </div>
                 <span className="font-black text-sm tracking-tight">Public Roadmap Share</span>
               </div>
               <Button variant="ghost" onClick={() => setAppState('landing')} className="text-xs font-bold gap-2">
                 Join CareerNav <Sparkles className="w-3.5 h-3.5" />
               </Button>
            </div>
            <main className="flex-1 bg-neutral-50/30 dark:bg-zinc-950/20">
               <div className="max-w-5xl mx-auto w-full px-6 py-12 md:py-20 space-y-16">
                 <div className="space-y-6 text-center max-w-2xl mx-auto">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest"
                    >
                      <Sparkles className="w-3 h-3" />
                      Shared Intelligence
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">{sharedRoadmap.title || "Career Success Roadmap"}</h1>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                      This career flight path was generated by CareerNav AI. It outlines the specific technical sprints, skill gaps, and learning resources required to land a target role.
                    </p>
                 </div>
                 
                 <div className="space-y-24">
                   <section id="roadmap_sprints">
                     <div className="flex items-center justify-between mb-8">
                       <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                         <div className="w-2 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                         Execution Sprints
                       </h2>
                     </div>
                     <CareerRoadmapTab roadmap={sharedRoadmap} />
                   </section>

                   <section id="skill_gaps">
                     <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3">
                       <div className="w-2 h-8 bg-amber-500 rounded-full shadow-lg shadow-amber-500/20" />
                       Skill Gap Analysis
                     </h2>
                     <SkillGapTab roadmap={sharedRoadmap} />
                   </section>

                   <section id="resources">
                     <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3">
                       <div className="w-2 h-8 bg-blue-500 rounded-full shadow-lg shadow-blue-500/20" />
                       Recommended Resources
                     </h2>
                     <LearningResourcesTab roadmap={sharedRoadmap} />
                   </section>
                 </div>

                 <div className="pt-24 pb-12 text-center border-t border-border mt-32">
                   <div className="max-w-md mx-auto space-y-6">
                     <h3 className="text-2xl font-black tracking-tight">Want your own personalized roadmap?</h3>
                     <p className="text-muted-foreground text-sm font-medium">
                       Upload your resume today and get a custom AI-generated career strategy in seconds.
                     </p>
                     <Button onClick={() => setAppState('landing')} className="rounded-2xl px-10 h-14 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-95 bg-primary">
                       Build My Free Roadmap
                     </Button>
                   </div>
                 </div>
               </div>
            </main>
            <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 py-8 px-6 mt-auto">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* System Configuration Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8 border-b border-zinc-200/50 dark:border-zinc-800/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Anti-Fake Defense</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">AI blocks suspicious bot names in real-time.</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Email Integrity</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">Strict email uniqueness enforced across database.</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Auto-Purge Engine</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">Self-cleaning DB removes duplicates on boot.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                  <div>Career Navigation building by <strong className="text-foreground">Kamaljit</strong> from BCA, Lovely Professional University, 2026</div>
                  <div className="flex items-center gap-6">
                    <a 
                      href="https://linkedin.com/in/raj-kumar-2254a7371" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="hover:text-[#0A66C2] transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </a>
                    <a 
                      href="https://github.com/raj40870-pixel" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                    <button onClick={() => setInfoModalType('privacy')} className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</button>
                    <button onClick={() => setInfoModalType('terms')} className="hover:text-primary transition-colors cursor-pointer">Terms of Service</button>
                    <button onClick={() => setInfoModalType('contact')} className="hover:text-primary transition-colors cursor-pointer">Contact</button>
                    <button onClick={() => setInfoModalType('about')} className="hover:text-primary transition-colors cursor-pointer">About</button>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Legal & Information Modal */}
      <LegalAndInfoModal type={infoModalType} onClose={() => setInfoModalType(null)} />
    </div>
  );
}
