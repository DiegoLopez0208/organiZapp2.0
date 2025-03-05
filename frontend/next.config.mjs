/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "*.googleusercontent.com",
          port: "",
          pathname: "**",
        },
        {
          protocol: "https",
          hostname: "avatars.githubusercontent.com",
          port: "",
          pathname: "**",
        },
        {
          protocol: "https",
          hostname: "img.eldefinido.cl",
          port: "",
          pathname: "**",
        },
      ],
    },
  };
  
export default nextConfig;
  