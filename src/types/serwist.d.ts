// serwist のビルド時注入変数の型宣言
import type { PrecacheEntry } from "serwist";

declare global {
  interface Window {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
