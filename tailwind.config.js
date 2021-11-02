module.exports = {
  mode: "jit",
  purge: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  darkMode: 'media',
  theme: {
    extend: {
      width: {
        "3xl": "48rem",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
