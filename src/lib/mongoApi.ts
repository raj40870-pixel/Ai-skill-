const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export interface MongoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  xpPoints: number;
  streak: number;
  plan: string;
  preferences?: any;
}

class MongoApiService {
  private tokenKey = 'careernav_jwt_token';

  private isValidUid(uid: string): boolean {
    return !!uid && uid !== 'undefined' && uid !== 'null' && uid.trim() !== '';
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async register(email: string, password: string, displayName?: string, tempUid?: string): Promise<{ token: string; user: MongoUser }> {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, tempUid })
    });
    
    let data;
    const contentType = response.headers.get("content-type");
    const text = await response.text();
    
    if (contentType && contentType.includes("application/json")) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}...`);
      }
    } else {
      throw new Error(text || `Registration failed with status ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(data?.error || 'Registration failed');
    }
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string, tempUid?: string): Promise<{ token: string; user: MongoUser }> {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, tempUid })
    });
    
    let data;
    const contentType = response.headers.get("content-type");
    const text = await response.text();
    
    if (contentType && contentType.includes("application/json")) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}...`);
      }
    } else {
      throw new Error(text || `Login failed with status ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(data?.error || 'Login failed');
    }
    this.setToken(data.token);
    return data;
  }

  async resetPassword(email: string, password: string, displayName: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    });
    
    let data;
    const contentType = response.headers.get("content-type");
    const text = await response.text();
    
    if (contentType && contentType.includes("application/json")) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}...`);
      }
    } else {
      throw new Error(text || `Password reset failed with status ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(data?.error || 'Password reset failed');
    }
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getMe(): Promise<MongoUser | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        this.clearToken();
        return null;
      }
      const data = await response.json();
      return data.user;
    } catch (e) {
      console.error('Error fetching current user:', e);
      return null;
    }
  }

  async updateAvatar(uid: string, photoURL: string): Promise<string> {
    if (!this.isValidUid(uid)) return photoURL;
    const response = await fetch(`${BASE_URL}/api/users/${uid}/avatar`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ photoURL })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update avatar');
    return data.photoURL;
  }

  async getPreferences(uid: string): Promise<any> {
    if (!this.isValidUid(uid)) return {};
    try {
      const response = await fetch(`${BASE_URL}/api/users/${uid}/profile/preferences`, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn(`[mongoApi] Preferences not found for user ${uid}:`, errData.error || response.statusText);
        return {};
      }
      return await response.json();
    } catch (err) {
      console.error('[mongoApi] Failed to fetch preferences (network error):', err);
      return {};
    }
  }

  async savePreferences(uid: string, preferences: any): Promise<any> {
    if (!this.isValidUid(uid)) return preferences;
    const response = await fetch(`${BASE_URL}/api/users/${uid}/profile/preferences`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(preferences)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Save preferences failed');
    return data;
  }

  async saveXP(uid: string, xpPoints: number, streak: number): Promise<{ xpPoints: number; streak: number }> {
    if (!this.isValidUid(uid)) return { xpPoints, streak };
    try {
      const response = await fetch(`${BASE_URL}/api/users/${uid}/profile/xp`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ xpPoints, streak })
      });
      return await response.json();
    } catch (err) {
      console.error('Error saving XP:', err);
      return { xpPoints, streak };
    }
  }

  async saveResume(uid: string, text: string, filename: string, parsedData: any, targetRole: string): Promise<any> {
    if (!this.isValidUid(uid)) return null;
    const response = await fetch(`${BASE_URL}/api/users/${uid}/resumes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text, filename, parsedData, targetRole })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Saving resume failed');
    return data;
  }

  async getResumes(uid: string): Promise<any[]> {
    if (!this.isValidUid(uid)) return [];
    try {
      const response = await fetch(`${BASE_URL}/api/users/${uid}/resumes?t=${Date.now()}`, {
        headers: this.getHeaders(),
        cache: 'no-store'
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error(`[mongoApi] Failed to fetch resumes for user ${uid}:`, errData.error || response.statusText);
        return [];
      }
      return await response.json();
    } catch (err) {
      console.error('[mongoApi] Failed to fetch resumes (network error):', err);
      return [];
    }
  }

  async deleteResume(uid: string, id: string): Promise<void> {
    if (!this.isValidUid(uid)) return;
    const response = await fetch(`${BASE_URL}/api/users/${uid}/resumes/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Delete resume failed');
    }
  }

  async deleteAllResumes(uid: string): Promise<void> {
    if (!this.isValidUid(uid)) return;
    const response = await fetch(`${BASE_URL}/api/users/${uid}/resumes`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Clear history failed');
    }
  }

  async saveAtsResult(uid: string, resumeId: string, result: any): Promise<any> {
    if (!this.isValidUid(uid)) return null;
    const response = await fetch(`${BASE_URL}/api/users/${uid}/atsResults`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...result, resumeId })
    });
    return await response.json();
  }

  async getAtsResult(uid: string, resumeId?: string): Promise<any | null> {
    if (!this.isValidUid(uid)) return null;
    const url = resumeId 
      ? `${BASE_URL}/api/users/${uid}/atsResults?resumeId=${resumeId}`
      : `${BASE_URL}/api/users/${uid}/atsResults`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    if (!response.ok) return null;
    return await response.json();
  }

  async saveRoadmap(uid: string, resumeId: string, roadmap: any): Promise<any> {
    if (!this.isValidUid(uid)) return null;
    const response = await fetch(`${BASE_URL}/api/users/${uid}/roadmaps`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...roadmap, resumeId })
    });
    return await response.json();
  }

  async getRoadmap(uid: string, resumeId?: string): Promise<any | null> {
    if (!this.isValidUid(uid)) return null;
    const url = resumeId 
      ? `${BASE_URL}/api/users/${uid}/roadmaps?resumeId=${resumeId}`
      : `${BASE_URL}/api/users/${uid}/roadmaps`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    if (!response.ok) return null;
    return await response.json();
  }
}

export const mongoApi = new MongoApiService();
