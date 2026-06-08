/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "topline.ph",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;