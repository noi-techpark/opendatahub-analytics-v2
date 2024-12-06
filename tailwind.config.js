/*
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
SPDX-License-Identifier: AGPL-3.0-or-later
*/

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
            'green-light': '#EDF1EA',
            yellow: '#FFC000',
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
