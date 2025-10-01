import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'ready' | 'updating' | 'success' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // After clicking the email link, Supabase sets a session in the browser.
    // We just verify a session exists so we can call updateUser.
    const check = async () => {
      setStatus('checking');
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setStatus('ready');
      } else {
        setError('Ungültiger oder abgelaufener Link. Bitte fordere die Zurücksetzung erneut an.');
        setStatus('error');
      }
    };
    void check();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    if (password !== confirm) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }

    setStatus('updating');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setStatus('error');
      return;
    }
    setStatus('success');
  };

  if (status === 'checking') {
    return <div style={{ padding: 24 }}>Bitte warten, Link wird geprüft…</div>;
  }

  if (status === 'success') {
    return (
      <div style={{ padding: 24 }}>
        <h2>Passwort aktualisiert</h2>
        <p>Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt anmelden.</p>
        <a href="/auth/login">Zum Login</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: '40px auto' }}>
      <h2>Passwort zurücksetzen</h2>
      <p>Bitte gib dein neues Passwort ein.</p>
      {error && (
        <div style={{ background: '#fee', border: '1px solid #f99', padding: 12, marginBottom: 12 }}>{error}</div>
      )}
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Neues Passwort</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            autoComplete="new-password"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="confirm">Neues Passwort bestätigen</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" disabled={status === 'updating'} style={{ padding: '8px 16px' }}>
          {status === 'updating' ? 'Wird aktualisiert…' : 'Passwort setzen'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
