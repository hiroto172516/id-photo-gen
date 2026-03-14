import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {z} from "zod";
import {bodyFontFamily, headlineFontFamily} from "./fonts";

export const socialPromoSchema = z.object({
  headline: z.string(),
  serviceName: z.string(),
  priceLabel: z.string(),
  ctaLabel: z.string(),
});

export type SocialPromoProps = z.infer<typeof socialPromoSchema>;

const palette = {
  ink: "#0f172a",
  cyan: "#22d3ee",
  blue: "#2563eb",
  cream: "#fff7ed",
  peach: "#fb923c",
  rose: "#fb7185",
  slate: "#475569",
  soft: "#e0f2fe",
  white: "#ffffff",
};

const full = {
  width: "100%",
  height: "100%",
};

const appear = (frame: number, fps: number, delay = 0, duration = 20) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames: duration,
    config: {damping: 200},
  });

const slideUp = (progress: number, distance: number) =>
  interpolate(progress, [0, 1], [distance, 0]);

const fade = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const BackgroundOrb = ({
  frame,
  size,
  top,
  left,
  color,
  speed,
}: {
  frame: number;
  size: number;
  top: number;
  left: number;
  color: string;
  speed: number;
}) => {
  const driftX = Math.sin(frame / (18 * speed)) * 42;
  const driftY = Math.cos(frame / (24 * speed)) * 36;

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        top,
        left,
        borderRadius: size,
        background: color,
        opacity: 0.42,
        filter: "blur(20px)",
        transform: `translate(${driftX}px, ${driftY}px)`,
      }}
    />
  );
};

const Tag = ({label, frame, delay}: {label: string; frame: number; delay: number}) => {
  const {fps} = useVideoConfig();
  const progress = appear(frame, fps, delay);

  return (
    <div
      style={{
        padding: "18px 30px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.78)",
        color: palette.ink,
        fontSize: 36,
        fontWeight: 700,
        transform: `translateY(${slideUp(progress, 26)}px) scale(${interpolate(
          progress,
          [0, 1],
          [0.92, 1],
        )})`,
        opacity: progress,
        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
      }}
    >
      {label}
    </div>
  );
};

