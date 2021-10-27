module.exports = {
  mode: "jit",
  purge: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  darkMode: false, // or 'media' or 'class'
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
