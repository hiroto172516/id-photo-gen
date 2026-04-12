import { GoogleGenAI, Modality } from '@google/genai';

export type Gender = 'male' | 'female';
export type SuitColor = 'black' | 'navy' | 'gray';
export type InnerColor = 'white-shirt' | 'white-blouse';

export interface SuitGenerationParams {
  imageBase64: string;
  imageMimeType: 'image/jpeg' | 'image/png';
  gender: Gender;
  suitColor: SuitColor;
  innerColor: InnerColor;
}

export type SuitGenerationResult =
  | {
      ok: true;
      imageBase64: string;
      imageMimeType: string;
      qualityScore: number;
      qualityFlags: string[];
    }
  | {
      ok: false;
      reason: 'api_error' | 'content_filtered' | 'quality_rejected' | 'no_image_output' | 'unconfigured';
      message: string;
    };

const SUIT_COLOR_MAP: Record<SuitColor, string> = {
  black: 'black',
  navy: 'dark navy blue',
  gray: 'charcoal gray',
};

function buildInnerText(gender: Gender, innerColor: InnerColor): string {
  if (gender === 'male' && innerColor === 'white-shirt') {
    return 'white dress shirt with dark tie';
  }
  return 'white professional blouse';
}

function buildSuitPrompt(params: SuitGenerationParams): string {
  const suitColorText = SUIT_COLOR_MAP[params.suitColor];
  const innerText = buildInnerText(params.gender, params.innerColor);

  return `You are a professional photo retouching assistant.
Task: Replace only the clothing in this ID photo with formal business attire.
Clothing to apply:
- A well-fitted ${suitColorText} business suit jacket
- ${innerText}
Critical rules:
- DO NOT change the person's face, skin tone, hair, or facial expression
- DO NOT change the background (keep white or clean plain background)
- DO NOT change the head position, camera angle, or framing
- The result must look like a professional passport or ID photo
Output: A photorealistic, professional portrait with the new clothing only.`;
}

interface QualityEvalResult {
  passed: boolean;
  score: number;
  flags: string[];
}

function evaluateQuality(base64: string, mimeType: string): QualityEvalResult {
  const flags: string[] = [];

  // base64 → バイト数の推定（base64文字数 * 3/4）
  const byteSize = Math.floor(base64.length * 0.75);

  if (byteSize < 10 * 1024) {
    flags.push('too_small');
  }

  if (byteSize > 10 * 1024 * 1024) {
    flags.push('too_large');
    return { passed: false, score: 0, flags };
  }

  if (!mimeType.startsWith('image/')) {
    flags.push('invalid_mime');
  }

  let score = 0.3;

  if (byteSize >= 50 * 1024) {
    score += 0.2;
  }

  if (byteSize >= 200 * 1024) {
    score += 0.3;
  }

  const passed = score >= 0.5 && flags.length === 0;

  return { passed, score, flags };
}

export async function generateSuitPhoto(params: SuitGenerationParams): Promise<SuitGenerationResult> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      ok: false,
      reason: 'unconfigured',
      message: 'GEMINI_API_KEY が設定されていません。',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: params.imageBase64, mimeType: params.imageMimeType } },
            { text: buildSuitPrompt(params) },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        temperature: 1.0,
      },
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
      return {
        ok: false,
        reason: 'api_error',
        message: 'APIからの応答にcandidateがありませんでした。',
      };
    }

    if (candidate.finishReason === 'SAFETY') {
      return {
        ok: false,
        reason: 'content_filtered',
        message: 'コンテンツフィルターにより画像生成がブロックされました。',
      };
    }

    const imagePart = candidate.content?.parts?.find((p) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      return {
        ok: false,
        reason: 'no_image_output',
        message: 'APIから画像データが返されませんでした。',
      };
    }

    const outputBase64 = imagePart.inlineData.data;
    const outputMimeType = imagePart.inlineData.mimeType ?? 'image/png';

    const quality = evaluateQuality(outputBase64, outputMimeType);

    if (!quality.passed) {
      return {
        ok: false,
        reason: 'quality_rejected',
        message: `生成画像の品質チェックに失敗しました: ${quality.flags.join(', ')}`,
      };
    }

    return {
      ok: true,
      imageBase64: outputBase64,
      imageMimeType: outputMimeType,
      qualityScore: quality.score,
      qualityFlags: quality.flags,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラーが発生しました。';
    return {
      ok: false,
      reason: 'api_error',
      message: `Gemini API呼び出しに失敗しました: ${message}`,
    };
  }
}
