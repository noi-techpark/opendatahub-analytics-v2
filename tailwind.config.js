// SPDX-FileCopyrightText: 2024 NOI Techpark <digital@noi.bz.it>
// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

/** @type {import('tailwindcss').Config} */
export default {
   purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
   content: [],
   theme: {
      extend: {
         colors: {
            green: '#50742F',
            'black-2': '#1F2328',
            white: '#FFFFFF',
            grey: '#F6F8FA',
            stroke: '#D8DEE4',
            'grey-2': '#9A9A9A',
            'grey-3': '#687182',
            'grey-input': '#6b7280',
            'green-light': '#EDF1EA',
            yellow: '#FFC000',
            gray: {
               50: '#f4f8f9',
               100: '#f1f3f4',
               200: '#efefef',
               250: '#e3e4e7',
               300: '#dcdde1',
               400: '#e0e1e5',
               600: '#707c7e',
               700: '#494d50',
               900: '#3c4043',
            },
         },
         fontFamily: {
            title: ['SourceSansPro', 'sans-serif'],
            sans: ['SourceSansPro', 'sans-serif'],
         },
         borderRadius: {
            DEFAULT: '6px',
         },
         borderColor: {
            DEFAULT: '#D8DEE4',
         },
      },
   },
   plugins: [],
}
