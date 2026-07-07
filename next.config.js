/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a flat, static `out/` folder on `next build`.
  // Ready to deploy directly to Amazon S3 + CloudFront, or AWS Amplify Hosting.
  output: 'export',

  // Required alongside `output: 'export'` since Next's built-in Image
  // Optimization API needs a server, which isn't available in a static export.
  images: {
    unoptimized: true,
  },

  // Ensures routes export as /about/index.html instead of /about.html,
  // which plays more predictably with S3 static website hosting + CloudFront.
  trailingSlash: true,
};

module.exports = nextConfig;