const PhotoCard = ({
  label,
  accent,
  suit,
  frame,
  delay,
}: {
  label: string;
  accent: string;
  suit: boolean;
  frame: number;
  delay: number;
}) => {
  const {fps} = useVideoConfig();
  const progress = appear(frame, fps, delay, 24);
  const bob = Math.sin(frame / 18) * 8;

  return (
    <div
      style={{
        position: "relative",
        width: 360,
        height: 520,
        borderRadius: 40,
        overflow: "hidden",
        background: suit
          ? "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)"
          : "linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)",
        border: `4px solid ${accent}`,
        boxShadow: "0 30px 80px rgba(15, 23, 42, 0.18)",
        opacity: progress,
        transform: `translateY(${slideUp(progress, 60) + bob}px) scale(${interpolate(
          progress,
          [0, 1],
          [0.86, 1],
        )})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top, rgba(255,255,255,0.9), rgba(255,255,255,0) 50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          padding: "12px 22px",
          borderRadius: 999,
          fontSize: 26,
          fontWeight: 700,
          color: palette.white,
          background: accent,
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          left: 104,
          top: 118,
          width: 152,
          height: 152,
          borderRadius: 999,
          background: "#f8fafc",
          border: "3px solid rgba(15, 23, 42, 0.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 244,
          width: 180,
          height: 210,
          borderRadius: suit ? "90px 90px 28px 28px" : "90px 90px 48px 48px",
          background: suit
            ? "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)"
            : "linear-gradient(180deg, #ef4444 0%, #be123c 100%)",
        }}
      />
      {suit ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 113,
              top: 260,
              width: 64,
              height: 120,
              background: palette.white,
              clipPath: "polygon(0 0, 100% 0, 66% 100%, 34% 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 113,
              top: 260,
              width: 64,
              height: 120,
              background: palette.white,
              clipPath: "polygon(0 0, 100% 0, 66% 100%, 34% 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 163,
              top: 288,
              width: 34,
              height: 118,
              background: accent,
              clipPath: "polygon(50% 0, 100% 20%, 66% 100%, 34% 100%, 0 20%)",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            left: 112,
            top: 314,
            width: 136,
            height: 70,
            borderRadius: 999,
            border: "3px dashed rgba(15, 23, 42, 0.2)",
          }}
        />
      )}
    </div>
  );
};

const BulletCard = ({
  title,
  body,
  chip,
  index,
}: {
  title: string;
  body: string;
  chip: string;
  index: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = appear(frame, fps, index * 8, 18);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 270,
        padding: 34,
        borderRadius: 36,
        background: "rgba(255,255,255,0.7)",
        border: "2px solid rgba(255,255,255,0.5)",
        backdropFilter: "blur(18px)",
        opacity: progress,
        transform: `translateY(${slideUp(progress, 46)}px)`,
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          padding: "10px 18px",
          borderRadius: 999,
          background: palette.ink,
          color: palette.white,
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        {chip}
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: headlineFontFamily,
          fontSize: 46,
          lineHeight: 1.15,
          fontWeight: 700,
          color: palette.ink,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 28,
          lineHeight: 1.45,
          color: palette.slate,
        }}
      >
        {body}
      </div>
    </div>
  );
};

const HookScene = ({headline}: {headline: string}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const titleLength = Math.floor(
    interpolate(frame, [0, 1.6 * fps], [0, headline.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const headlineProgress = appear(frame, fps, 18, 28);
  const subProgress = appear(frame, fps, 42, 22);

  return (
    <AbsoluteFill style={{padding: 86, justifyContent: "space-between"}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <Tag label="Instagram Reels" frame={frame} delay={2} />
        <Tag label="TikTok向け" frame={frame} delay={8} />
      </div>
      <div>
        <div
          style={{
            fontFamily: headlineFontFamily,
            fontSize: 118,
            lineHeight: 1.05,
            fontWeight: 900,
            color: palette.ink,
            letterSpacing: "-0.05em",
            opacity: headlineProgress,
            transform: `translateY(${slideUp(headlineProgress, 40)}px)`,
          }}
        >
          {headline.slice(0, titleLength)}
          <span style={{opacity: frame % 18 < 9 ? 1 : 0, color: palette.blue}}>|</span>
        </div>
        <div
          style={{
            marginTop: 30,
            maxWidth: 760,
            fontSize: 40,
            lineHeight: 1.45,
            color: palette.slate,
            opacity: subProgress,
            transform: `translateY(${slideUp(subProgress, 28)}px)`,
          }}
        >
          私服スナップから、応募に使いやすい証明写真へ。
          <br />
          外出前にスマホだけで準備できます。
        </div>
      </div>
      <div
        style={{
          alignSelf: "flex-end",
          width: 420,
          padding: 28,
          borderRadius: 32,
          background: palette.white,
          boxShadow: "0 24px 60px rgba(37, 99, 235, 0.18)",
          opacity: fade(frame, 24, 56),
          transform: `translateY(${interpolate(frame, [24, 56], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        <div style={{fontSize: 26, color: palette.slate}}>いま欲しいのは</div>
        <div
          style={{
            marginTop: 10,
            fontSize: 48,
            lineHeight: 1.2,
            fontWeight: 800,
            color: palette.blue,
          }}
        >
          早くて、安くて、
          <br />
          ちゃんと見える写真
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TransformationScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const arrowProgress = appear(frame, fps, 24, 20);

  return (
    <AbsoluteFill style={{padding: "130px 70px 90px"}}>
      <div
        style={{
          fontFamily: headlineFontFamily,
          fontSize: 92,
          fontWeight: 800,
          lineHeight: 1.06,
          color: palette.ink,
          letterSpacing: "-0.04em",
          opacity: fade(frame, 0, 18),
        }}
      >
        私服の1枚が、
        <br />
        AIでそのまま証明写真に。
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 120,
        }}
      >
        <PhotoCard label="Before" accent={palette.peach} suit={false} frame={frame} delay={10} />
        <div
          style={{
            width: 164,
            height: 164,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)",
            color: palette.white,
            fontSize: 92,
            fontWeight: 900,
            opacity: arrowProgress,
            transform: `scale(${interpolate(arrowProgress, [0, 1], [0.6, 1])}) rotate(${interpolate(
              arrowProgress,
              [0, 1],
              [-24, 0],
            )}deg)`,
            boxShadow: "0 20px 50px rgba(34, 211, 238, 0.24)",
          }}
        >
          →
        </div>
        <PhotoCard label="After" accent={palette.blue} suit frame={frame} delay={18} />
      </div>
      <div
        style={{
          marginTop: 80,
          display: "flex",
          gap: 20,
          opacity: fade(frame, 18, 42),
        }}
      >
        <Tag label="背景を白・青・グレーに変更" frame={frame} delay={24} />
        <Tag label="顔位置を自動で調整" frame={frame} delay={30} />
      </div>
    </AbsoluteFill>
  );
};

const FeaturesScene = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{padding: "120px 64px 80px"}}>
      <div
        style={{
          fontFamily: headlineFontFamily,
          fontSize: 94,
          lineHeight: 1.08,
          fontWeight: 900,
          color: palette.ink,
          letterSpacing: "-0.05em",
          opacity: fade(frame, 0, 18),
        }}
      >
        投稿で伝わるのは、
        <br />
        この3つ。
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: 24, marginTop: 74}}>
        <BulletCard
          chip="01"
          title="スマホで撮るだけ"
          body="専用アプリ不要。ブラウザからアップして、そのまま加工まで進めます。"
          index={0}
        />
        <BulletCard
          chip="02"
          title="AIが規格に寄せて整える"
          body="背景変更、顔位置調整、トリミングを一気に処理。就活や転職の準備が早いです。"
          index={1}
        />
        <BulletCard
          chip="03"
          title="コンビニ印刷にもつなげやすい"
          body="履歴書サイズやパスポートサイズまで意識した出力導線をまとめています。"
          index={2}
        />
      </div>
    </AbsoluteFill>
  );
};

