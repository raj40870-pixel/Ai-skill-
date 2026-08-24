import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  ArrowLeft, 
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<any>;
  onRegister: (email: string, password: string, displayName: string) => Promise<any>;
  onResetPassword: (email: string, password: string, displayName: string) => Promise<any>;
  onBack: () => void;
}

export function LoginView({ onLogin, onRegister, onResetPassword, onBack }: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      toast.error("Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (isForgotPassword) {
      if (!displayName.trim()) {
        toast.error("Please enter your name for verification.");
        return;
      }
      setIsLoading(true);
      try {
        const result = await onResetPassword(cleanEmail, password, displayName.trim());
        toast.success(result.message || "Password updated successfully. Please login with your new password.");
        setIsForgotPassword(false);
      } catch (err: any) {
        console.error("[LoginView] Forgot Password Error:", err);
        // Use exact error message from backend if available
        const errorMessage = err.message || "Failed to reset password. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (isRegister && !displayName.trim()) {
      toast.error("Please enter your display name.");
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        await onRegister(cleanEmail, password, displayName);
      } else {
        await onLogin(cleanEmail, password);
      }
    } catch (err: any) {
      console.error("[LoginView] Auth Error:", err);
      toast.error(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsForgotPassword(false);
    setIsRegister(!isRegister);
  };

  const showForgotMode = () => {
    setIsRegister(false);
    setIsForgotPassword(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden"
      >
        {/* Subtle decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack} 
            className="mb-6 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-2">
              {isForgotPassword ? <HelpCircle className="w-6 h-6" /> : <Target className="w-6 h-6" />}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {isForgotPassword ? "Reset Password" : (isRegister ? "Create Account" : "Welcome Back")}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              {isForgotPassword 
                ? "Enter your email and your new password below" 
                : (isRegister ? "Start your career roadmap today" : "Sign in to manage your career path")}
            </p>
            {isRegister && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-left">
                <div className="w-4 h-4 rounded-full bg-amber-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-black mt-0.5">!</div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold leading-relaxed">
                  IMPORTANT: Only real accounts from <strong>Gmail, Hotmail, and Outlook</strong> are allowed. All other email providers are blocked and fake accounts are purged daily.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(isRegister || isForgotPassword) && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                  {isForgotPassword ? "Full Name" : "Display Name"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder={isForgotPassword ? "Your Registered Full Name" : "Your Full Name"} 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                {isForgotPassword ? "Registered Email" : "Email"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                  {isForgotPassword ? "New Password" : "Password"}
                </label>
                {!isRegister && !isForgotPassword && (
                  <button
                    type="button"
                    onClick={showForgotMode}
                    className="text-[11px] font-bold text-primary hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 mt-4 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading 
                ? (isForgotPassword ? "Resetting..." : (isRegister ? "Creating..." : "Signing in..."))
                : (isForgotPassword ? "Reset Password" : (isRegister ? "Create Account" : "Sign In"))}
            </Button>

            <div className="text-center pt-4 space-y-2">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Back to Sign In
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  {isRegister ? "Already have an account? Sign In" : "Don't have an account? Create one"}
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
