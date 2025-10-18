/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Lumbus Brand Colors
        primary: {
          DEFAULT: '#2EFECC', // Primary Turquoise/Mint
          light: '#87EFFF',   // Cyan accent
          dark: '#1DCCA0',    // Darker turquoise
        },
        secondary: {
          DEFAULT: '#FDFD74', // Yellow
          light: '#FFFE9E',   // Light yellow
          dark: '#E5E54D',    // Darker yellow
        },
        accent: {
          cyan: '#87EFFF',    // Cyan
          purple: '#F7E2FB',  // Pastel purple
          mint: '#E0FEF7',    // Light mint background
          lightMint: '#F0FFFB', // Very light mint
          lightBlue: '#F0FBFF', // Very light blue
        },
        // Base colors
        background: '#FFFFFF',
        foreground: '#1A1A1A',
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#666666',
        },
        border: '#E5E5E5',
        destructive: '#EF4444',
      },
    },
  },
  plugins: [],
}
