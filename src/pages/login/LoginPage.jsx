import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../../components/common/buttons/PrimaryButton';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const MASTER = import.meta.env.VITE_HR_MASTER || 'password';

  // Show one-time hint
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = 'hr_login_hint_shown';
      if (!sessionStorage.getItem(key)) {
        alert('Login password is "password"');
        sessionStorage.setItem(key, '1');
      }
    }
  }, []);

  const submit = (e) => {
    e?.preventDefault();
    setError('');
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    try {
      if (password.trim() !== MASTER) {
        setError('Invalid master password');
        return;
      }
      localStorage.setItem('hr_session', JSON.stringify({ ok: true, at: Date.now() }));
      navigate('/jobs', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-items-center min-h-screen bg-gray-50 px-4">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg max-w-4xl w-full p-6 md:p-8 border">

        {/* Left feature panel */}
        <div className="flex-1 px-4 md:mr-5 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold pb-4">Welcome to TalentFlow</h2>
          <p className="text-gray-500">Manage your hiring process efficiently in one place.</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✔</span> Manage Jobs
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✔</span> Track Candidates
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✔</span> Run Assessments
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✔</span> Archive & Analytics
            </div>
          </div>
        </div>

        {/* Right login panel */}
        <div className="flex-1 p-6 md:p-10 mt-6 md:mt-0 border rounded-lg shadow-md bg-gray-50 flex flex-col items-center">
          <form className="w-full" onSubmit={submit}>
            <label className="block text-sm text-gray-500 mb-1.5">Master Password</label>
            <input
              type="password"
              placeholder="Enter master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {error && (
              <div className="text-red-700 text-xs bg-red-100 px-2 py-1 rounded mb-2">{error}</div>
            )}
            <PrimaryButton
              size="big"
              onClick={submit}  // directly calls your submit function
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </PrimaryButton>

          </form>
        </div>
      </div>
    </div>
  );
}
