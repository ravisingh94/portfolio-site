'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { ArrowLeft, Loader2, LogIn, UserPlus, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, XCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginPageContent() {
    const { signIn, signUp, confirmSignUp, forgotPassword, resetPassword, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect') || '/';
    const customMessage = searchParams.get('message');

    const [view, setView] = useState<'signin' | 'signup' | 'verify' | 'forgot' | 'reset'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // visual check only for now
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const passwordRequirements = {
        length: password.length >= 8,
        number: /[0-9]/.test(password),
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

    React.useEffect(() => {
        if (isAuthenticated) {
            router.push(redirectPath);
        }
    }, [isAuthenticated, router, redirectPath]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await signIn(email, password);
            // router.push('/') handled by useEffect
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
            setIsSubmitting(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            await signUp(email, password);
            setSuccessMessage("Account created! Please check your email for the verification code.");
            setView('verify');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await confirmSignUp(email, verificationCode);
            setSuccessMessage("Account verified! Please sign in.");
            setView('signin');
            // Optionally auto-login here if desired, but explicit sign-in is safer pattern
        } catch (err: any) {
            setError(err.message || 'Failed to verify');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await forgotPassword(email);
            setSuccessMessage("Reset code sent to your email.");
            setView('reset');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset code');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            await resetPassword(email, verificationCode, password);
            setSuccessMessage("Password reset successful! Please sign in.");
            setView('signin');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors mb-6 group">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {view === 'signin' ? 'Welcome Back' :
                            view === 'signup' ? 'Create Account' :
                                view === 'forgot' ? 'Forgot Password' :
                                    view === 'reset' ? 'Reset Password' : 'Verify Email'}
                    </h1>
                    <p className="text-slate-400">
                        {customMessage || (view === 'signin' ? 'Sign in to access your dashboard and tools.' :
                            view === 'signup' ? 'Join us to start optimizing your testing workflow.' :
                                view === 'forgot' ? 'Enter your email to receive a password reset code.' :
                                    view === 'reset' ? 'Enter the code and your new password.' :
                                        'Enter the code sent to your email address.')}
                    </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl space-y-6">

                    {error && (
                        <div className="bg-red-950/20 border border-red-900/30 text-red-300 px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {view === 'signin' && (
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium text-slate-300">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => { setView('forgot'); setError(null); setSuccessMessage(null); }}
                                        className="text-xs text-cyan-400 hover:text-cyan-300"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                                <span>Sign In</span>
                            </button>
                        </form>
                    )}

                    {view === 'signup' && (
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                                    <div className={`flex items-center gap-1.5 text-[10px] md:text-xs transition-colors ${passwordRequirements.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.length ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        <span>8+ characters</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] md:text-xs transition-colors ${passwordRequirements.number ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.number ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        <span>Any number</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] md:text-xs transition-colors ${passwordRequirements.uppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.uppercase ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        <span>UPPERCASE</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] md:text-xs transition-colors ${passwordRequirements.lowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.lowercase ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        <span>lowercase</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] md:text-xs transition-colors ${passwordRequirements.special ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {passwordRequirements.special ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                        <span>Special char</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !isPasswordValid}
                                className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                                <span>Create Account</span>
                            </button>
                        </form>
                    )}

                    {view === 'verify' && (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Verification Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-center text-2xl tracking-widest text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-700 font-mono"
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={e => setVerificationCode(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 text-center">Enter the code sent to {email}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                <span>Verify Email</span>
                            </button>

                            <button type="button" onClick={() => setView('signin')} className="w-full text-sm text-slate-400 hover:text-white transition-colors">
                                Cancel
                            </button>
                        </form>
                    )}

                    {view === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                                <span>Send Reset Code</span>
                            </button>
                            <button type="button" onClick={() => setView('signin')} className="w-full text-sm text-slate-400 hover:text-white transition-colors">
                                Cancel
                            </button>
                        </form>
                    )}

                    {view === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Verification Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-center text-2xl tracking-widest text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-700 font-mono"
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={e => setVerificationCode(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                                {/* Password Requirement UI can be added here too if needed */}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !isPasswordValid}
                                className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                                <span>Reset Password</span>
                            </button>
                            <button type="button" onClick={() => setView('forgot')} className="w-full text-sm text-slate-400 hover:text-white transition-colors">
                                Back
                            </button>
                        </form>
                    )}

                    {view !== 'verify' && view !== 'forgot' && view !== 'reset' && (
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-900 text-slate-400">
                                    {view === 'signin' ? "don't have any account, sign up?" : 'Already have an account?'}
                                </span>
                            </div>
                        </div>
                    )}

                    {view === 'signin' && (
                        <button
                            onClick={() => { setView('signup'); setError(null); setSuccessMessage(null); }}
                            className="w-full flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-medium py-3 px-6 rounded-xl transition-all"
                        >
                            <UserPlus className="h-5 w-5 text-slate-400" />
                            <span>Create an Account</span>
                        </button>
                    )}

                    {view === 'signup' && (
                        <button
                            onClick={() => { setView('signin'); setError(null); setSuccessMessage(null); }}
                            className="w-full flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-medium py-3 px-6 rounded-xl transition-all"
                        >
                            <LogIn className="h-5 w-5 text-slate-400" />
                            <span>Sign In</span>
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}
