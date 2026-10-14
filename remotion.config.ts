import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Cloud containers block Remotion's Chrome download; reuse the preinstalled one.
const preinstalled = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (existsSync(preinstalled)) {
  Config.setBrowserExecutable(preinstalled);
}
