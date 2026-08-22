import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'local_db.json');

interface LocalDbData {
  users: any[];
  resumes: any[];
  atsResults: any[];
  roadmaps: any[];
}

function readDb(): LocalDbData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const defaultData = { users: [], resumes: [], atsResults: [], roadmaps: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
      return defaultData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content || '{"users":[],"resumes":[],"atsResults":[],"roadmaps":[]}');
  } catch (err) {
    console.error("[localDb] Error reading file:", err);
    return { users: [], resumes: [], atsResults: [], roadmaps: [] };
  }
}

function writeDb(data: LocalDbData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("[localDb] Error writing file:", err);
  }
}

export const localDb = {
  // Users
  getUserByEmail(email: string) {
    const db = readDb();
    const found = db.users.find(u => u.email?.toLowerCase() === email?.toLowerCase());
    return found ? { ...found } : null;
  },
  
  getUserByUid(uid: string) {
    const db = readDb();
    const found = db.users.find(u => u.uid === uid);
    return found ? { ...found } : null;
  },
  
  saveUser(user: any) {
    const db = readDb();
    const uid = user.uid || `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const idx = db.users.findIndex(u => u.uid === uid);
    
    const existing = idx >= 0 ? db.users[idx] : {};
    
    const preferences = {
      fullname: user.preferences?.fullname || user.displayName || existing.preferences?.fullname || '',
      targetRole: user.preferences?.targetRole || existing.preferences?.targetRole || 'Senior Full Stack Engineer',
      careerStatus: user.preferences?.careerStatus || existing.preferences?.careerStatus || 'Working',
      experienceYears: user.preferences?.experienceYears || existing.preferences?.experienceYears || '',
      preferredWorkStyle: user.preferences?.preferredWorkStyle || existing.preferences?.preferredWorkStyle || '',
      targetLocation: user.preferences?.targetLocation || existing.preferences?.targetLocation || '',
      expectedSalary: user.preferences?.expectedSalary || existing.preferences?.expectedSalary || '',
      linkedinUrl: user.preferences?.linkedinUrl || existing.preferences?.linkedinUrl || '',
      githubUrl: user.preferences?.githubUrl || existing.preferences?.githubUrl || '',
      portfolioUrl: user.preferences?.portfolioUrl || existing.preferences?.portfolioUrl || '',
      bio: user.preferences?.bio || existing.preferences?.bio || '',
      academicFoundation: user.preferences?.academicFoundation || existing.preferences?.academicFoundation || []
    };

    const serialized = {
      ...existing,
      uid,
      email: user.email || existing.email || `temp_${uid}@careernav.ai`,
      password: user.password || existing.password || null,
      displayName: user.displayName || existing.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL !== undefined ? user.photoURL : (existing.photoURL || ''),
      xpPoints: user.xpPoints !== undefined ? user.xpPoints : (existing.xpPoints || 1250),
      streak: user.streak !== undefined ? user.streak : (existing.streak || 7),
      plan: user.plan || existing.plan || 'FREE',
      usage: user.usage || existing.usage || { analysisCount: 0, windowStartDate: new Date().toISOString() },
      preferences,
      createdAt: user.createdAt || existing.createdAt || new Date().toISOString()
    };

    if (idx >= 0) {
      db.users[idx] = serialized;
    } else {
      db.users.push(serialized);
    }
    
    writeDb(db);
    return serialized;
  },

  // Resumes
  getResumes(userId: string) {
    const db = readDb();
    return db.resumes
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  },
  
  saveResume(resume: any) {
    const db = readDb();
    const serialized = {
      _id: resume._id || resume.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: resume.userId,
      text: resume.text,
      filename: resume.filename,
      targetRole: resume.targetRole || 'Full Stack Developer',
      parsedData: resume.parsedData || {},
      createdAt: resume.createdAt || new Date().toISOString()
    };
    db.resumes.push(serialized);
    writeDb(db);
    return serialized;
  },
  
  deleteResume(userId: string, id: string) {
    const db = readDb();
    db.resumes = db.resumes.filter(r => !((r._id === id || r.id === id) && r.userId === userId));
    db.atsResults = db.atsResults.filter(a => !(a.resumeId === id && a.userId === userId));
    db.roadmaps = db.roadmaps.filter(r => !(r.resumeId === id && r.userId === userId));
    writeDb(db);
  },
  
  deleteAllResumes(userId: string) {
    const db = readDb();
    db.resumes = db.resumes.filter(r => r.userId !== userId);
    db.atsResults = db.atsResults.filter(a => a.userId !== userId);
    db.roadmaps = db.roadmaps.filter(r => r.userId !== userId);
    writeDb(db);
  },

  migrateUserData(tempUid: string, uid: string) {
    if (!tempUid || !uid || tempUid === uid) return;
    const db = readDb();
    let updated = false;
    db.resumes.forEach(r => {
      if (r.userId === tempUid) {
        r.userId = uid;
        updated = true;
      }
    });
    db.atsResults.forEach(a => {
      if (a.userId === tempUid) {
        a.userId = uid;
        updated = true;
      }
    });
    db.roadmaps.forEach(rd => {
      if (rd.userId === tempUid) {
        rd.userId = uid;
        updated = true;
      }
    });
    if (updated) {
      writeDb(db);
    }
  },

  // ATS Results
  getLatestAtsResult(userId: string, resumeId?: string) {
    const db = readDb();
    const filtered = db.atsResults.filter(a => {
      if (resumeId) {
        return a.userId === userId && a.resumeId === resumeId;
      }
      return a.userId === userId;
    });
    const sorted = filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return sorted[0] || null;
  },
  
  saveAtsResult(atsResult: any) {
    const db = readDb();
    const finalFixes = atsResult.top_3_fixes || atsResult.priority_fixes || [];
    const serialized = {
      _id: atsResult._id || `ats_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: atsResult.userId,
      resumeId: atsResult.resumeId,
      score: atsResult.score,
      market_match: atsResult.market_match || 0,
      label: atsResult.label,
      color: atsResult.color,
      breakdown: atsResult.breakdown || [],
      top_3_fixes: Array.isArray(finalFixes) ? (typeof finalFixes[0] === 'object' ? finalFixes.map((f: any) => f.fix || f.problem) : finalFixes) : [],
      createdAt: atsResult.createdAt || new Date().toISOString()
    };
    db.atsResults.push(serialized);
    writeDb(db);
    return serialized;
  },

  // Roadmaps
  getLatestRoadmap(userId: string, resumeId?: string) {
    const db = readDb();
    const filtered = db.roadmaps.filter(r => {
      if (resumeId) {
        return r.userId === userId && r.resumeId === resumeId;
      }
      return r.userId === userId;
    });
    const sorted = filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return sorted[0] || null;
  },
  
  saveRoadmap(roadmap: any) {
    const db = readDb();
    const serialized = {
      _id: roadmap._id || `rdm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: roadmap.userId,
      resumeId: roadmap.resumeId,
      title: roadmap.title,
      sprints: roadmap.sprints || [],
      salary_projection: roadmap.salary_projection || {},
      skill_gap_report: roadmap.skill_gap_report || {},
      marketAnalysis: roadmap.marketAnalysis || {},
      createdAt: roadmap.createdAt || new Date().toISOString()
    };
    db.roadmaps.push(serialized);
    writeDb(db);
    return serialized;
  }
};
