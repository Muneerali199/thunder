import { useState, useEffect } from 'react';

import { supabase } from '../lib/supabaseClient';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
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

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!supabase) {
      setError('Supabase is not initialized.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });


    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for the verification link.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
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
          {loading ? 'Loading...' : 'Sign Up'}
        </button>

      </form>
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}
    </div>
  );
}
