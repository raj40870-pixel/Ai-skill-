import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  Globe, 
  Edit3, 
  Save, 
  Linkedin, 
  Github, 
  ExternalLink,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  Workflow,
  Camera,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mongoApi } from '../lib/mongoApi';
import { getUserAvatar } from '../lib/utils';

interface ProfileTabProps {
  user: any;
  resumeData: any;
  onUserUpdate?: (user: any) => void;
}

export function ProfileTab({ user, resumeData, onUserUpdate }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const parsed = resumeData?.parsedData || {};
  const skills = parsed.skills || ['React', 'TypeScript', 'Node.js', 'Next.js', 'System Design', 'Azure', 'Tailwind CSS', 'GraphQL', 'Docker', 'Kubernetes'];
  const experience = parsed.experience || [
    { role: 'Senior Product Engineer', company: 'Global Tech Solution', years: 3, bullets: ['Architected highly performant cloud interfaces', 'Led optimization audits reducing latency by 24%', 'Mentored dynamic cross-functional engineering teams'] }
  ];
  const education = parsed.education || [
    { degree: 'Bachelor of Science (Computer Science)', institute: 'State Tech University', year: 2021 }
  ];

  // New skill addition state
  const [newSkillText, setNewSkillText] = useState('');

  // Preferences State
  const [preferences, setPreferences] = useState({
    fullname: user?.displayName || 'Raj kumar',
    targetRole: 'Senior Full Stack Engineer',
    careerStatus: 'Working',
    experienceYears: '4',
    preferredWorkStyle: 'Remote',
    targetLocation: 'Bangalore, India',
    expectedSalary: '18-24 LPA',
    linkedinUrl: 'https://linkedin.com/in/raj-kumar-2254a7371',
    githubUrl: 'https://github.com/raj40870',
    portfolioUrl: typeof window !== 'undefined' ? window.location.origin : '',
    bio: 'Experienced software architect specialized in high-performance cloud platforms and dynamic client-side infrastructure.',
    academicFoundation: [] as any[],
    skills: [] as string[],
    experience: [] as any[]
  });

  // Load preferences from Firestore or localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      const initialAcademicFoundation = (education || []).map((edu: any) => ({
        degree: edu.degree || '',
        college: edu.institute || edu.college || '',
        university: edu.university || '',
        passingYear: String(edu.year || edu.passingYear || ''),
        cgpa: edu.cgpa || ''
      }));

      const initialSkills = parsed.skills || ['React', 'TypeScript', 'Node.js', 'Next.js', 'System Design', 'Azure', 'Tailwind CSS', 'GraphQL', 'Docker', 'Kubernetes'];
      const initialExperience = (parsed.experience || [
        { role: 'Senior Product Engineer', company: 'Global Tech Solution', years: 3, bullets: ['Architected highly performant cloud interfaces', 'Led optimization audits reducing latency by 24%', 'Mentored dynamic cross-functional engineering teams'] }
      ]).map((exp: any) => ({
        role: exp.role || '',
        company: exp.company || '',
        years: String(exp.years || exp.duration || ''),
        bullets: exp.bullets || []
      }));

      try {
        const loadedData = await mongoApi.getPreferences(user.uid);
        if (loadedData && Object.keys(loadedData).length > 0) {
          setPreferences(prev => ({
            ...prev,
            ...loadedData,
            academicFoundation: loadedData.academicFoundation !== undefined ? loadedData.academicFoundation : initialAcademicFoundation,
            skills: loadedData.skills !== undefined ? loadedData.skills : initialSkills,
            experience: loadedData.experience !== undefined ? loadedData.experience : initialExperience
          }));
        } else {
          // pre-populate name
          setPreferences(prev => ({
            ...prev,
            fullname: user.displayName || prev.fullname,
            targetRole: parsed.experience?.[0]?.role || prev.targetRole,
            experienceYears: String(parsed.experience?.[0]?.years || prev.experienceYears),
            academicFoundation: initialAcademicFoundation,
            skills: initialSkills,
            experience: initialExperience
          }));
        }
      } catch (err) {
        console.error("Error loading preferences:", err);
      }
    };

    loadPreferences();
  }, [user, resumeData]);

  // Helper to ensure any typed URL is prepended with https:// if it has no protocol
  const formatSocialUrl = (url: string | undefined | null, type: 'linkedin' | 'github' | 'portfolio'): string => {
    if (!url) return '';
    let trimmed = url.trim();
    if (/^(na|n\.a|-)$/i.test(trimmed)) {
      return trimmed;
    }
    
    // Correct copy-paste issues like 'com/in/username' instead of 'linkedin.com/in/username'
    if (trimmed.startsWith('com/')) {
      if (type === 'linkedin') {
        trimmed = 'linkedin.' + trimmed;
      } else if (type === 'github') {
        trimmed = 'github.' + trimmed;
      } else {
        trimmed = 'linkedin.' + trimmed;
      }
    }
    
    // In case they pasted 'https://com/in/...' by mistake as suggested by the screenshot input
    if (trimmed.startsWith('https://com/') || trimmed.startsWith('http://com/')) {
      const protocol = trimmed.startsWith('https://') ? 'https://' : 'http://';
      if (type === 'linkedin') {
        trimmed = protocol + 'linkedin.' + trimmed.substring(protocol.length);
      } else if (type === 'github') {
        trimmed = protocol + 'github.' + trimmed.substring(protocol.length);
      } else {
        trimmed = protocol + 'linkedin.' + trimmed.substring(protocol.length);
      }
    }
    
    // If it's already an absolute URL starting with http:// or https://
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    
    // Convert 'linkedin.com/...' or 'www.linkedin.com/...' or 'github.com/...' to absolute
    if (trimmed.startsWith('linkedin.com') || trimmed.startsWith('github.com') || trimmed.startsWith('www.')) {
      return `https://${trimmed}`;
    }
    
    // If they typed just a username/ID (e.g. they only pasted the last slug text from LinkedIn/GitHub)
    if (!trimmed.includes('.') && !trimmed.includes('/')) {
      if (type === 'linkedin') {
        return `https://linkedin.com/in/${trimmed}`;
      } else if (type === 'github') {
        return `https://github.com/${trimmed}`;
      }
    }
    
    return `https://${trimmed}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const newPhotoURL = await mongoApi.updateAvatar(user.uid, base64String);
        if (onUserUpdate) {
          onUserUpdate({ ...user, photoURL: newPhotoURL });
        }
        toast.success("Profile photo updated!");
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to update photo");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async () => {
    if (!user) return;
    setIsUploading(true);
    try {
      await mongoApi.updateAvatar(user.uid, '');
      if (onUserUpdate) {
        onUserUpdate({ ...user, photoURL: '' });
      }
      toast.success("Profile photo removed");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to remove photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Normalize social URLs so they are fully qualified valid absolute links and contain no undefined
    const cleanedPreferences = {
      fullname: preferences.fullname || '',
      targetRole: preferences.targetRole || '',
      careerStatus: preferences.careerStatus || '',
      experienceYears: preferences.experienceYears || '',
      preferredWorkStyle: preferences.preferredWorkStyle || '',
      targetLocation: preferences.targetLocation || '',
      expectedSalary: preferences.expectedSalary || '',
      linkedinUrl: formatSocialUrl(preferences.linkedinUrl, 'linkedin'),
      githubUrl: formatSocialUrl(preferences.githubUrl, 'github'),
      portfolioUrl: formatSocialUrl(preferences.portfolioUrl, 'portfolio'),
      bio: preferences.bio || '',
      academicFoundation: preferences.academicFoundation || [],
      skills: preferences.skills || [],
      experience: preferences.experience || []
    };

    try {
      const savedData = await mongoApi.savePreferences(user.uid, cleanedPreferences);
      setPreferences(prev => ({
        ...prev,
        ...savedData,
        academicFoundation: savedData.academicFoundation || [],
        skills: savedData.skills || [],
        experience: savedData.experience || []
      }));
      
      // Notify parent about fullname update
      if (onUserUpdate && cleanedPreferences.fullname) {
        onUserUpdate({ ...user, displayName: cleanedPreferences.fullname });
      }
      
      toast.success("Profile preferences saved successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save profile: ${err?.message || err || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-16">
      {/* Header section with clean summary and action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mr-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            Professional <span className="text-primary italic">Identity</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Your verified career ledger containing preferences, parsed resume keywords, and credentials.
          </p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'outline' : 'default'}
          className={`rounded-2xl px-6 h-12 flex items-center gap-2 font-bold cursor-pointer transition-all hover:scale-[1.02] ${!isEditing ? 'bg-primary text-white shadow-lg shadow-primary/20' : ''}`}
        >
          {isEditing ? (
            <>
              Cancel Edit
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              Update Preferences
            </>
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left sidebar info */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="glass border-none rounded-[3rem] p-8 text-center bg-white/60 dark:bg-black/45 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] -z-10 opacity-90" />
                  <div className="mb-6 pt-6">
                    <div className="w-28 h-28 rounded-full border-4 border-background bg-muted mx-auto overflow-hidden shadow-2xl relative group">
                      <img src={getUserAvatar(user?.email || 'guest', preferences.fullname, user?.photoURL)} alt="avatar" className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <Camera className="w-8 h-8 text-white" />
                        )}
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest block mb-1 text-left">Full Name</label>
                      <input 
                        type="text" 
                        value={preferences.fullname}
                        onChange={(e) => setPreferences({...preferences, fullname: e.target.value})}
                        required
                        className="w-full bg-background border px-4 py-2 rounded-xl text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest block mb-1 text-left">Professional Bio</label>
                      <textarea 
                        value={preferences.bio}
                        onChange={(e) => setPreferences({...preferences, bio: e.target.value})}
                        required
                        rows={4}
                        className="w-full bg-background border px-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary leading-relaxed italic"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Editable elements panel */}
              <div className="lg:col-span-8 space-y-6 bg-white/30 dark:bg-black/20 p-8 rounded-[3rem] border border-white/10 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <h3 className="text-xl font-bold tracking-tight">Active Preferences & Targets</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Target Role</label>
                    <input 
                      type="text" 
                      value={preferences.targetRole}
                      onChange={(e) => setPreferences({...preferences, targetRole: e.target.value})}
                      required
                      placeholder="e.g. Lead Full Stack Architect"
                      className="w-full bg-background border px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Career Status</label>
                    <select 
                      value={preferences.careerStatus}
                      onChange={(e) => setPreferences({...preferences, careerStatus: e.target.value})}
                      className="w-full bg-background border px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                    >
                      <option value="Working">Working Professional</option>
                      <option value="Student">Student / Academic</option>
                      <option value="Job Hunting">Actively Job Hunting</option>
                      <option value="Career Break">On a Career Break</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Experience (Years)</label>
                    <input 
                      type="text" 
                      value={preferences.experienceYears}
                      onChange={(e) => setPreferences({...preferences, experienceYears: e.target.value})}
                      required
                      className="w-full bg-background border px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Expected Compensation (LPA / Salary)</label>
                    <input 
                      type="text" 
                      value={preferences.expectedSalary}
                      onChange={(e) => setPreferences({...preferences, expectedSalary: e.target.value})}
                      required
                      placeholder="e.g. 15-20 LPA"
                      className="w-full bg-background border px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Preferred Work Style</label>
                    <select 
                      value={preferences.preferredWorkStyle}
                      onChange={(e) => setPreferences({...preferences, preferredWorkStyle: e.target.value})}
                      className="w-full bg-background border px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                    >
                      <option value="Remote">Remote First</option>
                      <option value="Hybrid">Hybrid Office</option>
                      <option value="Onsite">Onsite Desk</option>
                      <option value="Any">Flexible / Any</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Target Locations</label>
                    <input 
                      type="text" 
                      value={preferences.targetLocation}
                      onChange={(e) => setPreferences({...preferences, targetLocation: e.target.value})}
                      required
                      placeholder="e.g. Bangalore, Remote"
                      className="w-full bg-background border px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                    />
                  </div>
                </div>

                <hr className="border-border/50 my-6" />

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Portfolio & Professional Coordinates</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-widest block mb-1">LinkedIn URL</label>
                      <div className="relative">
                        <Linkedin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="text" 
                          value={preferences.linkedinUrl}
                          onChange={(e) => setPreferences({...preferences, linkedinUrl: e.target.value})}
                          placeholder="https://linkedin.com/..."
                          className="w-full bg-background border pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-widest block mb-1">GitHub URL</label>
                      <div className="relative">
                        <Github className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="text" 
                          value={preferences.githubUrl}
                          onChange={(e) => setPreferences({...preferences, githubUrl: e.target.value})}
                          placeholder="https://github.com/..."
                          className="w-full bg-background border pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-widest block mb-1">Portfolio Website</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="text" 
                          value={preferences.portfolioUrl}
                          onChange={(e) => setPreferences({...preferences, portfolioUrl: e.target.value})}
                          placeholder="https://yourwebsite.me"
                          className="w-full bg-background border pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Foundation Editable Section */}
                <hr className="border-border/50 my-6" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      Academic Foundation
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPreferences(prev => ({
                          ...prev,
                          academicFoundation: [
                            ...(prev.academicFoundation || []),
                            { degree: '', college: '', university: '', passingYear: '', cgpa: '' }
                          ]
                        }));
                      }}
                      className="rounded-xl h-8 text-[11px] font-bold uppercase tracking-wider gap-1 cursor-pointer border border-border/60"
                    >
                      + Add Record
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {(!preferences.academicFoundation || preferences.academicFoundation.length === 0) ? (
                      <p className="text-xs text-muted-foreground italic bg-muted/20 p-4 rounded-xl text-center">No custom academic foundation records. Click '+ Add Record' to begin, or we will show parsed resume education by default.</p>
                    ) : (
                      preferences.academicFoundation.map((edu, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-3 relative group/edu">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-muted-foreground/80 tracking-widest">Degree / Program</label>
                              <input
                                type="text"
                                value={edu.degree || ''}
                                onChange={(e) => {
                                  const updated = [...(preferences.academicFoundation || [])];
                                  updated[idx] = { ...updated[idx], degree: e.target.value };
                                  setPreferences({ ...preferences, academicFoundation: updated });
                                }}
                                required
                                placeholder="e.g. B.Tech Computer Science"
                                className="w-full bg-background border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium text-foreground"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-muted-foreground/80 tracking-widest">Passing Year</label>
                                <input
                                  type="text"
                                  value={edu.passingYear || ''}
                                  onChange={(e) => {
                                    const updated = [...(preferences.academicFoundation || [])];
                                    updated[idx] = { ...updated[idx], passingYear: e.target.value };
                                    setPreferences({ ...preferences, academicFoundation: updated });
                                  }}
                                  placeholder="e.g. 2024"
                                  className="w-full bg-background border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium text-foreground"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-muted-foreground/80 tracking-widest">CGPA / Percentage</label>
                                <input
                                  type="text"
                                  value={edu.cgpa || ''}
                                  onChange={(e) => {
                                    const updated = [...(preferences.academicFoundation || [])];
                                    updated[idx] = { ...updated[idx], cgpa: e.target.value };
                                    setPreferences({ ...preferences, academicFoundation: updated });
                                  }}
                                  placeholder="e.g. 8.5 / 85%"
                                  className="w-full bg-background border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium text-foreground"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-muted-foreground/80 tracking-widest">College</label>
                              <input
                                type="text"
                                value={edu.college || ''}
                                onChange={(e) => {
                                  const updated = [...(preferences.academicFoundation || [])];
                                  updated[idx] = { ...updated[idx], college: e.target.value };
                                  setPreferences({ ...preferences, academicFoundation: updated });
                                }}
                                placeholder="e.g. College of Engineering"
                                className="w-full bg-background border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium text-foreground"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-muted-foreground/80 tracking-widest">University</label>
                              <input
                                type="text"
                                value={edu.university || ''}
                                onChange={(e) => {
                                  const updated = [...(preferences.academicFoundation || [])];
                                  updated[idx] = { ...updated[idx], university: e.target.value };
                                  setPreferences({ ...preferences, academicFoundation: updated });
                                }}
                                placeholder="e.g. State University"
                                className="w-full bg-background border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium text-foreground"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Core Expertise / Skills Editing Section */}
                <hr className="border-border/50 my-6" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Core Expertise & Skills
                    </h4>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillText}
                      onChange={(e) => setNewSkillText(e.target.value)}
                      placeholder="e.g. Docker"
                      className="flex-1 bg-background border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium text-foreground"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmed = newSkillText.trim();
                          if (trimmed && !preferences.skills.includes(trimmed)) {
                            setPreferences(prev => ({
                              ...prev,
                              skills: [...(prev.skills || []), trimmed]
                            }));
                            setNewSkillText('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const trimmed = newSkillText.trim();
                        if (trimmed && !preferences.skills.includes(trimmed)) {
                          setPreferences(prev => ({
                            ...prev,
                            skills: [...(prev.skills || []), trimmed]
                          }));
                          setNewSkillText('');
                        }
                      }}
                      className="rounded-xl h-10 text-[11px] font-bold uppercase tracking-wider px-4 cursor-pointer"
                    >
                      Add Skill
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(!preferences.skills || preferences.skills.length === 0) ? (
                      <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
                    ) : (
                      preferences.skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Professional Track Records Editing Section */}
                <hr className="border-border/50 my-6" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      Professional Track Records
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPreferences(prev => ({
                          ...prev,
                          experience: [
                            ...(prev.experience || []),
                            { role: '', company: '', years: '1', bullets: [''] }
                          ]
                        }));
                      }}
                      className="rounded-xl h-8 text-[11px] font-bold uppercase tracking-wider gap-1 cursor-pointer border border-border/60"
                    >
                      + Add Experience
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {(!preferences.experience || preferences.experience.length === 0) ? (
                      <p className="text-xs text-muted-foreground italic bg-muted/20 p-4 rounded-xl text-center">No custom experience records. Click '+ Add Experience' to begin.</p>
                    ) : (
                      preferences.experience.map((exp, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-4 relative">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-muted-foreground/80 tracking-widest">Role / Title</label>
                              <input
                                type="text"
                                value={exp.role || ''}
                                onChange={(e) => {
                                  const updated = [...(preferences.experience || [])];
                                  updated[idx] = { ...updated[idx], role: e.target.value };
                                  setPreferences({ ...preferences, experience: updated });
                                }}
                                required
                                placeholder="e.g. Senior Software Engineer"
                                className="w-full bg-background border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium text-foreground"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-muted-foreground/80 tracking-widest">Company</label>
                              <input
                                type="text"
                                value={exp.company || ''}
                                onChange={(e) => {
                                  const updated = [...(preferences.experience || [])];
                                  updated[idx] = { ...updated[idx], company: e.target.value };
                                  setPreferences({ ...preferences, experience: updated });
                                }}
                                required
                                placeholder="e.g. Google"
                                className="w-full bg-background border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium text-foreground"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-muted-foreground/80 tracking-widest">Duration (Years)</label>
                              <input
                                type="text"
                                value={exp.years || ''}
                                onChange={(e) => {
                                  const updated = [...(preferences.experience || [])];
                                  updated[idx] = { ...updated[idx], years: e.target.value };
                                  setPreferences({ ...preferences, experience: updated });
                                }}
                                required
                                placeholder="e.g. 3"
                                className="w-full bg-background border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium text-foreground"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-black uppercase text-muted-foreground/80 tracking-widest">Bullet Contributions</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(preferences.experience || [])];
                                  updated[idx].bullets = [...(updated[idx].bullets || []), ''];
                                  setPreferences({ ...preferences, experience: updated });
                                }}
                                className="text-[10px] font-bold text-primary hover:underline"
                              >
                                + Add Bullet
                              </button>
                            </div>
                            <div className="space-y-2">
                              {(exp.bullets || []).map((bullet: string, bulletIdx: number) => (
                                <div key={bulletIdx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => {
                                      const updated = [...(preferences.experience || [])];
                                      updated[idx].bullets[bulletIdx] = e.target.value;
                                      setPreferences({ ...preferences, experience: updated });
                                    }}
                                    placeholder="e.g. Led design of core microservices..."
                                    className="flex-1 bg-background border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium text-foreground"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="rounded-2xl h-12 px-8 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white font-extrabold flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving Identity..." : "Commit Preferences"}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="view-profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 animate-in fade-in"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* User Left Panel Deck */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="glass border-none rounded-[3rem] p-8 text-center bg-white/60 dark:bg-black/45 relative overflow-hidden shadow-2xl">
                  {/* Design banner at the top */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] -z-10 opacity-90" />
                  <div className="mb-6 pt-6">
                    <div className="w-28 h-28 rounded-full border-4 border-background bg-muted mx-auto overflow-hidden shadow-2xl relative group">
                      <img src={getUserAvatar(user?.email || 'guest', preferences.fullname, user?.photoURL)} alt="avatar" className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <Camera className="w-8 h-8 text-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-black tracking-tight text-foreground">{preferences.fullname}</h2>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {preferences.targetRole}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-semibold">
                      <Mail className="w-3.5 h-3.5" />
                      {user?.email || 'verified_professional@domain.com'}
                    </div>
                  </div>

                  {preferences.bio && (
                    <p className="mt-6 text-xs text-muted-foreground leading-relaxed italic border-t border-border/40 pt-6">
                      "{preferences.bio}"
                    </p>
                  )}

                  <div className="mt-6 pt-6 border-t border-border/40 grid grid-cols-2 gap-4">
                    <div className="text-left bg-muted/40 p-4 rounded-2xl relative overflow-hidden">
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block mb-1">XP Ledger</span>
                      <span className="text-xl font-black text-foreground">{user?.xpPoints || 1250}</span>
                    </div>
                    <div className="text-left bg-muted/40 p-4 rounded-2xl relative overflow-hidden">
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block mb-1">Rank Tier</span>
                      <span className="text-xl font-black text-primary">GOLD</span>
                    </div>
                  </div>
                </Card>

                {/* Social Handles Badges */}
                <Card className="glass border-none rounded-[2rem] p-6 bg-white/60 dark:bg-black/45 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground/90">Verified Coordinates</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8 px-2 text-xs font-bold text-primary flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <a 
                      href={preferences.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/15 text-[#0A66C2] border border-[#0A66C2]/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-5 h-5" />
                        <span className="text-xs font-bold">LinkedIn Connect</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a 
                      href={preferences.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Github className="w-5 h-5" />
                        <span className="text-xs font-bold">GitHub Repository</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a 
                      href={preferences.portfolioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#7C3AED]/10 hover:bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5" />
                        <span className="text-xs font-bold">Public Portfolio</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </Card>

                {/* Verification Nodes */}
                <Card className="glass border-none rounded-[2rem] p-6 bg-white/60 dark:bg-black/45 shadow-xl space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground/90">Identity Lock Security</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-green-500/10 text-green-600 border border-green-500/10">
                      <CheckCircle2 className="w-5 h-5 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider">SSO Identity Link Secured</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/10">
                      <Workflow className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Real-time DB Sync Status: Live</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Preferences Ledger / Skills / Experience Details Grid */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* User Active System Preference Settings Metrics */}
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-xs font-black uppercase text-muted-foreground tracking-widest block">Active Preferences & Targets</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-8 px-2 text-xs font-bold text-primary flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="glass border-none rounded-[2.5rem] p-6 bg-white/60 dark:bg-black/45 shadow-lg border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Work Preference</span>
                    </div>
                    <p className="text-xl font-black text-foreground">{preferences.preferredWorkStyle}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Target: {preferences.targetLocation}
                    </p>
                  </Card>

                  <Card className="glass border-none rounded-[2.5rem] p-6 bg-white/60 dark:bg-black/45 shadow-lg border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Career Status</span>
                    </div>
                    <p className="text-xl font-black text-primary">{preferences.careerStatus}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-bold">
                      {preferences.experienceYears} Years Experienced
                    </p>
                  </Card>

                  <Card className="glass border-none rounded-[2.5rem] p-6 bg-white/60 dark:bg-black/45 shadow-lg border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Target Rewards</span>
                    </div>
                    <p className="text-xl font-black text-[#10B981]">{preferences.expectedSalary}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Award className="w-3 h-3 text-yellow-500" />
                      Verified Market Midpoint
                    </p>
                  </Card>
                </div>

                {/* Core Expertise Header Banner */}
                <Card className="glass border-none rounded-[3rem] p-8 bg-white/60 dark:bg-black/45 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-muted-foreground tracking-widest block">Core Expertise Tag Matrix</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-8 px-2 text-xs font-bold text-primary flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </Button>
                      <Sparkles className="w-4 h-4 text-primary opacity-65" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.skills.map((skill: string) => (
                      <span key={skill} className="px-4 py-2 rounded-2xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform duration-200 cursor-pointer">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>

                {/* Professional Track Records */}
                <Card className="glass border-none rounded-[3rem] p-8 bg-white/60 dark:bg-black/45 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-muted-foreground tracking-widest block">Professional Track Records</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-8 px-2 text-xs font-bold text-primary flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </Button>
                      <Briefcase className="w-4 h-4 text-muted-foreground opacity-50" />
                    </div>
                  </div>
                  <div className="space-y-8 mt-4">
                    {preferences.experience.map((exp: any, i: number) => (
                      <div key={i} className="flex gap-6 relative group">
                        {i < preferences.experience.length - 1 && (
                          <div className="absolute top-12 bottom-[-24px] left-6 w-0.5 bg-border/40" />
                        )}
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border/40 shadow-sm">
                          <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                            <div>
                              <h4 className="font-black text-lg text-foreground group-hover:text-primary transition-colors">{exp.role}</h4>
                              <p className="text-sm font-bold text-muted-foreground/80">{exp.company}</p>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-muted text-[10px] font-black uppercase text-muted-foreground shrink-0 mt-1 sm:mt-0">
                              {typeof exp.years === 'number' || !isNaN(Number(exp.years)) ? `${exp.years}+ Years` : exp.years || '1+ Years'}
                            </span>
                          </div>
                          {exp.bullets && (
                            <ul className="space-y-2 pl-4 list-disc text-xs text-muted-foreground leading-relaxed italic opacity-95">
                              {exp.bullets.map((b: string, idx: number) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Academic Foundations */}
                <Card className="glass border-none rounded-[3rem] p-8 bg-white/60 dark:bg-black/45 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-muted-foreground tracking-widest block">Academic Foundations</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-8 px-2 text-xs font-bold text-primary flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </Button>
                      <BookOpen className="w-4 h-4 text-muted-foreground opacity-50" />
                    </div>
                  </div>
                  <div className="space-y-6 mt-4">
                    {preferences.academicFoundation && preferences.academicFoundation.length > 0 ? (
                      preferences.academicFoundation.map((edu: any, i: number) => (
                        <div key={i} className="flex gap-6 items-start">
                          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border/40 shadow-sm mt-1">
                            <GraduationCap className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-base text-foreground truncate">{edu.degree}</h4>
                            <p className="text-xs font-bold text-muted-foreground/90 mt-0.5">
                              {edu.college || edu.institute || 'Unknown Institution'}
                              {edu.university ? ` • ${edu.university}` : ''}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              {edu.passingYear && (
                                <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                                  Class of {edu.passingYear}
                                </span>
                              )}
                              {edu.cgpa && (
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                                  CGPA: {edu.cgpa}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/10 rounded-2xl">
                        No academic qualifications listed. Click 'Update Preferences' to add your degree programs.
                      </p>
                    )}
                  </div>
                </Card>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
