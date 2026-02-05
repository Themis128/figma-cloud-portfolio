const config = {
  plugins: {
    "@tailwindcss/postcss": {
      config: "./tailwind.config.ts",
    },
    // Enable CSS nesting
    "postcss-nesting": {},
    // Enable CSS custom properties
    "postcss-custom-properties": {
      preserve: true,
    },
    // Enable autoprefixer
    autoprefixer: {},
  },
};

export default config;
