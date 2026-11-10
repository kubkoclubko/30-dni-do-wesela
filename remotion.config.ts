import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
// GTX 1660 SUPER: ANGLE (D3D11) + concurrency 2 were fastest in the old project. `npx remotion gpu` lies ("Disabled").
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(2);
