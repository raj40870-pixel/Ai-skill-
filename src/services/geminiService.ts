const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

import { mongoApi } from '../lib/mongoApi';

export interface ParsedResume {
  skills: string[];
  experience: { role: string; company: string; years: number; bullets: string[] }[];
  education: { degree: string; institute: string; year: number }[];
  projects: { name: string; tech: string[]; desc: string }[];
  keywords: string[];
}

export interface PriorityFix {
  problem: string;
  impact: string;
  fix: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface BulletRewrite {
  section?: string;
  before: string;
  after: string;
  reason: string;
}

export interface ATSResult {
  evaluatedRole?: string;
  score: number;
  universal_score?: number;
  role_match_score?: number;
  market_match?: number;
  label: string;
  color: string;
  breakdown: { criterion: string; score: number; max: number; fix: string }[];
  priority_fixes: PriorityFix[];
  bullet_rewrites?: BulletRewrite[];
  matched_keywords?: string[];
  missing_keywords?: Array<{ keyword: string; importance?: 'Critical' | 'High' | 'Medium'; suggestion?: string }>;
  section_audit?: Array<{ section: string; status: 'Strong' | 'Needs Work' | 'Missing'; scorePercent: number; feedback: string }>;
  grammar_audit?: Array<{ type: string; originalText: string; suggestedFix: string; explanation: string }>;
  repetition_audit?: {
    overused_words?: Array<{ word: string; count: number; suggestion: string }>;
    duplicate_lines?: string[];
    consecutive_duplicates?: string[];
    cliches_found?: string[];
    weak_phrases_found?: string[];
  };
  suggested_roles?: Array<{ role: string; match_percent: number; reason: string; missing_skills: string[] }>;
  auto_fixed_resume?: any;
  telemetry?: {
    wordCount: number;
    estimatedPages: number;
    bulletCount: number;
    quantifiedBullets: number;
    quantifiedPercent: number;
    strongVerbBullets: number;
    weakPhrasesFound: string[];
    clichesFound: string[];
    contact: { email: boolean; phone: boolean; linkedin: boolean; github: boolean; portfolio: boolean };
    sectionsFound: Record<string, boolean>;
    universalBaselineScore?: number;
  };
  jd_match_mode?: boolean;
}

export interface RoadmapData {
  title: string;
  sprints: {
    sprint_number: number;
    theme: string;
    weeks: {
      week: number;
      title: string;
      tasks: { type: 'course' | 'project' | 'skill'; title: string; platform?: string; hours?: number; tech?: string[]; details?: string }[];
    }[];
  }[];
  skill_gap_report?: {
    missing_skills: {
      category: string;
      skill: string;
      priority: 'High' | 'Medium' | 'Low';
      reason: string;
      market_demand_trend: string;
      suggested_improvement: string;
    }[];
  };
  learning_resources?: {
    skill_or_topic: string;
    official_documentation: string;
    free_youtube_courses: string;
    practice_websites: string;
    project_ideas: string;
    certification_recommendation: string;
  }[];
}


export interface AIModelOption {
  id: string;
  name: string;
  alias: string;
  provider: string;
  tier: 'free' | 'pro' | 'experimental';
  tierLabel: string;
  badge?: string;
  speed: string;
  speedRating: number; // 1 to 5
  description: string;
  bestFor: string;
  dailyFreeLimit: string;
  rpmLimit: string;
  isRecommended?: boolean;
}

export const AVAILABLE_GEMINI_MODELS: AIModelOption[] = [
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite (High Speed)",
    alias: "gemini-3.1-flash-lite",
    provider: "Google Cloud / AI Studio",
    tier: "free",
    tierLabel: "Free Standard",
    badge: "Active",
    speed: "⚡ Ultra-Fast (~220ms)",
    speedRating: 5,
    description: "Verified ultra-fast Google model for instantaneous ATS scoring and career roadmapping.",
    bestFor: "Real-time resume parsing, ATS audit, and career mapping.",
    dailyFreeLimit: "3 Scans/Week",
    rpmLimit: "15 RPM",
    isRecommended: true
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash (Deep Reasoning)",
    alias: "gemini-3.8-flash",
    provider: "Google Cloud / AI Studio",
    tier: "free",
    tierLabel: "Standard Reliability",
    speed: "⚡ Fast (~350ms)",
    speedRating: 4,
    description: "Deep reasoning engine for comprehensive skill analysis and interview simulations.",
    bestFor: "Complex career roadmaps and nuanced ATS feedback.",
    dailyFreeLimit: "3 Scans/Week",
    rpmLimit: "15 RPM"
  }
];

const cache: Record<string, any> = {};

export function getActiveAIModel(): string {
  const saved = localStorage.getItem('careernav_ai_model');
  if (saved) {
    const match = AVAILABLE_GEMINI_MODELS.find(m => m.id === saved || m.name === saved || m.alias === saved);
    if (match) return match.id;
  }
  return 'gemini-3.1-flash-lite';
}

