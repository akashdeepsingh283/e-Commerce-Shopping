import { useState } from 'react';
import { X, Mail, Lock, UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { setAuth } = useAuth(); // context for auth state
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = `${API_BASE}/api/auth/${mode}`;
      const body =
        mode === 'signup'
          ? { name: formData.name, email: formData.email, password: formData.password }
          : { email: formData.email, password: formData.password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Auth failed');

      if (json.token && json.user) {
        setAuth(json.user, json.token); // store in context & localStorage
        setSuccess(mode === 'login' ? 'Login successful!' : 'Account created & logged in!');
        setTimeout(() => {
          onClose();
          setFormData({ email: '', password: '', name: '' });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 animate-fade-in">
        <div className="bg-zinc-950 border border-zinc-800 p-8 m-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-light tracking-widest text-white">
              {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
            </h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-3 mb-6 text-sm">{error}</div>}
          {success && <div className="bg-green-900/20 border border-green-900 text-green-400 px-4 py-3 mb-6 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div>
                <label className="block text-zinc-400 text-sm mb-2 tracking-wider">FULL NAME</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-zinc-800 pl-12 pr-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                    placeholder="Your Name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-zinc-400 text-sm mb-2 tracking-wider">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border border-zinc-800 pl-12 pr-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2 tracking-wider">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full bg-black border border-zinc-800 pl-12 pr-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'PROCESSING...' : mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setSuccess('');
              }}
              className="text-zinc-400 hover:text-white transition-colors text-sm tracking-wide"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
