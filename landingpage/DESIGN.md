---
version: 2.0.0
name: TutorGuide AI
description: A warm, credible design system for an AI math tutoring product. Approachable and energetic for students; trustworthy for peer tutors. Uses rounded geometry, high-contrast pastels, and a "fun but credible" tone.
colors:
  primary-blue: "#5BC0EB"
  primary-yellow: "#FFD93D"
  primary-pink: "#FF8FAB"
  accent-green: "#6EE7B7"
  text-dark: "#2B2B2B"
  bg-light: "#FAFAFA"
  surface-white: "#FFFFFF"
  border-light: "#F1F5F9"
typography:
  heading:
    family: "'Fredoka', sans-serif"
    weights:
      normal: 400
      medium: 500
      semibold: 600
  body:
    family: "'Nunito', sans-serif"
    weights:
      normal: 400
      medium: 500
      bold: 700
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  hero: "128px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
  blob: "3rem"
components:
  navbar:
    position: "fixed"
    blur: "md"
    z-index: 50
  button:
    rounding: "full"
    hover: "scale-105"
    shadow: "lg"
  card:
    rounding: "2rem"
    padding: "2rem"
    hover: "-translate-y-2"
  badge:
    rounding: "full"
    weight: "bold"
    size: "xs"
motion:
  float: "6s ease-in-out infinite"
  wiggle: "0.5s ease-in-out infinite"
  transition: "300ms ease-in-out"
---
## Overview
The TutorGuide AI visual system prioritizes approachability and credibility through soft geometry and a primary-adjacent palette. It communicates warmth to students while signaling trust and competence to peer tutors and educators.

## Colors
The palette uses a "High-Contrast Pastel" approach.
- **Primary Blue (#5BC0EB)**: Stability and trust.
- **Primary Yellow (#FFD93D)**: Energy and optimism.
- **Primary Pink (#FF8FAB)**: Creativity and nurture.
- **Accent Green (#6EE7B7)**: Growth and safety.
- Use **#2B2B2B** for readability rather than pure black to maintain softness.

## Typography
- **Headings**: Fredoka is used for its rounded, organic letterforms. Use for all H1-H6.
- **Body**: Nunito provides high legibility at small sizes.
- Tracking: Use `tracking-tight` for large headings to maintain a compact, friendly feel.

## Spacing
Standard 4px/8px grid. Large vertical padding (80px to 128px) is required between major landing sections to provide "breathing room" and reduce cognitive load for busy parents.

## Layout
- **Layering**: High use of background blur (backdrop-filter) for navigation and foreground cards.
- **Depth**: Three distinct layers:
  1. **Background**: Gradient washes and blurred decorative blobs.
  2. **Midground**: White surface cards with subtle borders.
  3. **Foreground**: Floating badges and CTA buttons with high-offset shadows.

## Elevation & Depth
- **Soft Shadows**: Use colored shadows (e.g., `shadow-pink-200`) instead of neutral grays to maintain the vibrant aesthetic.
- **Z-Index Strategy**: Sticky Header (50) > Floating Badges (40) > Main Content (10) > Decorative Blobs (-10).

## Shapes
- **Extreme Rounding**: Standard rounding is 16px. Major feature cards use `2rem` (32px).
- **Asymmetric Geometry**: Hero images use alternating rotations (3deg / -2deg) to create a scrap-booked, playful feel.
- **Blobs**: Use blurred overflow circles in background layers.

## Components
- **Action Buttons**: Always rounded-full. Primary CTA uses Pink; Secondary uses Blue.
- **Class Cards**: Features an image header with an absolute-positioned "Age Badge" in the top-left corner.
- **Activity Circles**: Large icon containers (96px) that use a `wiggle` animation on parent hover.
- **Testimonial Slider**: Uses `snap-x` horizontal scrolling with no-scrollbar for mobile-first touch interaction.

## Motion
- **Hover States**: Every interactive element must have a `scale-105` or `-translate-y-2` transition.
- **Micro-interactions**: Use `wiggle` on icons to signify playfulness.
- **Ambient Motion**: Hero assets use a `float` keyframe (15px vertical travel) to keep the page feeling alive.

## Do's and Don'ts
- **Do**: Use iconify-icon for consistent 1.5pt stroke weight.
- **Do**: Apply `selection:bg-[#5BC0EB]` for a branded text-selection experience.
- **Don't**: Use sharp 90-degree corners on any visible container.
- **Don't**: Use dark/heavy shadows; prefer light, translucent colored glows.

## Accessibility
- Maintain a minimum 4.5:1 contrast ratio for all body text on colored backgrounds.
- Ensure all icon buttons have hidden descriptive text for screen readers.
- Interactive cards must have visible focus states using the Primary Blue color.