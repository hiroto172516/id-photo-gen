export type CameraError =
  | { code: 'NOT_SUPPORTED'; message: string }
  | { code: 'PERMISSION_DENIED'; message: string }
  | { code: 'DEVICE_NOT_FOUND'; message: string }
  | { code: 'UNKNOWN'; message: string };

export type FacingMode = 'user' | 'environment';

export type CameraMode = 'preview' | 'captured';

export interface CameraState {
  isLoading: boolean;
  isActive: boolean;
  facingMode: FacingMode;
  mode: CameraMode;
  capturedImage: string | null;
  error: CameraError | null;
}
