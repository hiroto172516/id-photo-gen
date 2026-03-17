import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const sampleImagePath = path.resolve(__dirname, '../../public/icons/icon-192x192.png');

declare global {
  interface Window {
    __mockFaceDetectionResult?: {
      box: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      confidence: number;
    } | null;
    __mockBackgroundRemovalMode?: 'success' | 'failure';
    __sharedPayload?: { title?: string; text?: string; url?: string };
    __clipboardText?: string;
    __trackedEvents?: Array<{ name: string; params?: Record<string, unknown> }>;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

async function prepareClientEnvironment(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('pwa-install-banner-dismissed', String(Date.now()));
    window.__mockFaceDetectionResult = {
      box: {
        x: 32,
        y: 18,
      width: 120,
      height: 144,
      },
      confidence: 0.93,
    };
    window.__mockBackgroundRemovalMode = 'success';
    window.__trackedEvents = [];

    const mediaDevices = navigator.mediaDevices ?? {};
    Object.defineProperty(mediaDevices, 'getUserMedia', {
      value: async () => {
        const error = new Error('カメラのアクセス許可が必要です');
        Object.defineProperty(error, 'name', {
          value: 'NotAllowedError',
          configurable: true,
        });
        throw error;
      },
      configurable: true,
      writable: true,
    });

    try {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: mediaDevices,
        configurable: true,
      });
    } catch {
      // navigator.mediaDevices が再定義不可でも getUserMedia の差し替えだけで継続する
    }

    const clipboard = navigator.clipboard ?? {};
    Object.defineProperty(clipboard, 'writeText', {
      value: async (text: string) => {
        window.__clipboardText = text;
      },
      configurable: true,
      writable: true,
    });

    try {
      Object.defineProperty(navigator, 'clipboard', {
        value: clipboard,
        configurable: true,
      });
    } catch {
      // navigator.clipboard が再定義不可でも writeText の差し替えだけで継続する
    }

    window.dataLayer = [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  });
}

async function openShootPage(page: Page) {
  await page.goto('/shoot');
  await expect(page.getByRole('heading', { name: '写真を用意する' })).toBeVisible({ timeout: 10000 });
}

async function mockUploadSuccess(page: Page) {
  await page.route('**/api/uploads/sign', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        bucket: 'uploads',
        objectPath: 'temporary/exp-9999999999-test.jpg',
        path: 'sign/temporary/exp-9999999999-test.jpg',
        token: 'test-token',
        expiresAt: '2099-12-31T00:00:00.000Z',
      }),
    });
  });

  await page.route('**/storage/v1/object/upload/sign/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ Key: 'temporary/exp-9999999999-test.jpg' }),
    });
  });
}

