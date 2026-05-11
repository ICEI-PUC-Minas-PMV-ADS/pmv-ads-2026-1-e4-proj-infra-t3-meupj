'use client';

import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { z } from 'zod';
import { Input, Button, Alert, Divider } from '@/components/ui';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
});

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errs[issue.path[0] as string] = issue.message;
      });
      setFieldErrors(errs);
      return;
    }

    try {
      setLoading(true);
      await login(result.data);
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  return (
    <div className="flex w-full flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Entrar
        </h1>
        <p className="text-sm leading-6 text-gray-500">
          Acesse sua conta para continuar gerenciando seus clientes, pedidos e serviços.
        </p>
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
                onClick={() => setShowPassword((value) => !value)}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
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
              className="text-sm font-medium text-indigo-600 transition-all hover:text-indigo-700 hover:underline"
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
            className="font-semibold text-indigo-600 transition-all hover:text-indigo-700 hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}