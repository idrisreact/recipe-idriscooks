module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",    // your app code
      "./.storybook/**/*.{js,ts,jsx,tsx}"  // include your stories too
    ],
    theme: {
      extend: {
        colors: {
          primary: '#00916E',      // Green
          accent: '#FFCF00',       // Yellow
          'brand-orange': '#EE6123', // Custom Orange
          pink: '#FA003F',         // Pink
          cream: '#FEEFE5',        // Cream
        },
        animation: {
          shimmer: 'shimmer 2s linear infinite',
        },
        keyframes: {
          shimmer: {
            from: {
              transform: 'translateX(-100%)',
            },
            to: {
              transform: 'translateX(100%)',
            },
          },
        },
      },
    },
    plugins: [],
  }