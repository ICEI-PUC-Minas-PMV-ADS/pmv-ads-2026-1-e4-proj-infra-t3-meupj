import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/auth.context';
import { SettingsService } from '../../services/settings.service';

const UNAUTHORIZED_MESSAGE = 'Não autorizado. Faça login novamente.';

const normalizeNullable = (value) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeColor = (value) => {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

const equalNullable = (left, right) => normalizeNullable(left) === right;

const isUnauthorizedError = (error) =>
  error instanceof Error && error.message === UNAUTHORIZED_MESSAGE;

export default function SettingsScreen() {
  const { logout, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [loadedProfile, setLoadedProfile] = useState(null);

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

  const applyProfileData = useCallback((profile) => {
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
    setAddressState((profile.business.address.state ?? '').toUpperCase());
  }, []);

  const handleUnauthorizedSession = useCallback(async () => {
    await logout();
  }, [logout]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setProfileError('');

    try {
      const profile = await SettingsService.getProfile();
      applyProfileData(profile);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await handleUnauthorizedSession();
        return;
      }

      setProfileError(error instanceof Error ? error.message : 'Falha ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  }, [applyProfileData, handleUnauthorizedSession]);

  useEffect(() => {
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

  const buildBusinessPayload = useCallback(() => {
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
        state: normalizeNullable(addressState.toUpperCase().slice(0, 2)),
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
    (businessPayload) => {
      if (!loadedProfile) {
        return false;
      }

      return JSON.stringify(businessPayload) !== JSON.stringify(loadedProfile.business);
    },
    [loadedProfile],
  );

  const hasUserNameChanges = useCallback(() => {
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

    let userSaveError = null;
    let businessSaveError = null;

    if (shouldUpdateUser) {
      try {
        await SettingsService.updateUser({ name: userName.trim() });
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await handleUnauthorizedSession();
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
          await handleUnauthorizedSession();
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
        // preserva estado local caso recarga falhe após update parcial
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
        await handleUnauthorizedSession();
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
    applyProfileData,
    refreshProfile,
    handleUnauthorizedSession,
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
        await handleUnauthorizedSession();
        return;
      }

      setPasswordError(error instanceof Error ? error.message : 'Falha ao alterar senha.');
    } finally {
      setChangingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, handleUnauthorizedSession]);

  const isSaveDisabled = useMemo(() => loading || savingProfile, [loading, savingProfile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Carregando configurações...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Configurações</Text>
        <Text style={styles.topSubtitle}>Usuário e Empresa</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
        {profileSuccess ? <Text style={styles.successText}>{profileSuccess}</Text> : null}

        <Text style={styles.sectionTitle}>MEU PERFIL</Text>

        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={userName}
          onChangeText={setUserName}
          editable={!savingProfile}
          placeholder="Seu nome"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={[styles.input, styles.inputReadonly]}
          value={userEmail}
          editable={false}
          placeholder="-"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>DADOS DA EMPRESA</Text>

        <Text style={styles.label}>Nome do negócio / Razão social</Text>
        <TextInput
          style={styles.input}
          value={businessName}
          onChangeText={setBusinessName}
          editable={!savingProfile}
          placeholder="Nome da empresa"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>CPF / CNPJ</Text>
        <TextInput
          style={styles.input}
          value={businessDocument}
          onChangeText={setBusinessDocument}
          editable={!savingProfile}
          placeholder="000.000.000-00"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Telefone comercial</Text>
        <TextInput
          style={styles.input}
          value={businessPhone}
          onChangeText={setBusinessPhone}
          editable={!savingProfile}
          placeholder="(00) 00000-0000"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>E-mail comercial</Text>
        <TextInput
          style={styles.input}
          value={businessEmail}
          onChangeText={setBusinessEmail}
          editable={!savingProfile}
          placeholder="contato@empresa.com"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Cor tema (hex)</Text>
        <TextInput
          style={styles.input}
          value={businessColor}
          onChangeText={setBusinessColor}
          editable={!savingProfile}
          placeholder="#4F46E5"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Rodapé dos documentos</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={businessFooter}
          onChangeText={setBusinessFooter}
          editable={!savingProfile}
          placeholder="Texto padrão do rodapé"
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ENDEREÇO COMERCIAL</Text>

        <Text style={styles.label}>CEP</Text>
        <TextInput
          style={styles.input}
          value={addressZipCode}
          onChangeText={setAddressZipCode}
          editable={!savingProfile}
          placeholder="00000-000"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Logradouro</Text>
        <TextInput
          style={styles.input}
          value={addressStreet}
          onChangeText={setAddressStreet}
          editable={!savingProfile}
          placeholder="Rua / Avenida"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Número</Text>
        <TextInput
          style={styles.input}
          value={addressNumber}
          onChangeText={setAddressNumber}
          editable={!savingProfile}
          placeholder="Nº"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Bairro</Text>
        <TextInput
          style={styles.input}
          value={addressDistrict}
          onChangeText={setAddressDistrict}
          editable={!savingProfile}
          placeholder="Bairro"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Cidade</Text>
        <TextInput
          style={styles.input}
          value={addressCity}
          onChangeText={setAddressCity}
          editable={!savingProfile}
          placeholder="Cidade"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>UF</Text>
        <TextInput
          style={styles.input}
          value={addressState}
          onChangeText={(value) => setAddressState(value.toUpperCase().slice(0, 2))}
          editable={!savingProfile}
          placeholder="UF"
          placeholderTextColor="#9CA3AF"
          maxLength={2}
          autoCapitalize="characters"
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>SEGURANÇA</Text>

        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        {passwordSuccess ? <Text style={styles.successText}>{passwordSuccess}</Text> : null}

        <Text style={styles.label}>Senha atual</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          editable={!changingPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Nova senha</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          editable={!changingPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.label}>Confirmar nova senha</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!changingPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity
          style={[styles.secondaryAction, changingPassword && styles.secondaryActionDisabled]}
          onPress={handleChangePassword}
          disabled={changingPassword}
        >
          {changingPassword ? (
            <ActivityIndicator color="#4F46E5" />
          ) : (
            <Text style={styles.secondaryActionText}>Alterar senha</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cancelBtn, isSaveDisabled && styles.cancelBtnDisabled]}
          onPress={handleReset}
          disabled={isSaveDisabled}
        >
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, isSaveDisabled && styles.saveBtnDisabled]}
          onPress={handleSaveProfile}
          disabled={isSaveDisabled}
        >
          {savingProfile ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Salvar alterações</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleUnauthorizedSession}>
          <Text style={styles.logoutBtnText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
  },
  topSubtitle: {
    color: '#6B7280',
    marginTop: 2,
    fontSize: 13,
  },
  form: {
    padding: 16,
    paddingBottom: 180,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  label: {
    color: '#374151',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6E9EE',
    color: '#111827',
    fontSize: 15,
  },
  inputReadonly: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  successText: {
    color: '#15803D',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '500',
  },
  secondaryAction: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionDisabled: {
    opacity: 0.7,
  },
  secondaryActionText: {
    color: '#3730A3',
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  cancelBtnDisabled: {
    opacity: 0.6,
  },
  cancelBtnText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    flex: 1.4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#4F46E5',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  logoutBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
  },
  logoutBtnText: {
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 12,
  },
});
