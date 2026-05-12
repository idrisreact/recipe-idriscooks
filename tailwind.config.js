module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./app/**/*.{js,jsx,ts,tsx}",
      "./.storybook/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          cream: '#F5EFE6',
          parchment: '#E8DFD0',
          ink: '#1C1A17',
          tomato: '#C8472D',
          peach: '#F5B7A3',
          olive: '#6B7548',
        },
        fontFamily: {
          serif: ['var(--font-serif)', 'Georgia', 'serif'],
          sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
          mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        },
      },
    },
    plugins: [],
  }
