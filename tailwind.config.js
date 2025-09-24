/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    fontFamily: {
      sans: ['Inter', 'Segoe UI', 'Roboto', 'system-ui', '-apple-system', 'Helvetica', 'Arial', 'sans-serif'],
    },
  },
};
export const plugins = [];