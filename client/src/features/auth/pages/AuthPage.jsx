import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../app/providers.jsx';
import { loginSchema, registerSchema } from '../auth.validation.js';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  if (loading)
    return <main className="auth-loading">Preparing your space…</main>;
  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(values) {
    const result = (isRegister ? registerSchema : loginSchema).safeParse(
      values,
    );
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        setError(issue.path[0], { message: issue.message });
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) await signUp(result.data);
      else await signIn(result.data);
      toast.success(isRegister ? 'Your LifeLedger is ready.' : 'Welcome back.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
          'We could not complete that request.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="brand-mark">L</span> lifeledger
        </Link>
        <span className="section-kicker">A HOME FOR WHAT YOU OWN</span>
        <h1>
          {isRegister ? 'Begin keeping' : 'Welcome'}
          <br />
          <em>
            {isRegister
              ? 'the things that matter.'
              : 'your things, thoughtfully.'}
          </em>
        </h1>
        <p className="auth-intro">
          {isRegister
            ? 'Create a private space for the details you do not want to lose.'
            : 'Sign in to return to your personal collection.'}
        </p>
        <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
          {isRegister && (
            <label>
              Your name
              <input
                autoComplete="name"
                {...register('name')}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <small>{errors.name.message}</small>}
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              {...register('email')}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <small>{errors.email.message}</small>}
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              {...register('password')}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <small>{errors.password.message}</small>}
            {isRegister && (
              <small className="field-hint">At least 10 characters.</small>
            )}
          </label>
          <button className="primary-button auth-submit" disabled={submitting}>
            {submitting
              ? 'One moment…'
              : isRegister
                ? 'Create your account'
                : 'Sign in'}{' '}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New to LifeLedger?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
        <p className="auth-privacy">
          Your collection belongs to you. We keep it private.
        </p>
      </section>
    </main>
  );
}
