import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				primary: {
					DEFAULT: '#008751', // Vert Gabon
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: '#FFD500', // Jaune Soleil
					foreground: '#333333'
				},
				accent: {
					DEFAULT: '#005293', // Bleu Océan
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#f5f5f5',
					foreground: '#333333'
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff'
				},
				border: '#e5e5e5',
				input: '#e5e5e5',
				ring: '#008751',
				background: '#ffffff',
				foreground: '#333333',
				card: {
					DEFAULT: '#ffffff',
					foreground: '#333333'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#333333'
				},
				// Couleurs spécifiques Gabon
				gabon: {
					green: '#008751',
					yellow: '#FFD500',
					blue: '#005293',
					gray: '#333333'
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