export const geminiService = {
  getCache(key: string): any {
    return cache[key];
  },

  async parseResume(rawText: string, uid?: string): Promise<ParsedResume> {
    const model = getActiveAIModel();
    const res = await fetch(`${BASE_URL}/api/resume/parse`, {
      method: 'POST',
      headers: mongoApi.getHeaders(),
      body: JSON.stringify({ text: rawText, model, uid })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to parse resume");
    }
    return res.json();
  },

  async getATSScore(resumeText: string, jobTitle: string = "General", uid?: string, jobDescription?: string, resumeId?: string): Promise<ATSResult> {
    const model = getActiveAIModel();
    const res = await fetch(`${BASE_URL}/api/resume/ats`, {
      method: 'POST',
      headers: mongoApi.getHeaders(),
      body: JSON.stringify({ text: resumeText, jobTitle, jobDescription, model, uid, resumeId })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to calculate ATS score");
    }
    return res.json();
  },

  async guestScan(payload: { text?: string; base64?: string; mimeType?: string; filename?: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/resume/guest-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Guest scan failed");
    }
    return res.json();
  },

  async autoFixResume(text: string, targetRole: string = "Software Engineer", resumeId?: string): Promise<any> {
    const model = getActiveAIModel();
    const res = await fetch(`${BASE_URL}/api/resume/auto-fix`, {
      method: 'POST',
      headers: mongoApi.getHeaders(),
      body: JSON.stringify({ text, targetRole, model, resumeId })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to auto-fix resume");
    }
    return res.json();
  },

  async generateRoadmap(parsedResume: ParsedResume, currentRole: string, targetRole: string, yoe: number, uid?: string): Promise<any> {
    const model = getActiveAIModel();
    const res = await fetch(`${BASE_URL}/api/resume/roadmap`, {
      method: 'POST',
      headers: mongoApi.getHeaders(),
      body: JSON.stringify({ parsedResume, currentRole, targetRole, yoe, model, uid })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to generate roadmap");
    }
    return res.json();
  },

  async getVerifiedSalary(city: string, track: string, force: boolean = false): Promise<any> {
    const cacheKey = `salary_${city}_${track}`;
    if (!force && cache[cacheKey]) {
      return cache[cacheKey];
    }

    const model = getActiveAIModel();
    const res = await fetch(`${BASE_URL}/api/salary/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, track, model })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to fetch verified salary insights");
    }
    const data = await res.json();
    cache[cacheKey] = data;
    return data;
  },

  async getRealJobs(skills: string[], targetRole: string, force: boolean = false): Promise<any> {
    const skillsKey = Array.isArray(skills) ? skills.join(',') : '';
    const cacheKey = `jobs_${skillsKey}_${targetRole}`;
    if (!force && cache[cacheKey]) {
      return cache[cacheKey];
    }

    const model = getActiveAIModel();
    const res = await fetch(`${BASE_URL}/api/jobs/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills, targetRole, model })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to find matching opportunities");
    }
    const data = await res.json();
    cache[cacheKey] = data;
    return data;
  },

  async getMarketCompare(resumeText: string, targetRole: string, region: string, force: boolean = false): Promise<any> {
    const textPrefix = typeof resumeText === 'string' ? resumeText.slice(0, 100) : '';
    const cacheKey = `market_${textPrefix}_${targetRole}_${region}`;
    if (!force && cache[cacheKey]) {
      return cache[cacheKey];
    }

    const model = getActiveAIModel();
    const res = await fetch(`${BASE_URL}/api/market/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, targetRole, region, model })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to analyze global market data");
    }
    const data = await res.json();
    cache[cacheKey] = data;
    return data;
  },

  async getInterviewQuestions(skills: string[], targetRole: string, force: boolean = false): Promise<any> {
    const skillsKey = Array.isArray(skills) ? skills.join(',') : '';
    const cacheKey = `questions_${skillsKey}_${targetRole}`;
    if (!force && cache[cacheKey]) {
      return cache[cacheKey];
    }

    const model = getActiveAIModel();
    const res = await fetch(`${BASE_URL}/api/interview/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills, targetRole, model })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to generate interview questions");
    }
    const data = await res.json();
    cache[cacheKey] = data;
    return data;
  },

  async analyzeCareer(resumeText: string, filename: string, targetRole: string, region: string, modelOverride?: string, parsedData?: any): Promise<any> {
    const model = modelOverride || getActiveAIModel();
    const token = mongoApi.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/api/career/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        resumeText,
        filename,
        targetRole,
        region,
        model,
        parsedData,
        forceFresh: true
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to complete career analysis");
    }
    return res.json();
  },

  async evaluateAnswer(question: string, answerText: string): Promise<any> {
    const model = getActiveAIModel();
    const res = await fetch(`${BASE_URL}/api/interview/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answerText, model })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to evaluate response");
    }
    return res.json();
  },

  async translateHindiAnswerToEnglish(hindiText: string, question?: string): Promise<{ translatedEnglish: string; originalText: string; summaryOfPoints?: string[] }> {
    const model = getActiveAIModel();
    const res = await fetch(`${BASE_URL}/api/interview/translate-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hindiText, question, model })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to translate answer");
    }
    return res.json();
  }
};
