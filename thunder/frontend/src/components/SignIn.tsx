import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabaseClient';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const errors = { email: '', password: '' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      errors.email = 'Invalid email address.';
    }

    if (password && password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setValidationErrors(errors);
  }, [email, password]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setError('');
    setLoading(true);

    if (!supabase) {
      setError('Supabase is not initialized.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });


    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {validationErrors.email && <p style={{ color: 'red' }}>{validationErrors.email}</p>}
        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {validationErrors.password && <p style={{ color: 'red' }}>{validationErrors.password}</p>}
        <button
          type="submit"
          disabled={
            loading ||
            !email ||
            !password ||
            !!validationErrors.email ||
            !!validationErrors.password
          }
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>

      </form>
      {error && <p>{error}</p>}
    </div>
  );
}