const PricingScene = ({
  serviceName,
  priceLabel,
}: {
  serviceName: string;
  priceLabel: string;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cardA = appear(frame, fps, 10, 22);
  const cardB = appear(frame, fps, 18, 22);

  return (
    <AbsoluteFill style={{padding: "130px 64px 90px"}}>
      <div
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          padding: "14px 22px",
          borderRadius: 999,
          background: palette.ink,
          color: palette.white,
          fontSize: 28,
          fontWeight: 700,
          opacity: fade(frame, 0, 14),
        }}
      >
        {serviceName}
      </div>
      <div
        style={{
          marginTop: 34,
          fontFamily: headlineFontFamily,
          fontSize: 96,
          lineHeight: 1.08,
          fontWeight: 900,
          color: palette.ink,
          letterSpacing: "-0.05em",
        }}
      >
        無料で試して、
        <br />
        必要な時だけ課金。
      </div>
      <div style={{display: "flex", gap: 28, marginTop: 88}}>
        <div
          style={{
            flex: 1,
            padding: 42,
            borderRadius: 40,
            background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.72))",
            border: "2px solid rgba(37, 99, 235, 0.12)",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
            opacity: cardA,
            transform: `translateY(${slideUp(cardA, 48)}px)`,
          }}
        >
          <div style={{fontSize: 30, color: palette.slate}}>無料プラン</div>
          <div style={{marginTop: 12, fontSize: 82, fontWeight: 900, color: palette.blue}}>¥0</div>
          <div style={{marginTop: 18, fontSize: 30, lineHeight: 1.45, color: palette.slate}}>
            背景変更
            <br />
            自動トリミング
            <br />
            透かし付きプレビュー
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: 42,
            borderRadius: 40,
            background: "linear-gradient(135deg, #2563eb 0%, #0f172a 100%)",
            boxShadow: "0 24px 60px rgba(37, 99, 235, 0.24)",
            opacity: cardB,
            transform: `translateY(${slideUp(cardB, 48)}px)`,
          }}
        >
          <div style={{fontSize: 30, color: "rgba(255,255,255,0.8)"}}>プレミアム</div>
          <div style={{marginTop: 12, fontSize: 62, fontWeight: 900, color: palette.white}}>
            1枚 300円〜
          </div>
          <div style={{marginTop: 18, fontSize: 30, lineHeight: 1.45, color: "rgba(255,255,255,0.84)"}}>
            AIスーツ着せ替え
            <br />
            高解像度保存
            <br />
            透かしなし
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 52,
          fontSize: 34,
          color: palette.slate,
          opacity: fade(frame, 18, 36),
        }}
      >
        {priceLabel}
      </div>
    </AbsoluteFill>
  );
};

