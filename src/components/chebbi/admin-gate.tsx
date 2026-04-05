'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, LogOut, ShieldCheck, KeyRound, Check, X as XIcon } from 'lucide-react';
import { useAppStore, type View } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const DEFAULT_LOGO_URL = 'https://i.imgur.com/USEEiyC.png';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { language, setCurrentView } = useAppStore();
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, username: null, loading: true });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_URL);

  // Change password state
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changePwError, setChangePwError] = useState('');
  const [changePwSuccess, setChangePwSuccess] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Check session on mount
  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((res) => {
        if (res.authenticated) {
          setAuth({ isAuthenticated: true, username: res.username, loading: false });
        } else {
          setAuth({ isAuthenticated: false, username: null, loading: false });
        }
      })
      .catch(() => {
        setAuth({ isAuthenticated: false, username: null, loading: false });
      });

    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.data?.LOGO_URL) {
          setLogoUrl(res.data.LOGO_URL);
        }
      })
      .catch(() => { });
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) return;
    setLoggingIn(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuth({ isAuthenticated: true, username: data.username || username.trim(), loading: false });
        setPassword('');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoggingIn(false);
    }
  }, [username, password]);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setAuth({ isAuthenticated: false, username: null, loading: false });
  }, []);

  const handleBack = () => {
    setCurrentView('home' as View);
  };

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError('');
    setChangePwSuccess('');

    if (!currentPw || !newPw) return;

    if (newPw.length < 6) {
      setChangePwError(
        language === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'
          : language === 'en' ? 'New password must be at least 6 characters'
            : 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      );
      return;
    }

    if (newPw !== confirmPw) {
      setChangePwError(
        language === 'ar' ? 'كلمات المرور غير متطابقة'
          : language === 'en' ? 'Passwords do not match'
            : 'Les mots de passe ne correspondent pas'
      );
      return;
    }

    setChangingPw(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChangePwSuccess(
          language === 'ar' ? 'تم تغيير كلمة المرور بنجاح'
            : language === 'en' ? 'Password changed successfully'
              : 'Mot de passe modifié avec succès'
        );
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
        setTimeout(() => { setShowChangePw(false); setChangePwSuccess(''); }, 2000);
      } else {
        setChangePwError(data.error || 'Failed to change password');
      }
    } catch {
      setChangePwError('Connection error');
    } finally {
      setChangingPw(false);
    }
  }, [currentPw, newPw, confirmPw, language]);

  const openChangePw = () => {
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setChangePwError('');
    setChangePwSuccess('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowChangePw(true);
  };

  // Loading state
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">
          <Lock size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — show login form
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-5 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Back button */}
          <button
            onClick={handleBack}
            className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            ← {t('nav.home', language)}
          </button>

          <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="h-1 bg-gradient-to-r from-primary via-primary to-ct-green-light" />
            <div className="p-6 lg:p-8">
              {/* Logo */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary shadow-lg shadow-primary/20 bg-[#06090f] p-1">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain scale-[3]" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShieldCheck size={20} className="text-primary" />
                  <h1 className="text-xl font-extrabold text-foreground">Admin Dashboard</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'أدخل بيانات الدخول للوصول' : language === 'en' ? 'Enter credentials to access' : 'Entrez vos identifiants pour accéder'}
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-lg px-3 py-2 text-center">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="h-11"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loggingIn || !username.trim() || !password.trim()}
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                >
                  {loggingIn ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {language === 'ar' ? 'جاري الدخول...' : language === 'en' ? 'Logging in...' : 'Connexion...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock size={16} />
                      {language === 'ar' ? 'تسجيل الدخول' : language === 'en' ? 'Login' : 'Se connecter'}
                    </span>
                  )}
                </Button>
              </form>

              {/* Contact hint */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  🔒 {language === 'ar' ? 'الوصول مخصص للمسؤولين فقط' : language === 'en' ? 'Access restricted to administrators only' : 'Accès réservé aux administrateurs uniquement'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Authenticated — show dashboard with logout bar
  return (
    <div>
      {/* Admin bar */}
      <div className="bg-primary/10 border-b border-primary/20 px-5 py-2 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-primary" />
          <span className="text-xs font-semibold text-primary">Admin</span>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-transparent">
            {auth.username}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openChangePw}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-amber-400 transition-colors"
            title={language === 'ar' ? 'تغيير كلمة المرور' : language === 'en' ? 'Change Password' : 'Changer le mot de passe'}
          >
            <KeyRound size={14} />
            <span className="hidden sm:inline">
              {language === 'ar' ? 'كلمة المرور' : language === 'en' ? 'Password' : 'Mot de passe'}
            </span>
          </button>
          <span className="w-px h-4 bg-border" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
            {language === 'ar' ? 'تسجيل الخروج' : language === 'en' ? 'Logout' : 'Déconnexion'}
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-5"
            onClick={() => setShowChangePw(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-primary" />
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
                        <KeyRound size={16} className="text-amber-400" />
                      </div>
                      <h2 className="font-bold text-foreground">
                        {language === 'ar' ? 'تغيير كلمة المرور' : language === 'en' ? 'Change Password' : 'Changer le mot de passe'}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowChangePw(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <XIcon size={18} />
                    </button>
                  </div>

                  {/* Error / Success Messages */}
                  <AnimatePresence>
                    {changePwError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-lg px-3 py-2 text-center">
                          {changePwError}
                        </div>
                      </motion.div>
                    )}
                    {changePwSuccess && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                        <div className="bg-ct-green/10 border border-ct-green/20 text-ct-green text-sm font-medium rounded-lg px-3 py-2 text-center flex items-center justify-center gap-2">
                          <Check size={14} />
                          {changePwSuccess}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                        {language === 'ar' ? 'كلمة المرور الحالية' : language === 'en' ? 'Current Password' : 'Mot de passe actuel'}
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPw ? 'text' : 'password'}
                          value={currentPw}
                          onChange={(e) => setCurrentPw(e.target.value)}
                          placeholder="••••••••"
                          className="h-10 pr-10"
                          autoFocus
                        />
                        <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                        {language === 'ar' ? 'كلمة المرور الجديدة' : language === 'en' ? 'New Password' : 'Nouveau mot de passe'}
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPw ? 'text' : 'password'}
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          placeholder="••••••••"
                          className="h-10 pr-10"
                        />
                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                        {language === 'ar' ? 'تأكيد كلمة المرور' : language === 'en' ? 'Confirm Password' : 'Confirmer le mot de passe'}
                      </label>
                      <Input
                        type="password"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        placeholder="••••••••"
                        className="h-10"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={changingPw || !currentPw || !newPw || !confirmPw}
                      className="w-full h-10 bg-amber-500 text-white hover:bg-amber-600 font-bold"
                    >
                      {changingPw ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {language === 'ar' ? 'جاري التغيير...' : language === 'en' ? 'Changing...' : 'Modification...'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <KeyRound size={14} />
                          {language === 'ar' ? 'تغيير كلمة المرور' : language === 'en' ? 'Change Password' : 'Changer le mot de passe'}
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}
