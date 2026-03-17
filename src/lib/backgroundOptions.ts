export type BackgroundPresetId = 'white' | 'blue' | 'gray' | 'custom';

export interface BackgroundPreset {
  id: BackgroundPresetId;
  label: string;
  colorHex: string;
}

export interface BackgroundSettings {
  presetId: BackgroundPresetId;
  colorHex: string;
  label: string;
}

export const DEFAULT_CUSTOM_BACKGROUND_COLOR = '#d9e2f2';
export const DEFAULT_BACKGROUND_PRESET_ID: BackgroundPresetId = 'white';

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'white',
    label: 'ホワイト',
    colorHex: '#ffffff',
  },
  {
    id: 'blue',
    label: 'ライトブルー',
    colorHex: '#dbeafe',
  },
  {
    id: 'gray',
    label: 'ライトグレー',
    colorHex: '#e5e7eb',
  },
  {
    id: 'custom',
    label: 'カスタム',
    colorHex: DEFAULT_CUSTOM_BACKGROUND_COLOR,
  },
];

const BACKGROUND_PRESET_MAP = new Map(BACKGROUND_PRESETS.map((preset) => [preset.id, preset]));

export function getBackgroundPreset(presetId: BackgroundPresetId) {
  return BACKGROUND_PRESET_MAP.get(presetId) ?? BACKGROUND_PRESET_MAP.get(DEFAULT_BACKGROUND_PRESET_ID)!;
}

export function createBackgroundSettings(
  presetId: BackgroundPresetId,
  customColorHex = DEFAULT_CUSTOM_BACKGROUND_COLOR
): BackgroundSettings {
  const preset = getBackgroundPreset(presetId);
  const colorHex = presetId === 'custom' ? customColorHex : preset.colorHex;

  return {
    presetId,
    colorHex,
    label: presetId === 'custom' ? `カスタム ${colorHex.toUpperCase()}` : preset.label,
  };
}
