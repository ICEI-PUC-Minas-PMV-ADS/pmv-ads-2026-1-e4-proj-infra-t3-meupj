'use client';

import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { z } from 'zod';
import { Input, Button, Alert, Divider } from '@/components/ui';

// ─── Schema ───────────────────────────────────────────────────────────────────

const cadastroSchema = z
  .object({
    name: z.string().min(2, 'Informe seu nome completo'),
    email: z.string().email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Za-z]/, 'A senha deve conter letras')
      .regex(/[0-9]/, 'A senha deve conter números'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    terms: z.literal(true, { message: 'Aceite os termos para continuar' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type Fields = z.infer<typeof cadastroSchema>;
type FieldErrors = Partial<Record<keyof Fields, string>>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CadastroPage() {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Calcula força da senha
  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Fraca', 'Regular', 'Boa', 'Forte'][passwordStrength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'][
    passwordStrength
  ];

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setFieldErrors({});

      const result = cadastroSchema.safeParse({ name, email, password, confirmPassword, terms });
      if (!result.success) {
        const errs: FieldErrors = {};
        result.error.issues.forEach((i) => {
          if (i.path[0]) errs[i.path[0] as keyof Fields] = i.message;
        });
        setFieldErrors(errs);
        return;
      }

      try {
        setLoading(true);
        await register({
          name: result.data.name,
          email: result.data.email,
          password: result.data.password,
        });
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Falha ao criar conta. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    [confirmPassword, email, name, password, register, terms],
  );

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Criar conta</h1>
        <p className="mt-2 text-gray-500">É rápido e gratuito</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            label="Nome completo"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João da Silva"
            error={fieldErrors.name}
            leftIcon={<User className="h-4 w-4" />}
            inputSize="lg"
            autoComplete="name"
            disabled={loading}
          />
        </div>

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

        <div className="flex flex-col gap-2">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={fieldErrors.password}
            hint={
              !fieldErrors.password
                ? 'Use letras, números e símbolos para uma senha forte'
                : undefined
            }
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
            autoComplete="new-password"
            disabled={loading}
          />

          {/* Barra de força da senha */}
          {password.length > 0 && (
            <div className="flex items-center gap-2 px-0.5">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength >= level ? strengthColor : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-500 w-12 text-right">
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        {/* Confirmar senha */}
        <Input
          label="Confirmar senha"
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          error={fieldErrors.confirmPassword}
          hint={
            !fieldErrors.confirmPassword &&
            confirmPassword.length > 0 &&
            confirmPassword === password
              ? '✓ Senhas conferem'
              : undefined
          }
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm((v) => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          inputSize="lg"
          autoComplete="new-password"
          disabled={loading}
        />

        {/* Termos */}
        <div
          className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
            fieldErrors.terms ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'
          }`}
        >
          <input
            type="checkbox"
            id="terms"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            disabled={loading}
            className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600 cursor-pointer"
          />
          <div className="flex flex-col gap-0.5">
            <label htmlFor="terms" className="text-sm text-gray-600 leading-snug cursor-pointer">
              Concordo com os{' '}
              <a
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Termos de Uso
              </a>{' '}
              e{' '}
              <a
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Política de Privacidade
              </a>
            </label>
            {fieldErrors.terms && (
              <span className="text-xs font-medium text-red-500">{fieldErrors.terms}</span>
            )}
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
          Criar conta
        </Button>

        <Divider className="my-1" />

        <p className="text-center text-sm text-gray-600">
          Já tem conta?{' '}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
          >
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
