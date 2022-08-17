module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      margin: {},
      textColor: {
        primary: "#F59E0C",
      },
      colors: {
        primary: "#024F3B",
        secondary: "#707070",
        third: "#447dc3",
        fourth: "#878787",
        fifth: "#8851aa",
        yellowOne: "#F59E0C",
        disabled: "#808080b8",
      },
      backgroundImage: {
        home: "url('/src/assets/images/home.png')",
      },
      borderRadius: {
        "20%": "20%",
      },
      fontSize: {
        xxs: "0.625rem",
      },
      screens: {
        xs: "375px",
        llg: "1180px",
      },
    },
    fontFamily: {
      poppins: "Poppins",
    },
  },

  variants: {
    extend: {},
  },
  plugins: [],
};
