const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export interface MongoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  xpPoints: number;
  streak: number;
  plan: string;
  isAdmin?: boolean;
  usage?: {
    tokensUsed?: number;
    tokenLimit?: number;
    analysisCount?: number;
    windowStartDate?: string;
  };
  preferences?: any;
}

export interface SupportTicket {
  _id?: string;
  ticketId: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  pageUrl?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminReply?: string;
  adminRepliedAt?: string;
  adminRepliedBy?: string;
  createdAt: string;
  updatedAt: string;
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

  async sendRegisterOtp(email: string, password: string, displayName?: string): Promise<{ success: boolean; message: string; email: string }> {
    const response = await fetch(`${BASE_URL}/api/auth/send-register-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text || `Failed with status ${response.status}`);
    }
    if (!response.ok) {
      throw new Error(data?.error || 'Failed to send verification code');
    }
    return data;
  }

  async verifyRegisterOtp(email: string, otp: string, tempUid?: string): Promise<{ token: string; user: MongoUser }> {
    const response = await fetch(`${BASE_URL}/api/auth/verify-register-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, tempUid })
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text || `Failed with status ${response.status}`);
    }
    if (!response.ok) {
      throw new Error(data?.error || 'Verification failed');
    }
    this.setToken(data.token);
    return data;
  }

  async sendResetOtp(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/api/auth/send-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text || `Failed with status ${response.status}`);
    }
    if (!response.ok) {
      throw new Error(data?.error || 'Failed to send reset code');
    }
    return data;
  }

  async verifyResetOtp(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string; token?: string; user?: MongoUser }> {
    const response = await fetch(`${BASE_URL}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text || `Failed with status ${response.status}`);
    }
    if (!response.ok) {
      throw new Error(data?.error || 'Password reset failed');
    }
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
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

  async login(email: string, password: string, tempUid?: string, adminOtp?: string): Promise<{ token?: string; user?: MongoUser; requiresAdminOtp?: boolean; message?: string }> {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, tempUid, adminOtp })
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
    if (data.token) {
      this.setToken(data.token);
    }
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

  // --- MENTORSHIP METHODS ---

  async getChatSessions(uid: string): Promise<any[]> {
    if (!this.isValidUid(uid)) return [];
    try {
      const response = await fetch(`${BASE_URL}/api/mentor/sessions`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return [];
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch (err) {
      console.warn('Failed to load chat sessions:', err);
      return [];
    }
  }

  async createChatSession(uid: string, title?: string, model?: string): Promise<any> {
    if (!this.isValidUid(uid)) return null;
    try {
      const response = await fetch(`${BASE_URL}/api/mentor/sessions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ title, model })
      });
      if (!response.ok) {
        const errText = await response.text();
        console.warn('Create chat session failed status:', response.status, errText);
        return null;
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('Failed to create chat session:', err);
      return null;
    }
  }

  async deleteChatSession(uid: string, sessionId: string): Promise<void> {
    if (!this.isValidUid(uid)) return;
    try {
      const response = await fetch(`${BASE_URL}/api/mentor/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!response.ok) {
        console.warn('Failed to delete chat session:', response.status);
      }
    } catch (err) {
      console.warn('Failed to delete chat session:', err);
    }
  }

  async sendMentorMessage(uid: string, sessionId: string, message: string, model?: string, attachments?: any[]): Promise<any> {
    if (!this.isValidUid(uid)) return null;
    const response = await fetch(`${BASE_URL}/api/mentor/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ sessionId, message, model, attachments })
    });
    const contentType = response.headers.get('content-type');
    let data: any = {};
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text || 'Server response error' };
    }
    if (!response.ok) throw new Error(data.error || 'Chat failed');
    return data;
  }

  async getUserUsage(uid: string): Promise<any> {
    if (!this.isValidUid(uid)) return null;
    try {
      const response = await fetch(`${BASE_URL}/api/users/${uid}/usage`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.warn('Failed to fetch user usage:', err);
      return null;
    }
  }

  async getAdminUsers(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch admin users');
    }
    return await response.json();
  }

  // --- SUPPORT TICKETS API ---
  async createSupportTicket(ticket: {
    userId?: string;
    userEmail: string;
    userName?: string;
    category?: string;
    priority?: string;
    title: string;
    description: string;
    pageUrl?: string;
  }): Promise<{ success: boolean; ticket: SupportTicket; message: string }> {
    const response = await fetch(`${BASE_URL}/api/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit support ticket');
    }
    return data;
  }

  async getMySupportTickets(email?: string, userId?: string): Promise<SupportTicket[]> {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (userId) params.append('userId', userId);
    const response = await fetch(`${BASE_URL}/api/support/tickets/my?${params.toString()}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch tickets');
    }
    return await response.json();
  }

  async getSupportTicketById(ticketId: string): Promise<SupportTicket> {
    const response = await fetch(`${BASE_URL}/api/support/tickets/${encodeURIComponent(ticketId)}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Ticket not found');
    }
    return await response.json();
  }

  async getAdminSupportTickets(): Promise<SupportTicket[]> {
    const response = await fetch(`${BASE_URL}/api/admin/support/tickets`, {
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch support tickets');
    }
    return await response.json();
  }

  async replyAdminSupportTicket(
    ticketId: string, 
    replyData: { adminReply?: string; status?: string; adminRepliedBy?: string }
  ): Promise<{ success: boolean; ticket: SupportTicket; message: string }> {
    const response = await fetch(`${BASE_URL}/api/admin/support/tickets/${encodeURIComponent(ticketId)}/reply`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(replyData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update ticket');
    }
    return data;
  }
}

export const mongoApi = new MongoApiService();
