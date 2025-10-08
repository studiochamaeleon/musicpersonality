import { NextRequest, NextResponse } from 'next/server'

// Simple SVG generation for dynamic OG images
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const mellow = Number(searchParams.get('mellow')) || 50
  const unpretentious = Number(searchParams.get('unpretentious')) || 50
  const sophisticated = Number(searchParams.get('sophisticated')) || 50
  const intense = Number(searchParams.get('intense')) || 50
  const contemporary = Number(searchParams.get('contemporary')) || 50
  
  const topTraits = [
    { name: 'Mellow', value: mellow },
    { name: 'Unpretentious', value: unpretentious },
    { name: 'Sophisticated', value: sophisticated },
    { name: 'Intense', value: intense },
    { name: 'Contemporary', value: contemporary }
  ].sort((a, b) => b.value - a.value).slice(0, 2)

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bgGradient)"/>
      
      <!-- Radar Chart -->
      <circle cx="300" cy="315" r="120" fill="white" fill-opacity="0.1"/>
      <circle cx="300" cy="315" r="80" fill="white" fill-opacity="0.1"/>
      <circle cx="300" cy="315" r="40" fill="white" fill-opacity="0.1"/>
      
      <!-- Personality Pentagon -->
      <polygon points="300,${315 - mellow * 0.8} ${300 + sophisticated * 0.8 * 0.951},${315 - sophisticated * 0.8 * 0.309} ${300 + intense * 0.8 * 0.588},${315 + intense * 0.8 * 0.809} ${300 - contemporary * 0.8 * 0.588},${315 + contemporary * 0.8 * 0.809} ${300 - unpretentious * 0.8 * 0.951},${315 - unpretentious * 0.8 * 0.309}" 
            fill="white" fill-opacity="0.4" stroke="white" stroke-width="3"/>
      
      <!-- Title -->
      <text x="650" y="150" text-anchor="middle" fill="white" font-family="system-ui" font-size="48" font-weight="bold">My Music Personality</text>
      
      <!-- Top Traits -->
      <text x="650" y="220" text-anchor="middle" fill="white" font-family="system-ui" font-size="36" font-weight="normal">I'm ${topTraits[0].name} &amp; ${topTraits[1].name}</text>
      
      <!-- Scores -->
      <text x="650" y="300" text-anchor="middle" fill="white" font-family="system-ui" font-size="24" font-weight="300">
        Mellow: ${mellow}% • Unpretentious: ${unpretentious}% • Sophisticated: ${sophisticated}%
      </text>
      <text x="650" y="340" text-anchor="middle" fill="white" font-family="system-ui" font-size="24" font-weight="300">
        Intense: ${intense}% • Contemporary: ${contemporary}%
      </text>
      
      <!-- Call to Action -->
      <rect x="550" y="420" width="200" height="50" rx="25" fill="white" fill-opacity="0.9"/>
      <text x="650" y="450" text-anchor="middle" fill="#6366f1" font-family="system-ui" font-size="20" font-weight="bold">Take Your Own Test</text>
      
      <!-- Domain -->
      <text x="650" y="550" text-anchor="middle" fill="white" font-family="system-ui" font-size="18" font-weight="normal">music-personality-test.vercel.app</text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}