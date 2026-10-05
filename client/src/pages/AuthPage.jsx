import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import OTPInput from '../components/OTPInput';
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const AuthPage = () => {
  const { sendOtp, verifyOtp, loginWithGoogle } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer = null;
    if (step === 2 && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(email.trim());
      toast.success(res.message || 'OTP sent! Please check your email.');

      setStep(2);
      setResendCountdown(60);
      setCanResend(false);
      setOtp('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify) => {
    const finalOtp = codeToVerify || otp;
    if (!finalOtp || finalOtp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(email.trim(), finalOtp);
      toast.success('Successfully authenticated! Welcome to TaskFlow.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Verification failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await loginWithGoogle({ idToken: credentialResponse.credential });
      toast.success('Successfully authenticated with Google!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDemoSignIn = async () => {
    try {
      setLoading(true);
      await loginWithGoogle({
        demoUser: {
          email: 'alex.rivera@taskflow.dev',
          name: 'Alex Rivera',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
      });
      toast.success('Signed in with Google profile!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Split Card Container */}
      <div className="w-full max-w-5xl rounded-3xl border border-[#E5EAE6] bg-white shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Side: TaskFlow Forest Showcase */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-gradient-to-br from-[#143F2A] via-[#194D33] to-[#1E5C3E] text-white">
          <div>
            {/* TaskFlow Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight">TaskFlow</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4">
              Plan, prioritize, and accomplish your tasks with ease.
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-8">
              Experience modern project collaboration with verified email OTP, Google OAuth 2.0, and interactive Kanban boards.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3.5">
              {[
                { title: 'Secure Passwordless OTP', desc: 'Encrypted with bcrypt and sent via Gmail OAuth2' },
                { title: 'Interactive Kanban & List Views', desc: 'Drag-and-drop workflow with live productivity stats' },
                { title: 'Google OAuth 2.0 Integration', desc: 'One-click sign-in with full profile synchronization' },
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-lg bg-white/15 text-emerald-200 border border-white/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{feat.title}</h4>
                    <p className="text-[11px] sm:text-xs text-emerald-100/80">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-white/15 flex items-center justify-between text-xs text-emerald-200/90">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              End-to-end encrypted session
            </span>
            <span>REST API + MongoDB</span>
          </div>
        </div>

        {/* Right Side: Clean White Auth Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            {step === 1 ? (
              /* STEP 1: Email Input */
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to TaskFlow</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter your email to receive a 6-digit one-time password (OTP).
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Work or Personal Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        autoFocus
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#194D33] focus:bg-white focus:ring-2 focus:ring-[#194D33]/15"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#194D33] hover:bg-[#143F2A] text-white font-bold text-sm shadow-md shadow-[#194D33]/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <span>Send 6-Digit Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                      OR Continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign-In */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-full flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google Sign-In failed or popup was closed.')}
                      theme="outline"
                      shape="pill"
                      size="large"
                      width="100%"
                      text="continue_with"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleDemoSignIn}
                    disabled={loading}
                    className="text-xs text-slate-500 hover:text-[#194D33] transition-colors cursor-pointer py-1"
                  >
                    Test with Demo Profile (No Google popup needed)
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: 6-Box OTP Input */
              <div className="animate-fade-in space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF4EE] text-[#194D33] border border-[#D2E7DC]">
                      Step 2 of 2
                    </span>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      (Change email)
                    </button>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enter Verification Code</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    We sent a 6-digit code to <strong className="text-slate-800">{email}</strong>.
                  </p>
                </div>

                {/* Guidance note */}
                <div className="p-3.5 rounded-xl bg-[#EAF4EE]/70 border border-[#D2E7DC] flex items-start gap-2.5 text-xs text-[#194D33]">
                  <Mail className="w-4 h-4 text-[#194D33] mt-0.5 shrink-0" />
                  <p>
                    Please check your <strong>inbox</strong> or <strong>spam/junk folder</strong> for the 6-digit code.
                  </p>
                </div>

                {/* 6-box OTP input */}
                <div className="py-2">
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                    onComplete={(code) => handleVerifyOtp(code)}
                  />
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#194D33] hover:bg-[#143F2A] text-white font-bold text-sm shadow-md shadow-[#194D33]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                {/* Resend OTP countdown */}
                <div className="text-center text-xs text-slate-400 pt-2">
                  {canResend ? (
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 text-[#194D33] hover:underline font-bold cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Resend Verification Code
                    </button>
                  ) : (
                    <span>
                      Resend code in <strong className="text-slate-600">{resendCountdown}s</strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
