'use client';

import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { z } from 'zod';
import { Input, Button, Alert, Divider } from '@/components/ui';

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setFieldErrors({});

      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const errs: Record<string, string> = {};
        result.error.issues.forEach((i) => {
          if (i.path[0]) errs[i.path[0] as string] = i.message;
        });
        setFieldErrors(errs);
        return;
      }

      try {
        setLoading(true);
        await login(result.data);
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : 'E-mail ou senha incorretos. Tente novamente.',
        );
      } finally {
        setLoading(false);
      }
    },
    [email, login, password],
  );

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Entrar</h1>
        <p className="mt-2 text-gray-500">Acesse sua conta para continuar</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          error={fieldErrors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          inputSize="lg"
          autoComplete="email"
          disabled={loading}
        />

        <div className="flex flex-col gap-1.5">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={fieldErrors.password}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            inputSize="lg"
            autoComplete="current-password"
            disabled={loading}
          />
          <div className="flex justify-end">
            <Link
              href="/recuperacao-senha"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          fullWidth
          className="mt-2 rounded-xl shadow-md shadow-indigo-600/20"
        >
          Entrar
        </Button>

        <Divider label="ou" className="my-1" />

        <p className="text-center text-sm text-gray-600">
          Não tem conta?{' '}
          <Link
            href="/cadastro"
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
          >
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
