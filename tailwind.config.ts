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
			padding: '1rem',
			screens: {
				'2xl': '1600px'
			}
		},
		extend: {
			colors: {
				/* Design system colors matching index.css */
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				/* Card system */
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					border: 'hsl(var(--card-border))'
				},
				
				/* Monochromatic primary accent */
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				
				/* Form elements */
				'input-border': 'hsl(var(--input-border))',
				
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			
			/* 8-point grid spacing system */
			spacing: {
				'4.5': '18px', /* 1.125rem - 18px for fine-tuning */
				'7': '28px',   /* 1.75rem - 28px */
				'9': '36px',   /* 2.25rem - 36px */
				'11': '44px',  /* 2.75rem - 44px */
				'13': '52px',  /* 3.25rem - 52px */
				'15': '60px',  /* 3.75rem - 60px */
			},
			
			/* Professional font mixture system */
			fontFamily: {
				// Headings: Modern, bold sans-serif
				'heading': ['Inter', 'Poppins', 'Montserrat', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
				// Body: Clean, readable sans-serif
				'body': ['Roboto', 'Open Sans', 'Source Sans Pro', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
				// Highlights/Buttons: Rounded, friendly sans-serif
				'highlight': ['Nunito', 'Lato', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
				// System fallback
				'system': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
			},
			
			/* Typography scale with professional sizing */
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
				'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
				'base': ['1rem', { lineHeight: '1.5', letterSpacing: '0.005em' }],
				'lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],
				'xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
				'2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
				'3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
				'4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
				'5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
				'6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
				// Professional heading sizes
				'heading-sm': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '600' }],
				'heading-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
				'heading-lg': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
				'heading-xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
				// Display sizes for hero sections
				'display-sm': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '800' }],
				'display-md': ['3rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '800' }],
				'display-lg': ['3.75rem', { lineHeight: '0.9', letterSpacing: '-0.035em', fontWeight: '900' }],
			},
			
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'recording-pulse': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.7', transform: 'scale(1.05)' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-6px)' }
				},
				'aurora': {
					'0%': { backgroundPosition: '50% 50%, 50% 50%' },
					'25%': { backgroundPosition: '70% 30%, 30% 70%' },
					'50%': { backgroundPosition: '30% 70%, 70% 30%' },
					'75%': { backgroundPosition: '60% 40%, 40% 60%' },
					'100%': { backgroundPosition: '50% 50%, 50% 50%' }
				},
				'shimmer-slide': {
					'0%': { transform: 'translate3d(-25%, -25%, 0)' },
					'100%': { transform: 'translate3d(25%, 25%, 0)' }
				},
				'spin-around': {
					'0%': { transform: 'rotate(0deg) translate(0, 0)' },
					'100%': { transform: 'rotate(360deg) translate(0, 0)' }
				}
			},
			
			animation: {
				'accordion-down': 'accordion-down 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'accordion-up': 'accordion-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'recording-pulse': 'recording-pulse 1.5s ease-in-out infinite',
				'fade-in': 'fade-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'fade-up': 'fade-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'scale-in': 'scale-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'slide-up': 'slide-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'float': 'float 3s ease-in-out infinite',
				'aurora': 'aurora 20s ease-in-out infinite',
				'shimmer-slide': 'shimmer-slide 1s ease-in-out infinite alternate',
				'spin-around': 'spin-around 2s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
