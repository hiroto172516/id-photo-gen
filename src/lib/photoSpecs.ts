export type PhotoSpecId =
  | 'resume'
  | 'passport'
  | 'drivers-license'
  | 'my-number'
  | 'us-visa';

export interface PhotoSpecPreset {
  id: PhotoSpecId;
  label: string;
  widthMm: number;
  heightMm: number;
  headHeightRatio: number;
  topMarginRatio: number;
}

export const DEFAULT_PHOTO_SPEC_ID: PhotoSpecId = 'resume';

export const PHOTO_SPEC_PRESETS: PhotoSpecPreset[] = [
  {
    id: 'resume',
    label: '履歴書 30×40mm',
    widthMm: 30,
    heightMm: 40,
    headHeightRatio: 0.68,
    topMarginRatio: 0.1,
  },
  {
    id: 'passport',
    label: 'パスポート 35×45mm',
    widthMm: 35,
    heightMm: 45,
    headHeightRatio: 0.72,
    topMarginRatio: 0.09,
  },
  {
    id: 'drivers-license',
    label: '運転免許証 24×30mm',
    widthMm: 24,
    heightMm: 30,
    headHeightRatio: 0.7,
    topMarginRatio: 0.11,
  },
  {
    id: 'my-number',
    label: 'マイナンバーカード 35×45mm',
    widthMm: 35,
    heightMm: 45,
    headHeightRatio: 0.72,
    topMarginRatio: 0.09,
  },
  {
    id: 'us-visa',
    label: '米国ビザ 51×51mm',
    widthMm: 51,
    heightMm: 51,
    headHeightRatio: 0.7,
    topMarginRatio: 0.12,
  },
];

const PHOTO_SPEC_PRESET_MAP = new Map(PHOTO_SPEC_PRESETS.map((preset) => [preset.id, preset]));

export function getPhotoSpecPreset(specId: PhotoSpecId) {
  return PHOTO_SPEC_PRESET_MAP.get(specId) ?? PHOTO_SPEC_PRESET_MAP.get(DEFAULT_PHOTO_SPEC_ID)!;
}
