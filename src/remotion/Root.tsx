import {Composition, Folder} from "remotion";
import {z} from "zod";
import {SocialPromo, socialPromoSchema} from "./SocialPromo";
import {serviceName} from "../lib/brand";

const defaultProps = {
  headline: "その証明写真、まだ撮りに行く？",
  serviceName,
  priceLabel: "無料で背景変更 / 1枚300円でAIスーツ化",
  ctaLabel: "スマホで、30秒で、就活写真へ。",
} satisfies z.infer<typeof socialPromoSchema>;

export const RemotionRoot = () => {
  return (
    <Folder name="Marketing">
      <Composition
        id="SocialPromo"
        component={SocialPromo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        schema={socialPromoSchema}
        defaultProps={defaultProps}
      />
    </Folder>
  );
};
