import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'www.mealime.com',
				port: '',
				pathname: '/images/**',
				search: '',
			},
		],
	},
	turbopack: {
		resolveAlias: {
			'html2canvas': 'html2canvas-pro',
		},
	},
}

export default nextConfig
