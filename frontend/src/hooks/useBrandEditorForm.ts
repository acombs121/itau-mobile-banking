import { useState, useCallback } from 'react';
import { BrandingProfile } from '../types/brand';

export interface UseBrandEditorFormOptions {
  initialPrimaryColor?: string;
  initialAccentColor?: string;
  lang?: 'pt' | 'en';
}

export function useBrandEditorForm({
  initialPrimaryColor = '#FF6423',
  initialAccentColor = '#002D62',
  lang = 'pt',
}: UseBrandEditorFormOptions = {}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formSubtitle, setFormSubtitle] = useState<string>('');
  const [formTagline, setFormTagline] = useState<string>('');
  const [formPrimaryColor, setFormPrimaryColor] = useState<string>(initialPrimaryColor);
  const [formSecondaryTextColor, setFormSecondaryTextColor] = useState<string>('#FFFFFF');
  const [formAccentColor, setFormAccentColor] = useState<string>(initialAccentColor);
  const [formLogoUrl, setFormLogoUrl] = useState<string | undefined>(undefined);
  const [formLogoOnly, setFormLogoOnly] = useState<boolean>(false);
  const [formLightHeader, setFormLightHeader] = useState<boolean>(false);
  const [formLogoScale, setFormLogoScale] = useState<number>(100);
  const [formLogoX, setFormLogoX] = useState<number>(0);
  const [formLogoY, setFormLogoY] = useState<number>(0);

  const startCreateNew = useCallback(() => {
    setEditingId(null);
    setFormName('');
    setFormSubtitle(lang === 'pt' ? 'Crédito Imobiliário & Garantia' : 'Mortgage & Home Equity');
    setFormTagline(lang === 'pt' ? '100% Digital • Sem Burocracia' : '100% Digital Origination • Powered by Google Cloud');
    setFormPrimaryColor('#1A73E8');
    setFormSecondaryTextColor('#FFFFFF');
    setFormAccentColor('#002D62');
    setFormLogoUrl(undefined);
    setFormLogoOnly(false);
    setFormLightHeader(false);
    setFormLogoScale(100);
    setFormLogoX(0);
    setFormLogoY(0);
  }, [lang]);

  const startEdit = useCallback((profile: BrandingProfile) => {
    setEditingId(profile.id);
    setFormName(profile.name);
    setFormSubtitle(profile.brandSubtitle || '');
    setFormTagline(profile.tagline || '');
    setFormPrimaryColor(profile.primaryColor);
    setFormSecondaryTextColor(profile.secondaryTextColor || '#FFFFFF');
    setFormAccentColor(profile.accentColor || '#002D62');
    setFormLogoUrl(profile.logoUrl);
    setFormLogoOnly(profile.logoOnly || false);
    setFormLightHeader(profile.lightHeader || false);
    setFormLogoScale(profile.logoScale || 100);
    setFormLogoX(profile.logoX || 0);
    setFormLogoY(profile.logoY || 0);
  }, []);

  const applyColorPreset = useCallback((preset: { primary: string; secondary: string; accent: string }) => {
    setFormPrimaryColor(preset.primary);
    setFormSecondaryTextColor(preset.secondary);
    setFormAccentColor(preset.accent);
  }, []);

  const buildProfileData = useCallback((): BrandingProfile => {
    const brandId = editingId || `custom-${Date.now()}`;
    return {
      id: brandId,
      name: formName.trim() || (lang === 'pt' ? 'Banco Personalizado' : 'Custom Institution'),
      brandSubtitle: formSubtitle.trim() || (lang === 'pt' ? 'Crédito Imobiliário & Garantia' : 'Mortgage & Home Equity'),
      tagline: formTagline.trim() || undefined,
      primaryColor: formPrimaryColor || '#FF6423',
      secondaryTextColor: formSecondaryTextColor || '#FFFFFF',
      accentColor: formAccentColor || '#002D62',
      logoUrl: formLogoUrl,
      logoOnly: formLogoOnly,
      lightHeader: formLightHeader,
      logoScale: formLogoScale,
      logoX: formLogoX,
      logoY: formLogoY,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [
    editingId,
    formName,
    formSubtitle,
    formTagline,
    formPrimaryColor,
    formSecondaryTextColor,
    formAccentColor,
    formLogoUrl,
    formLogoOnly,
    formLightHeader,
    formLogoScale,
    formLogoX,
    formLogoY,
    lang
  ]);

  return {
    editingId,
    setEditingId,
    formName,
    setFormName,
    formSubtitle,
    setFormSubtitle,
    formTagline,
    setFormTagline,
    formPrimaryColor,
    setFormPrimaryColor,
    formSecondaryTextColor,
    setFormSecondaryTextColor,
    formAccentColor,
    setFormAccentColor,
    formLogoUrl,
    setFormLogoUrl,
    formLogoOnly,
    setFormLogoOnly,
    formLightHeader,
    setFormLightHeader,
    formLogoScale,
    setFormLogoScale,
    formLogoX,
    setFormLogoX,
    formLogoY,
    setFormLogoY,
    startCreateNew,
    startEdit,
    applyColorPreset,
    buildProfileData,
  };
}
