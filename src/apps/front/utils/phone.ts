const BRAZIL_COUNTRY_CODE = '55';

export const maskPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const normalizeBrazilianPhone = (value: string): string | null => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 10 || digits.length === 11) {
    return digits;
  }

  if ((digits.length === 12 || digits.length === 13) && digits.startsWith(BRAZIL_COUNTRY_CODE)) {
    const nationalDigits = digits.slice(BRAZIL_COUNTRY_CODE.length);

    if (nationalDigits.length === 10 || nationalDigits.length === 11) {
      return nationalDigits;
    }
  }

  return null;
};

export const getTelHref = (value: string): string | null => {
  const normalizedPhone = normalizeBrazilianPhone(value);

  if (!normalizedPhone) {
    return null;
  }

  return `tel:${normalizedPhone}`;
};

export const getWhatsAppHref = (value: string): string | null => {
  const normalizedPhone = normalizeBrazilianPhone(value);

  if (!normalizedPhone) {
    return null;
  }

  return `https://wa.me/${BRAZIL_COUNTRY_CODE}${normalizedPhone}`;
};