const OutroScene = ({ctaLabel}: {ctaLabel: string}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const badgeProgress = appear(frame, fps, 6, 18);
  const ctaProgress = appear(frame, fps, 18, 20);
  const pulse = 1 + Math.sin(frame / 10) * 0.02;

  return (
    <AbsoluteFill
      style={{
        padding: 86,
        justifyContent: "space-between",
        background: "linear-gradient(160deg, rgba(37,99,235,0.2), rgba(34,211,238,0.06))",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignSelf: "flex-start",
          padding: "16px 24px",
          borderRadius: 999,
          background: palette.white,
          color: palette.blue,
          fontSize: 30,
          fontWeight: 800,
          boxShadow: "0 20px 50px rgba(37, 99, 235, 0.16)",
          opacity: badgeProgress,
          transform: `translateY(${slideUp(badgeProgress, 28)}px)`,
        }}
      >
        スマホ証明写真の新しい入口
      </div>
      <div>
        <div
          style={{
            fontFamily: headlineFontFamily,
            fontSize: 112,
            lineHeight: 1.04,
            fontWeight: 900,
            color: palette.ink,
            letterSpacing: "-0.05em",
            opacity: ctaProgress,
            transform: `translateY(${slideUp(ctaProgress, 34)}px)`,
          }}
        >
          {ctaLabel}
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 40,
            lineHeight: 1.45,
            color: palette.slate,
            opacity: fade(frame, 18, 34),
          }}
        >
          TikTokやInstagramでは、
          <br />
          「写真館に行く前の新常識」として見せやすい構成です。
        </div>
      </div>
      <div
        style={{
          alignSelf: "stretch",
          padding: "34px 40px",
          borderRadius: 38,
          background: palette.ink,
          color: palette.white,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 28px 70px rgba(15, 23, 42, 0.3)",
          transform: `scale(${pulse})`,
        }}
      >
        <div>
          <div style={{fontSize: 28, color: "rgba(255,255,255,0.7)"}}>CTA</div>
          <div style={{marginTop: 8, fontSize: 54, fontWeight: 900}}>
            無料で背景変更から試す
          </div>
        </div>
        <div
          style={{
            minWidth: 260,
            textAlign: "center",
            padding: "22px 26px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #22d3ee 0%, #38bdf8 100%)",
            color: palette.ink,
            fontSize: 30,
            fontWeight: 900,
          }}
        >
          Swipe Up
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SocialPromo = ({
  headline,
  serviceName,
  priceLabel,
  ctaLabel,
}: SocialPromoProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const globalOpacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        ...full,
        opacity: globalOpacity,
        fontFamily: bodyFontFamily,
        background:
          "radial-gradient(circle at top left, rgba(34, 211, 238, 0.22), rgba(34, 211, 238, 0) 28%), radial-gradient(circle at 80% 20%, rgba(251, 146, 60, 0.2), rgba(251, 146, 60, 0) 28%), linear-gradient(180deg, #f8fafc 0%, #eff6ff 55%, #fff7ed 100%)",
      }}
    >
      <BackgroundOrb frame={frame} size={280} top={90} left={-20} color="#67e8f9" speed={1} />
      <BackgroundOrb frame={frame} size={220} top={420} left={830} color="#fdba74" speed={1.3} />
      <BackgroundOrb frame={frame} size={240} top={1400} left={90} color="#93c5fd" speed={0.8} />
      <BackgroundOrb frame={frame} size={180} top={1220} left={820} color="#fda4af" speed={1.1} />

      <Sequence from={0} durationInFrames={120} premountFor={fps}>
        <HookScene headline={headline} />
      </Sequence>
      <Sequence from={96} durationInFrames={210} premountFor={fps}>
        <TransformationScene />
      </Sequence>
      <Sequence from={306} durationInFrames={234} premountFor={fps}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={540} durationInFrames={210} premountFor={fps}>
        <PricingScene serviceName={serviceName} priceLabel={priceLabel} />
      </Sequence>
      <Sequence from={750} durationInFrames={150} premountFor={fps}>
        <OutroScene ctaLabel={ctaLabel} />
      </Sequence>
    </AbsoluteFill>
  );
};
