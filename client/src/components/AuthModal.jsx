import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import OTPInput from './OTPInput';
import { X, Mail, ArrowRight, ShieldCheck, RotateCcw, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const AuthModal = ({ isOpen, onClose, onSuccess, title = 'Sign In to TaskFlow', subtitle = 'Please sign in or create an account to create and manage tasks.' }) => {
  const { sendOtp, verifyOtp, loginWithGoogle } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmail('');
      setOtp('');
      setLoading(false);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

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
      toast.success(res.message || 'Verification code sent to your email.');

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
      toast.error('Please enter the 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(email.trim(), finalOtp);
      toast.success('Signed in successfully!');
      onClose();
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid verification code.';
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
      onClose();
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed.');
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
      toast.success('Signed in with Demo profile!');
      onClose();
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Demo sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-white border border-[#E5EAE6] shadow-2xl overflow-hidden p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF4EE] border border-[#D1E7DD] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#194D33]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {step === 1 ? (
          /* STEP 1: Email Form */
          <div className="space-y-4">
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#194D33] focus:bg-white focus:ring-2 focus:ring-[#194D33]/15"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#194D33] hover:bg-[#143F2A] text-white font-bold text-sm shadow-md shadow-[#194D33]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending code...' : 'Send 6-Digit Code'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* Google Sign-In */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Sign-In was cancelled.')}
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
                className="text-xs text-slate-500 hover:text-[#194D33] font-medium transition-colors cursor-pointer py-1"
              >
                Quick Demo Sign-In (Skip OAuth popup)
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: 6-Box OTP Input */
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">
                Enter the 6-digit code sent to:
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF4EE] text-[#194D33] font-bold text-xs">
                <span>{email}</span>
                <button
                  onClick={() => setStep(1)}
                  className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer ml-1"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="py-1">
              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
                onComplete={(code) => handleVerifyOtp(code)}
              />
            </div>

            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#194D33] hover:bg-[#143F2A] text-white font-bold text-sm shadow-md shadow-[#194D33]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div className="text-center text-xs text-slate-400">
              {canResend ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-[#194D33] hover:underline font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Resend Code
                </button>
              ) : (
                <span>Resend in {resendCountdown}s</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
