import type { NextConfig } from "next";
import { fireweaveDefine } from "@fireweaveai/web-sdk/define";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@clinic/ui"],
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { webpack }) => {
    config.plugins.push(new webpack.DefinePlugin(fireweaveDefine()));
    return config;
  },
};

export default nextConfig;
