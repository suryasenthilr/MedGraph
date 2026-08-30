/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pagebg: '#EAF1F5',
        cardbg: '#FFFFFF',
        pine: {
          DEFAULT: '#11423F',
          dark: '#0C3331',
          light: '#1B5B57'
        },
        darkteal: '#0E3B39',
        mint: {
          DEFAULT: '#1FB6A6',
          hover: '#179E90',
          light: '#E6F8F6'
        },
        coral: {
          DEFAULT: '#E11D48',
          hover: '#BE123C',
          light: '#FFF1F2',
          badge: '#FFE4E6'
        },
        medprimary: {
          DEFAULT: '#0878B9',
          hover: '#066094',
          title: '#075A8A',
          activeBg: '#E3F2FA'
        },
        headertext: '#145A7A',
        primarytext: '#163247',
        secondarytext: '#587084',
        bordercolor: '#C9D9E4',
        medsuccess: {
          DEFAULT: '#16845B',
          light: '#E8F6F0'
        },
        medwarning: {
          DEFAULT: '#C58A00',
          light: '#FBF5E6'
        },
        mederror: {
          DEFAULT: '#C44545',
          light: '#FDF0F0'
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