test.describe('shoot page', () => {
  test.beforeEach(async ({ page }) => {
    await prepareClientEnvironment(page);
  });

  test('初期表示とタブ切替が動作する', async ({ page }) => {
    await openShootPage(page);

    await expect(page.getByTestId('guest-banner')).toBeVisible();
    await expect(page.getByTestId('photo-spec-selector')).toBeVisible();
    await expect(page.getByTestId('photo-spec-select')).toHaveValue('resume');
    await expect(page.getByTestId('photo-spec-note')).toContainText('履歴書 30×40mm');
    await expect(page.getByTestId('background-selector')).toBeVisible();
    await expect(page.getByTestId('background-note')).toContainText('ホワイト');
    await expect(page.getByTestId('background-color-picker')).toBeVisible();
    await expect(page.getByTestId('tab-camera')).toBeVisible();
    await expect(page.getByTestId('tab-file')).toBeVisible();
    await expect(page.getByTestId('upload-policy-note')).toBeVisible();

    await page.getByTestId('tab-file').click();

    await expect(page.getByTestId('file-drop-zone')).toBeVisible();
    await expect(page.getByTestId('file-input')).toBeAttached();
  });

  test('ファイルアップロードから成功表示まで進める', async ({ page }) => {
    await mockUploadSuccess(page);
    await openShootPage(page);
    await page.getByTestId('photo-spec-select').selectOption('passport');
    await page.getByTestId('background-preset-blue').click();
    await page.getByTestId('tab-file').click();
    await expect(page.getByTestId('file-drop-zone')).toBeVisible();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('photo-editor')).toBeVisible();
    await expect(page.getByTestId('image-preview-meta')).toContainText('補正後プレビュー');
    await expect(page.getByTestId('selected-spec-label')).toContainText('パスポート 35×45mm');
    await expect(page.getByTestId('selected-background-label')).toContainText('ライトブルー');
    await expect(page.getByTestId('photo-editor-zoom-value')).toContainText('100%');
    await expect(page.getByTestId('l-print-layout')).toBeVisible();
    await expect(page.getByTestId('l-print-layout-preview')).toBeVisible();
    await expect(page.getByTestId('free-preview-note')).toBeVisible();
    await expect(page.getByTestId('photo-preview-watermark')).toBeVisible();
    await expect(page.getByTestId('l-print-preview-watermark')).toBeVisible();
    await expect(page.getByTestId('download-actions')).toBeVisible();
    await expect(page.getByTestId('print-guide')).toBeVisible();
    await expect(page.getByTestId('share-actions')).toBeVisible();
    await expect(page.getByTestId('feedback-form')).toBeVisible();
    await expect(page.getByTestId('l-print-cut-lines-status')).toContainText('表示中');

    await page.getByTestId('use-photo-button').click();

    await expect(page.getByTestId('upload-success')).toBeVisible();
    await expect(page.getByTestId('upload-success')).toContainText('uploads/temporary/exp-9999999999-test.jpg');
    await expect(page.getByTestId('upload-success')).toContainText('自動削除予定');
  });

  test('無料版の統合フローを通しで完了できる', async ({ page }) => {
    await mockUploadSuccess(page);
    await openShootPage(page);

    await page.getByTestId('tab-file').click();
    await page.getByTestId('photo-spec-select').selectOption('passport');
    await page.getByTestId('background-preset-gray').click();
    await expect(page.getByTestId('file-input')).toBeAttached();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('photo-editor')).toBeVisible();
    await expect(page.getByTestId('selected-spec-label')).toContainText('パスポート 35×45mm');
    await expect(page.getByTestId('selected-background-label')).toContainText('ライトグレー');
    await expect(page.getByTestId('l-print-copy-count')).toContainText('4枚');

    await page.getByTestId('photo-editor-zoom').fill('1.2');
    await expect(page.getByTestId('photo-editor-zoom-value')).toContainText('120%');
    await expect(page.getByTestId('processing-status')).toBeHidden({ timeout: 10000 });

    const singleDownloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-single-jpeg').click();
    expect((await singleDownloadPromise).suggestedFilename()).toBe('id-photo-passport-gray-single.jpg');

    await page.getByTestId('l-print-cut-lines-toggle').uncheck();
    await expect(page.getByTestId('l-print-cut-lines-status')).toContainText('非表示');

    const layoutDownloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-l-print-png').click();
    expect((await layoutDownloadPromise).suggestedFilename()).toBe('id-photo-passport-gray-l-print.png');

    await page.getByTestId('use-photo-button').click();
    await expect(page.getByTestId('upload-success')).toBeVisible();
    await expect(page.getByTestId('upload-success')).toContainText('uploads/temporary/exp-9999999999-test.jpg');

    await expect
      .poll(async () => page.evaluate(() => window.__trackedEvents?.map((event) => event.name) ?? []))
      .toEqual(
        expect.arrayContaining([
          'shoot_started',
          'photo_processed',
          'single_download',
          'lprint_download',
          'upload_completed',
        ])
      );
  });

  test('フィードバックを送信できる', async ({ page }) => {
    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('feedback-form')).toBeVisible();
    await page.getByTestId('feedback-category').selectOption('bug');
    await page.getByTestId('feedback-rating').selectOption('2');
    await page.getByTestId('feedback-message').fill('背景除去の案内が少し分かりにくかったです。');
    await page.getByTestId('feedback-email').fill('user@example.com');
    await page.getByTestId('feedback-submit').click();

    await expect(page.getByTestId('feedback-success')).toContainText('フィードバックありがとうございます');
    await expect
      .poll(async () => page.evaluate(() => window.__trackedEvents?.map((event) => event.name) ?? []))
      .toEqual(expect.arrayContaining(['feedback_submitted']));
  });

  test('フィードバックの入力不足はエラーを表示する', async ({ page }) => {
    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await page.getByTestId('feedback-message').fill('短い');
    await page.getByTestId('feedback-submit').click();

    await expect(page.getByTestId('feedback-error')).toContainText('入力内容を確認してください');
    await expect(page.getByText('感想は10文字以上で入力してください。')).toBeVisible();
  });

  test('サイズ超過ファイルはバリデーションエラーを出す', async ({ page }) => {
    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await expect(page.getByTestId('file-drop-zone')).toBeVisible();
    await page.getByTestId('file-input').setInputFiles({
      name: 'oversized.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 1),
    });

    await expect(page.getByTestId('file-dropzone-error')).toContainText('ファイルサイズは10MB以下にしてください');
  });

  test('署名URL発行失敗時はエラーを表示する', async ({ page }) => {
    await page.route('**/api/uploads/sign', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          message: '短時間にリクエストが集中しています。しばらく待ってから再度お試しください。',
        }),
      });
    });

    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await expect(page.getByTestId('file-drop-zone')).toBeVisible();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);
    await expect(page.getByTestId('photo-editor')).toBeVisible();

    await page.getByTestId('use-photo-button').click();

    await expect(page.getByTestId('upload-error')).toContainText('短時間にリクエストが集中しています');
  });

  test('顔検出できない場合はフォールバック案内を表示する', async ({ page }) => {
    await page.addInitScript(() => {
      window.__mockFaceDetectionResult = null;
    });

    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await expect(page.getByTestId('file-drop-zone')).toBeVisible();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('face-detection-fallback')).toContainText(
      '中央基準の安全なトリミング'
    );
  });

  test('背景除去に失敗した場合はフォールバック案内を表示する', async ({ page }) => {
    await page.addInitScript(() => {
      window.__mockBackgroundRemovalMode = 'failure';
    });

    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await expect(page.getByTestId('file-drop-zone')).toBeVisible();
    await page.getByTestId('background-preset-custom').click();
    await page.getByTestId('background-color-picker').fill('#abc123');
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('selected-background-label')).toContainText('カスタム #ABC123');
    await expect(page.getByTestId('background-removal-fallback')).toContainText(
      '背景処理が安定しない環境'
    );
  });

  test('手動トリミングのズームとリセットが反映される', async ({ page }) => {
    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await expect(page.getByTestId('file-input')).toBeAttached();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('photo-editor')).toBeVisible();
    await expect(page.getByTestId('photo-editor-zoom-value')).toContainText('100%');

    await page.getByTestId('photo-editor-zoom').fill('1.4');
    await expect(page.getByTestId('photo-editor-zoom-value')).toContainText('140%');
    await expect(page.getByTestId('processing-status')).toBeHidden({ timeout: 10000 });

    await expect(page.getByTestId('photo-editor-reset')).toBeVisible();
    await page.getByTestId('photo-editor-reset').click();
    await expect
      .poll(async () => page.getByTestId('photo-editor-zoom-value').textContent(), {
        timeout: 10000,
      })
      .toContain('100%');
    await expect
      .poll(async () => page.getByTestId('photo-editor-offset-x').textContent(), {
        timeout: 10000,
      })
      .toContain('0%');
    await expect
      .poll(async () => page.getByTestId('photo-editor-offset-y').textContent(), {
        timeout: 10000,
      })
      .toContain('0%');
  });

  test('規格変更で編集プレビューが再計算される', async ({ page }) => {
    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await expect(page.getByTestId('file-input')).toBeAttached();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('selected-spec-label')).toContainText('履歴書 30×40mm');
    await expect(page.getByTestId('l-print-photo-size')).toContainText('30×40mm');

    await page.getByTestId('photo-spec-select').selectOption('us-visa');

    await expect(page.getByTestId('selected-spec-label')).toContainText('米国ビザ 51×51mm');
    await expect(page.getByTestId('photo-editor-zoom-value')).toContainText('100%');
    await expect(page.getByTestId('l-print-photo-size')).toContainText('51×51mm');
  });

  test('カットライン表示を切り替えられる', async ({ page }) => {
    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('l-print-layout-preview')).toBeVisible();
    await expect(page.getByTestId('l-print-cut-lines-status')).toContainText('表示中');

    await page.getByTestId('l-print-cut-lines-toggle').uncheck();

    await expect(page.getByTestId('l-print-cut-lines-status')).toContainText('非表示');
    await expect(page.getByTestId('l-print-layout-preview')).toBeVisible();
  });

  test('単体写真とL版のダウンロードを開始できる', async ({ page }) => {
    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('download-actions')).toBeVisible();

    const singleDownloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-single-jpeg').click();
    const singleDownload = await singleDownloadPromise;
    expect(singleDownload.suggestedFilename()).toBe('id-photo-resume-white-single.jpg');

    const layoutDownloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-l-print-png').click();
    const layoutDownload = await layoutDownloadPromise;
    expect(layoutDownload.suggestedFilename()).toBe('id-photo-resume-white-l-print.png');
  });

  test('ネイティブ共有が使える環境では共有APIを呼び出す', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        value: async (payload: { title?: string; text?: string; url?: string }) => {
          window.__sharedPayload = payload;
        },
        configurable: true,
        writable: true,
      });
    });

    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('share-native-button')).toBeVisible();
    await page.getByTestId('share-native-button').click();

    await expect
      .poll(async () => page.evaluate(() => window.__sharedPayload?.url ?? ''))
      .toBe('https://app-six-ochre-65.vercel.app/shoot');
    await expect
      .poll(async () => page.evaluate(() => window.__sharedPayload?.title ?? ''))
      .toBe('スマ撮り証明写真');
    await expect
      .poll(async () => page.evaluate(() => window.__trackedEvents?.map((event) => event.name) ?? []))
      .toEqual(expect.arrayContaining(['share_clicked']));
  });

  test('ネイティブ共有がない環境では共有リンクとコピー導線を表示する', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, 'share', {
          value: undefined,
          configurable: true,
          writable: true,
        });
      } catch {
        // share API を無効化できない環境でも表示確認を継続する
      }
    });

    await openShootPage(page);
    await page.getByTestId('tab-file').click();
    await page.getByTestId('file-input').setInputFiles(sampleImagePath);

    await expect(page.getByTestId('share-x-button')).toBeVisible();
    await expect(page.getByTestId('share-line-button')).toBeVisible();
    await page.getByTestId('share-copy-button').click();

    await expect(page.getByTestId('share-copy-success')).toBeVisible();
    await expect
      .poll(async () => page.evaluate(() => window.__clipboardText ?? ''))
      .toBe('https://app-six-ochre-65.vercel.app/shoot');
    await expect
      .poll(async () => page.evaluate(() => window.__trackedEvents?.map((event) => event.name) ?? []))
      .toEqual(expect.arrayContaining(['share_clicked']));
  });

  test('カメラ権限拒否時は再試行導線つきエラーを表示する', async ({ page }) => {
    await openShootPage(page);

    await expect(page.getByTestId('camera-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('camera-error')).toContainText('カメラのアクセス許可が必要です');
    await expect(page.getByTestId('camera-retry-button')).toBeVisible();
  });

  test('法務ページへ遷移できる', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: '利用規約' }).first().click();
    await expect(page.getByRole('heading', { name: '利用規約' })).toBeVisible();

    await page.goto('/blog/how-to-take-id-photo-with-smartphone');
    await page.getByRole('link', { name: 'プライバシーポリシー' }).click();
    await expect(page.getByRole('heading', { name: 'プライバシーポリシー' })).toBeVisible();

    await openShootPage(page);
    await page.getByRole('link', { name: '利用規約' }).click();
    await expect(page).toHaveURL(/\/terms$/);
  });

  test('プライバシーポリシーに分析利用の記載がある', async ({ page }) => {
    await page.goto('/privacy');

    await expect(page.getByText('Vercel Analytics')).toBeVisible();
    await expect(page.getByText('Google Analytics は測定IDが設定された環境でのみ有効化')).toBeVisible();
  });

  test('sitemap.xml と robots.txt を公開できる', async ({ page }) => {
    const sitemapResponse = await page.request.get('/sitemap.xml');
    await expect(sitemapResponse.ok()).toBeTruthy();
    const sitemapXml = await sitemapResponse.text();
    expect(sitemapXml).toContain('https://app-six-ochre-65.vercel.app/shoot');
    expect(sitemapXml).toContain(
      'https://app-six-ochre-65.vercel.app/blog/how-to-take-id-photo-with-smartphone'
    );

    const robotsResponse = await page.request.get('/robots.txt');
    await expect(robotsResponse.ok()).toBeTruthy();
    const robotsText = await robotsResponse.text();
    expect(robotsText).toContain('Sitemap: https://app-six-ochre-65.vercel.app/sitemap.xml');
    expect(robotsText).toContain('Allow: /shoot');
  });

  test('social-kit に公開告知と Product Hunt メモを表示する', async ({ page }) => {
    await page.goto('/social-kit');

    await expect(page.getByRole('heading', { name: 'スマ撮り証明写真 の公開運用素材' })).toBeVisible();
    await expect(page.getByText('無料β公開の共有文面')).toBeVisible();
    await expect(page.getByText('Product Hunt', { exact: true })).toBeVisible();
    await expect(page.getByText('Turn a smartphone photo into an ID photo-ready print sheet in your browser')).toBeVisible();
    await expect(page.getByText('https://app-six-ochre-65.vercel.app/sitemap.xml')).toBeVisible();
  });
});
