import animate from "tailwindcss-animate";
import defaultTheme from "tailwindcss/defaultTheme";
import typography from "@tailwindcss/typography";
import { fonts } from "./src/font";

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./app/**/*.{ts,tsx,js,jsx}", "./modules/**/*.{ts,tsx,js,jsx}"],
	safelist: fonts.map((font) => `font-${font}`),
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans],
				inter: ["Inter", ...defaultTheme.fontFamily.sans],
				manrope: ["Manrope", ...defaultTheme.fontFamily.sans],
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					1: "hsl(var(--chart-1))",
					2: "hsl(var(--chart-2))",
					3: "hsl(var(--chart-3))",
					4: "hsl(var(--chart-4))",
					5: "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground":
						"hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground":
						"hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: "100%",
						color: "hsl(var(--foreground))",
						a: {
							color: "hsl(var(--primary))",
							"&:hover": {
								color: "hsl(var(--primary))",
							},
						},
						"h1,h2,h3,h4,h5,h6": {
							color: "hsl(var(--foreground))",
						},
						ul: {
							li: {
								"&::marker": {
									color: "hsl(var(--muted-foreground))",
								},
							},
						},
						ol: {
							li: {
								"&::marker": {
									color: "hsl(var(--muted-foreground))",
								},
							},
						},
					},
				},
			},
		},
	},
	plugins: [animate, typography],
};
