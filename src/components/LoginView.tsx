import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  ArrowLeft, 
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mongoApi, MongoUser } from '../lib/mongoApi';

type AuthMode = 'login' | 'register' | 'register_otp' | 'forgot_email' | 'forgot_otp' | 'admin_otp';

interface LoginViewProps {
  onLogin: (email: string, password: string, adminOtp?: string) => Promise<any>;
  onRegister: (email: string, password: string, displayName: string) => Promise<any>;
  onResetPassword: (email: string, password: string, displayName: string) => Promise<any>;
  onAuthSuccess?: (user: MongoUser) => Promise<void>;
  onBack: () => void;
  guestUid?: string;
}

export function LoginView({ onLogin, onRegister, onResetPassword, onAuthSuccess, onBack, guestUid }: LoginViewProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Resend cooldown timer (30 seconds)
  const [resendCooldown, setResendCooldown] = useState(0);
  // OTP expiry countdown (10 minutes = 600 seconds)
  const [otpExpiry, setOtpExpiry] = useState(600);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  useEffect(() => {
    let interval: any = null;
    if ((mode === 'register_otp' || mode === 'forgot_otp' || mode === 'admin_otp') && otpExpiry > 0) {
      interval = setInterval(() => {
        setOtpExpiry((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, otpExpiry]);

  // Auto focus OTP input when entering OTP screens
  useEffect(() => {
    if (mode === 'register_otp' || mode === 'forgot_otp' || mode === 'admin_otp') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 200);
    }
  }, [mode]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await onLogin(cleanEmail, password);
      if (res && res.requiresAdminOtp) {
        setMode('admin_otp');
        setOtp('');
        setResendCooldown(30);
        setOtpExpiry(600);
        toast.info(res.message || "Admin 2FA Security Code sent to your email!");
        return;
      }
    } catch (err: any) {
      console.error("[LoginView] Login error:", err);
      toast.error(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // 1b. Submit Admin 2FA OTP
  const handleAdminVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      toast.error("Please enter the 6-digit Admin security code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await onLogin(email.trim(), password, cleanOtp);
      toast.success("Admin identity verified! Welcome, Kamaljit.");
      if (res?.user && onAuthSuccess) {
        await onAuthSuccess(res.user);
      }
    } catch (err: any) {
      console.error("[LoginView] Admin OTP verification error:", err);
      toast.error(err.message || "Invalid or expired admin verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Register Step 1 (Send OTP)
  const handleRegisterSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      toast.error("Please provide email and password.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await mongoApi.sendRegisterOtp(cleanEmail, password, "User");
      toast.success(res.message || "Verification code sent to your email!");
      setMode('register_otp');
      setOtp('');
      setResendCooldown(30);
      setOtpExpiry(600);
    } catch (err: any) {
      console.error("[LoginView] Register OTP error:", err);
      toast.error(err.message || "Failed to send verification code. Please check your email.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Submit Register Step 2 (Verify OTP)
  const handleRegisterVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await mongoApi.verifyRegisterOtp(email.trim().toLowerCase(), cleanOtp, guestUid);
      toast.success("Email verified! Welcome to Career Navigation AI.");
      if (onAuthSuccess) {
        await onAuthSuccess(res.user);
      } else {
        await onLogin(email.trim(), password);
      }
    } catch (err: any) {
      console.error("[LoginView] Verify OTP error:", err);
      toast.error(err.message || "Verification failed. Please check the code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Submit Forgot Password Step 1 (Send Reset OTP)
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await mongoApi.sendResetOtp(cleanEmail);
      toast.success(res.message || "Reset code sent to your email!");
      setMode('forgot_otp');
      setOtp('');
      setPassword('');
      setConfirmPassword('');
      setResendCooldown(30);
      setOtpExpiry(600);
    } catch (err: any) {
      console.error("[LoginView] Forgot OTP error:", err);
      toast.error(err.message || "No account found or failed to send reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Submit Forgot Password Step 2 (Verify OTP & Set New Password)
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      toast.error("Please enter the 6-digit reset code.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await mongoApi.verifyResetOtp(email.trim().toLowerCase(), cleanOtp, password);
      toast.success(res.message || "Password updated successfully!");
      if (res.user && onAuthSuccess) {
        await onAuthSuccess(res.user);
      } else {
        setMode('login');
      }
    } catch (err: any) {
      console.error("[LoginView] Verify reset error:", err);
      toast.error(err.message || "Failed to reset password. Please check the code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP helper
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      if (mode === 'register_otp') {
        const res = await mongoApi.sendRegisterOtp(email.trim().toLowerCase(), password, "User");
        toast.success(res.message || "New verification code sent!");
      } else if (mode === 'forgot_otp') {
        const res = await mongoApi.sendResetOtp(email.trim().toLowerCase());
        toast.success(res.message || "New reset code sent!");
      } else if (mode === 'admin_otp') {
        const res = await mongoApi.login(email.trim(), password, guestUid);
        toast.success(res.message || "New Admin 2FA security code sent!");
      }
      setResendCooldown(30);
      setOtpExpiry(600);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (mode === 'register_otp') setMode('register');
              else if (mode === 'forgot_otp') setMode('forgot_email');
              else if (mode === 'forgot_email') setMode('login');
              else if (mode === 'admin_otp') setMode('login');
              else onBack();
            }} 
            className="mb-4 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {mode === 'register_otp' ? "Edit Details" : (mode === 'forgot_otp' ? "Change Email" : (mode === 'admin_otp' ? "Back to Login" : "Back"))}
          </Button>

          {/* Header Title & Subtitles based on Mode */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-1">
              {mode === 'login' && <Target className="w-6 h-6" />}
              {mode === 'register' && <User className="w-6 h-6" />}
              {mode === 'register_otp' && <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
              {mode === 'admin_otp' && <ShieldCheck className="w-6 h-6 text-red-500 animate-pulse" />}
              {mode === 'forgot_email' && <HelpCircle className="w-6 h-6" />}
              {mode === 'forgot_otp' && <KeyRound className="w-6 h-6 text-amber-500" />}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {mode === 'login' && "Welcome Back"}
              {mode === 'register' && "Create Account"}
              {mode === 'register_otp' && "Verify Your Email"}
              {mode === 'admin_otp' && "Admin 2FA Security"}
              {mode === 'forgot_email' && "Reset Password"}
              {mode === 'forgot_otp' && "Enter Reset Code"}
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium">
              {mode === 'login' && "Sign in to manage your career roadmap & ATS analytics"}
              {mode === 'register' && "Start your personalized career flight path today"}
              {mode === 'register_otp' && (
                <span>
                  We sent a 6-digit OTP code to <strong className="text-foreground">{email}</strong>
                </span>
              )}
              {mode === 'admin_otp' && (
                <span>
                  High-security Admin 2FA code sent to <strong className="text-foreground">{email}</strong>. Check your phone / email notification.
                </span>
              )}
              {mode === 'forgot_email' && "Enter your registered email to receive an OTP code"}
              {mode === 'forgot_otp' && (
                <span>
                  Enter the 6-digit OTP code sent to <strong className="text-foreground">{email}</strong>
                </span>
              )}
            </p>

            {/* Allowed Domain Notice in Register */}
            {mode === 'register' && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-left">
                <div className="w-4 h-4 rounded-full bg-amber-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-black mt-0.5">!</div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
                  Only authentic accounts from <strong>Gmail, Hotmail, and Outlook</strong> are supported. A 6-digit OTP code will be sent to verify your address.
                </p>
              </div>
            )}
          </div>

          {/* Form Content based on Mode */}
          <AnimatePresence mode="wait">
            {/* 1. SIGN IN MODE */}
            {mode === 'login' && (
              <motion.form 
                key="mode_login"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLoginSubmit} 
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot_email')}
                      className="text-[11px] font-bold text-primary hover:underline focus:outline-none cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 mt-2 transition-all active:scale-[0.98] cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setOtp('');
                    }}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    Don't have an account? Create one
                  </button>
                </div>
              </motion.form>
            )}

            {/* 2. REGISTER MODE (Step 1) */}
            {mode === 'register' && (
              <motion.form 
                key="mode_register"
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegisterSendOtp} 
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      placeholder="name@gmail.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="At least 6 characters" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 mt-2 transition-all active:scale-[0.98] cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP Code..." : "Continue & Send OTP Code"}
                </Button>

                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </motion.form>
            )}

            {/* 3. REGISTER OTP VERIFICATION MODE (Step 2) */}
            {mode === 'register_otp' && (
              <motion.form 
                key="mode_register_otp"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleRegisterVerifyOtp} 
                className="space-y-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                    <span className="uppercase tracking-wider">6-Digit Code</span>
                    <span className="flex items-center gap-1 text-primary">
                      <Clock className="w-3.5 h-3.5" />
                      {formatSeconds(otpExpiry)}
                    </span>
                  </div>

                  <input 
                    ref={otpInputRef}
                    type="text" 
                    maxLength={6}
                    placeholder="123456" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-14 text-center tracking-[12px] font-mono font-black text-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-primary/40 focus:border-primary rounded-2xl focus:outline-none transition-all text-zinc-900 dark:text-zinc-100"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 text-center">
                    Check your inbox or spam folder for an email from <strong>kamaljit444501@gmail.com</strong>
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
                  disabled={isLoading || otp.length < 6}
                >
                  {isLoading ? "Verifying OTP..." : "Verify & Create Account"}
                </Button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-semibold cursor-pointer"
                  >
                    Edit Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-primary font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>
              </motion.form>
            )}

            {/* 3b. ADMIN 2FA OTP VERIFICATION MODE */}
            {mode === 'admin_otp' && (
              <motion.form 
                key="mode_admin_otp"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleAdminVerifyOtp} 
                className="space-y-5"
              >
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-left">
                  <ShieldCheck className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-700 dark:text-red-400 font-semibold leading-relaxed">
                    <strong>Founder / Admin Authorization:</strong> A 6-digit two-factor verification code was dispatched to your inbox. Please enter it below to confirm identity.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                    <span className="uppercase tracking-wider">Admin Passkey</span>
                    <span className="flex items-center gap-1 text-red-500 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {formatSeconds(otpExpiry)}
                    </span>
                  </div>

                  <input 
                    ref={otpInputRef}
                    type="text" 
                    maxLength={6}
                    placeholder="123456" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-14 text-center tracking-[12px] font-mono font-black text-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-red-500/40 focus:border-red-500 rounded-2xl focus:outline-none transition-all text-zinc-900 dark:text-zinc-100"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 text-center">
                    Sent via secure mail to <strong>{email}</strong>
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] cursor-pointer"
                  disabled={isLoading || otp.length < 6}
                >
                  {isLoading ? "Verifying Admin 2FA..." : "Verify & Enter Admin Console"}
                </Button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-semibold cursor-pointer"
                  >
                    Back to Login
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-red-500 font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend passkey in ${resendCooldown}s` : "Resend Passkey"}
                  </button>
                </div>
              </motion.form>
            )}

            {/* 4. FORGOT PASSWORD MODE (Step 1 - Send OTP) */}
            {mode === 'forgot_email' && (
              <motion.form 
                key="mode_forgot_email"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleForgotSendOtp} 
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal pt-1">
                    We will send a 6-digit one-time password (OTP) to your email to verify your ownership.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 mt-2 transition-all active:scale-[0.98] cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP Code..." : "Send Reset Code"}
                </Button>

                <div className="text-center pt-3">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </motion.form>
            )}

            {/* 5. FORGOT PASSWORD OTP & NEW PASSWORD (Step 2) */}
            {mode === 'forgot_otp' && (
              <motion.form 
                key="mode_forgot_otp"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleForgotVerifyOtp} 
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                    <span className="uppercase tracking-wider">6-Digit Code</span>
                    <span className="flex items-center gap-1 text-primary">
                      <Clock className="w-3.5 h-3.5" />
                      {formatSeconds(otpExpiry)}
                    </span>
                  </div>

                  <input 
                    ref={otpInputRef}
                    type="text" 
                    maxLength={6}
                    placeholder="123456" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-12 text-center tracking-[10px] font-mono font-black text-xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-primary/40 focus:border-primary rounded-xl focus:outline-none transition-all text-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="At least 6 characters" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Re-type new password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
                  disabled={isLoading || otp.length < 6 || !password}
                >
                  {isLoading ? "Resetting Password..." : "Update Password & Sign In"}
                </Button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('forgot_email')}
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-semibold cursor-pointer"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-primary font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
