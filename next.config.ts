import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable StrictMode — R3F's custom reconciler doesn't survive StrictMode's
  // double-mount/unmount cycle: Three.js geometry is added on first mount, removed
  // on unmount, then NOT re-added on the second mount. Scene appears blank.
  reactStrictMode: false,
};

export default nextConfig;
