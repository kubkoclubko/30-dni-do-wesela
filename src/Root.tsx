import { Composition } from "remotion";
import { Episode } from "./Episode";
import type { Episode as Ep } from "./types";

// Every episodes/epXX.json becomes a composition "epXX" automatically: a new episode needs no code change.
const load = (ctx: __WebpackModuleApi.RequireContext) => ctx.keys().map((k) => ctx(k) as Ep);
const episodes = load(require.context("../episodes", false, /^\.\/ep\d+\.json$/));

const FPS = 30;

export const Root: React.FC = () => (
  <>
    {episodes.map((ep) => (
      <Composition
        key={ep.id}
        id={ep.id}
        component={Episode}
        durationInFrames={Math.round(ep.durationSec * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ ep }}
      />
    ))}
  </>
);
