'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, Mail, MapPin, Palette, Shield, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';
import {
  SettingsService,
  type ProfileBusiness,
  type SettingsProfileResponse,
} from '@/services/settings.service';
import { Alert, Button, Divider, Input, Select, Spinner, Textarea } from '@/components/ui';

const UF_OPTIONS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

const QUICK_COLORS = ['#5B5BFF', '#1A7A3E', '#B43232', '#B07800', '#1A5FB4', '#555555'] as const;

const normalizeNullable = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeColor = (value: string): string | null => {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

const isUnauthorizedError = (error: unknown): boolean =>
  error instanceof Error && error.message === 'Não autorizado. Faça login novamente.';

const equalNullable = (left: string, right: string | null): boolean => {
  const normalizedLeft = normalizeNullable(left);
  return normalizedLeft === right;
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [loadedProfile, setLoadedProfile] = useState<SettingsProfileResponse | null>(null);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [businessDocument, setBusinessDocument] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessColor, setBusinessColor] = useState('');
  const [businessFooter, setBusinessFooter] = useState('');

  const [addressZipCode, setAddressZipCode] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressDistrict, setAddressDistrict] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const applyProfileData = useCallback((profile: SettingsProfileResponse) => {
    setLoadedProfile(profile);

    setUserName(profile.user.name ?? '');
    setUserEmail(profile.user.email ?? '');

    setBusinessName(profile.business.name ?? '');
    setBusinessDocument(profile.business.document ?? '');
    setBusinessPhone(profile.business.phone ?? '');
    setBusinessEmail(profile.business.email ?? '');
    setBusinessColor(profile.business.color ?? '');
    setBusinessFooter(profile.business.footer ?? '');

    setAddressZipCode(profile.business.address.zipCode ?? '');
    setAddressStreet(profile.business.address.street ?? '');
    setAddressNumber(profile.business.address.number ?? '');
    setAddressDistrict(profile.business.address.district ?? '');
    setAddressCity(profile.business.address.city ?? '');
    setAddressState(profile.business.address.state ?? '');
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setProfileError('');

    try {
      const profile = await SettingsService.getProfile();
      applyProfileData(profile);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace('/login');
        return;
      }

      setProfileError(error instanceof Error ? error.message : 'Falha ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  }, [applyProfileData, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, [loadProfile]);

  const handleReset = useCallback(() => {
    if (!loadedProfile) {
      return;
    }

    setProfileError('');
    setProfileSuccess('');
    applyProfileData(loadedProfile);
  }, [applyProfileData, loadedProfile]);

  const buildBusinessPayload = useCallback((): ProfileBusiness | null => {
    if (!loadedProfile) {
      return null;
    }

    return {
      name: normalizeNullable(businessName),
      document: normalizeNullable(businessDocument),
      phone: normalizeNullable(businessPhone),
      email: normalizeNullable(businessEmail),
      logo: loadedProfile.business.logo,
      color: normalizeColor(businessColor),
      footer: normalizeNullable(businessFooter),
      address: {
        zipCode: normalizeNullable(addressZipCode),
        street: normalizeNullable(addressStreet),
        number: normalizeNullable(addressNumber),
        complement: loadedProfile.business.address.complement,
        district: normalizeNullable(addressDistrict),
        city: normalizeNullable(addressCity),
        state: normalizeNullable(addressState),
        country: loadedProfile.business.address.country,
      },
    };
  }, [
    loadedProfile,
    businessName,
    businessDocument,
    businessPhone,
    businessEmail,
    businessColor,
    businessFooter,
    addressZipCode,
    addressStreet,
    addressNumber,
    addressDistrict,
    addressCity,
    addressState,
  ]);

  const hasBusinessChanges = useCallback(
    (businessPayload: ProfileBusiness): boolean => {
      if (!loadedProfile) {
        return false;
      }

      return JSON.stringify(businessPayload) !== JSON.stringify(loadedProfile.business);
    },
    [loadedProfile],
  );

  const hasUserNameChanges = useCallback((): boolean => {
    if (!loadedProfile) {
      return false;
    }

    return !equalNullable(userName, loadedProfile.user.name);
  }, [loadedProfile, userName]);

  const handleSaveProfile = useCallback(async () => {
    if (!loadedProfile) {
      return;
    }

    setProfileError('');
    setProfileSuccess('');

    if (userName.trim().length === 0) {
      setProfileError('O nome do usuário é obrigatório.');
      return;
    }

    const businessPayload = buildBusinessPayload();

    if (!businessPayload) {
      setProfileError('Não foi possível preparar os dados para salvar.');
      return;
    }

    const shouldUpdateUser = hasUserNameChanges();
    const shouldUpdateBusiness = hasBusinessChanges(businessPayload);

    if (!shouldUpdateUser && !shouldUpdateBusiness) {
      setProfileSuccess('Nenhuma alteração para salvar.');
      return;
    }

    setSavingProfile(true);

    let userSaveError: string | null = null;
    let businessSaveError: string | null = null;

    if (shouldUpdateUser) {
      try {
        await SettingsService.updateUser({ name: userName.trim() });
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.replace('/login');
          setSavingProfile(false);
          return;
        }

        userSaveError =
          error instanceof Error ? error.message : 'Falha ao salvar dados do usuário.';
      }
    }

    if (shouldUpdateBusiness) {
      try {
        await SettingsService.updateBusiness(businessPayload);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.replace('/login');
          setSavingProfile(false);
          return;
        }

        businessSaveError =
          error instanceof Error ? error.message : 'Falha ao salvar dados da empresa.';
      }
    }

    if (userSaveError || businessSaveError) {
      const details = [userSaveError, businessSaveError].filter(Boolean).join(' ');
      setProfileError(details);

      try {
        const refreshedProfile = await SettingsService.getProfile();
        applyProfileData(refreshedProfile);
        await refreshProfile();
      } catch {
        // keep current local state when refresh fails after partial update
      }

      setSavingProfile(false);
      return;
    }

    try {
      const refreshedProfile = await SettingsService.getProfile();
      applyProfileData(refreshedProfile);
      await refreshProfile();
      setProfileSuccess('Configurações atualizadas com sucesso.');
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace('/login');
        setSavingProfile(false);
        return;
      }

      setProfileError(
        error instanceof Error
          ? error.message
          : 'Alterações salvas, mas não foi possível recarregar os dados.',
      );
    } finally {
      setSavingProfile(false);
    }
  }, [
    loadedProfile,
    userName,
    buildBusinessPayload,
    hasUserNameChanges,
    hasBusinessChanges,
    router,
    applyProfileData,
    refreshProfile,
  ]);

  const handleChangePassword = useCallback(async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (currentPassword.trim().length === 0) {
      setPasswordError('Informe a senha atual.');
      return;
    }

    if (newPassword.trim().length < 8) {
      setPasswordError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    setChangingPassword(true);

    try {
      await SettingsService.changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Senha alterada com sucesso.');
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace('/login');
        return;
      }

      setPasswordError(error instanceof Error ? error.message : 'Falha ao alterar senha.');
    } finally {
      setChangingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, router]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center gap-3 text-gray-400">
        <Spinner size={32} />
        <p className="text-sm">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white overflow-hidden">
      <aside className="hidden lg:block w-64 border-r border-gray-100 bg-gray-50/40 p-6 overflow-y-auto">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Conta</p>
        <nav className="space-y-2">
          <a
            href="#meu-perfil"
            className="flex items-center gap-2 text-sm text-indigo-600 font-semibold"
          >
            <UserRound size={16} />
            Meu perfil
          </a>
          <a
            href="#seguranca"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <Shield size={16} />
            Segurança
          </a>
        </nav>

        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-7 mb-4">
          Negócio
        </p>
        <nav className="space-y-2">
          <a
            href="#dados-empresa"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <Building2 size={16} />
            Dados da empresa
          </a>
          <a
            href="#endereco"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <MapPin size={16} />
            Endereço comercial
          </a>
          <a
            href="#rodape"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <FileText size={16} />
            Rodapé dos documentos
          </a>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 md:px-10 py-5 border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Configurações
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            Usuário e Empresa
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Atualize os dados do perfil, empresa e segurança.
          </p>
        </header>

        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8 pb-40">
          {profileError && <Alert variant="error">{profileError}</Alert>}
          {profileSuccess && (
            <Alert variant="success" className="mt-4">
              {profileSuccess}
            </Alert>
          )}

          <section id="meu-perfil" className="mt-8 flex flex-col gap-5 scroll-mt-28">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              Meu perfil
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Nome *"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                inputSize="lg"
                disabled={savingProfile}
                leftIcon={<UserRound className="w-4 h-4" />}
              />
              <Input
                label="E-mail"
                value={userEmail}
                readOnly
                readOnlyStyle
                inputSize="lg"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>
          </section>

          <Divider className="my-8" />

          <section id="dados-empresa" className="flex flex-col gap-5 scroll-mt-28">
            <div>
              <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                Dados da empresa
              </h2>
              <p className="text-xs text-gray-400 mt-2">
                Estes dados aparecem nos documentos gerados pelo sistema.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              <Input
                label="Nome do negócio / Razão social"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                inputSize="lg"
                disabled={savingProfile}
                className="md:col-span-2"
              />
              <Input
                label="CPF / CNPJ"
                value={businessDocument}
                onChange={(event) => setBusinessDocument(event.target.value)}
                inputSize="lg"
                disabled={savingProfile}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Telefone comercial"
                value={businessPhone}
                onChange={(event) => setBusinessPhone(event.target.value)}
                inputSize="lg"
                disabled={savingProfile}
              />
              <Input
                label="E-mail comercial"
                value={businessEmail}
                onChange={(event) => setBusinessEmail(event.target.value)}
                inputSize="lg"
                disabled={savingProfile}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-600">Cor tema</span>
              <div className="flex flex-wrap items-center gap-3">
                {QUICK_COLORS.map((color) => {
                  const selected = businessColor.toLowerCase() === color.toLowerCase();

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBusinessColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        selected
                          ? 'border-gray-900 shadow-sm'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                      disabled={savingProfile}
                    />
                  );
                })}

                <div className="w-44">
                  <Input
                    label="Cor personalizada"
                    value={businessColor}
                    onChange={(event) => setBusinessColor(event.target.value)}
                    inputSize="md"
                    disabled={savingProfile}
                    leftIcon={<Palette className="w-4 h-4" />}
                    placeholder="#5B5BFF"
                  />
                </div>
              </div>
            </div>
          </section>

          <Divider className="my-8" />

          <section id="endereco" className="flex flex-col gap-5 scroll-mt-28">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              Endereço comercial
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <Input
                label="CEP"
                value={addressZipCode}
                onChange={(event) => setAddressZipCode(event.target.value)}
                inputSize="lg"
                disabled={savingProfile}
              />
              <Input
                label="Logradouro"
                value={addressStreet}
                onChange={(event) => setAddressStreet(event.target.value)}
                inputSize="lg"
                disabled={savingProfile}
                className="md:col-span-2"
              />
              <Input
                label="Número"
                value={addressNumber}
                onChange={(event) => setAddressNumber(event.target.value)}
                inputSize="lg"
                disabled={savingProfile}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Bairro"
                value={addressDistrict}
                onChange={(event) => setAddressDistrict(event.target.value)}
                inputSize="lg"
                disabled={savingProfile}
              />
              <Input
                label="Cidade"
                value={addressCity}
                onChange={(event) => setAddressCity(event.target.value)}
                inputSize="lg"
                disabled={savingProfile}
              />
              <Select
                label="UF"
                value={addressState}
                onChange={(event) => setAddressState(event.target.value)}
                options={[
                  { value: '', label: '—' },
                  ...UF_OPTIONS.map((uf) => ({ value: uf, label: uf })),
                ]}
                selectSize="lg"
                disabled={savingProfile}
              />
            </div>
          </section>

          <Divider className="my-8" />

          <section id="rodape" className="flex flex-col gap-5 scroll-mt-28">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              Rodapé padrão dos documentos
            </h2>

            <Textarea
              label="Texto"
              value={businessFooter}
              onChange={(event) => setBusinessFooter(event.target.value)}
              rows={3}
              hint="Texto exibido no rodapé de todos os documentos emitidos"
              disabled={savingProfile}
            />
          </section>

          <Divider className="my-8" />

          <section id="seguranca" className="flex flex-col gap-5 scroll-mt-28">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Segurança</h2>

            {passwordError && <Alert variant="error">{passwordError}</Alert>}
            {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Senha atual"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                inputSize="lg"
                disabled={changingPassword}
                autoComplete="current-password"
              />
              <Input
                label="Nova senha"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                inputSize="lg"
                disabled={changingPassword}
                autoComplete="new-password"
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                inputSize="lg"
                disabled={changingPassword}
                autoComplete="new-password"
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                loading={changingPassword}
                onClick={handleChangePassword}
                className="min-w-40"
              >
                Alterar senha
              </Button>
            </div>
          </section>
        </main>

        <footer className="fixed bottom-0 left-0 md:left-[72px] right-0 bg-white border-t border-gray-100 px-6 md:px-10 py-4 z-30 pb-safe">
          <div className="max-w-5xl ml-auto flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleReset} disabled={savingProfile}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              loading={savingProfile}
              onClick={handleSaveProfile}
              className="min-w-40"
            >
              Salvar alterações
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
