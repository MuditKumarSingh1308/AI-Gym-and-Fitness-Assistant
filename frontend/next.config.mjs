/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    cpus: 1,
    workerThreads: true,
  },
};

export default nextConfig;
