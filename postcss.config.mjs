/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "tailwindcss/nesting": "postcss-nesting",
    tailwindcss: {},
  },
};

export default config;
