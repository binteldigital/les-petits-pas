---
name: Petit Lien
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#41474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#72787f'
  outline-variant: '#c1c7cf'
  surface-tint: '#30628a'
  primary: '#30628a'
  on-primary: '#ffffff'
  primary-container: '#a2d2ff'
  on-primary-container: '#275b82'
  inverse-primary: '#9bcbf8'
  secondary: '#40627b'
  on-secondary: '#ffffff'
  secondary-container: '#bee1ff'
  on-secondary-container: '#42647e'
  tertiary: '#7c5264'
  on-tertiary: '#ffffff'
  tertiary-container: '#f4bed3'
  on-tertiary-container: '#744a5c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#9bcbf8'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#104a70'
  secondary-fixed: '#cae6ff'
  secondary-fixed-dim: '#a8cbe8'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#274a63'
  tertiary-fixed: '#ffd8e6'
  tertiary-fixed-dim: '#edb8cc'
  on-tertiary-fixed: '#301020'
  on-tertiary-fixed-variant: '#623b4c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-margin: 20px
  stack-gap: 16px
  inline-gap: 12px
  section-padding: 24px
---

## Brand & Style
The design system is centered around the concept of "Nurturing Connections." It bridges the gap between the professional structure of a childcare facility and the emotional warmth of early childhood. The target audience includes busy parents seeking updates and educators documenting milestones.

The visual style is **Soft Minimalist** with a hint of **Tactile Modernism**. It prioritizes high legibility and an interface that feels safe, approachable, and calm. By using a "Squircle" aesthetic and generous whitespace, the design system avoids the clutter of traditional social networks, focusing instead on precious moments and essential communication.

## Colors
The palette uses low-saturation pastels to maintain a serene environment.
- **Primary (Sky Blue):** Used for primary actions, brand moments, and navigation icons. It represents trust and stability.
- **Secondary (Soft Mint):** Used for highlights, success states, and secondary functional buttons.
- **Tertiary (Sand Pink/Warmth):** Reserved for emotional highlights, notifications, and "special moment" tags.
- **Neutrals:** A range of soft off-whites and cool greys ensure the interface feels airy and modern without the harshness of pure black text or pure white backgrounds.

## Typography
This design system utilizes **Quicksand** exclusively to maintain a cohesive, rounded, and welcoming character. 
- **Headlines:** Set with tight letter-spacing and bold weights to provide clear hierarchy.
- **Body Text:** Uses a medium weight (500) as the default to ensure readability against pastel backgrounds.
- **Labels:** Uppercase is avoided to keep the tone friendly; instead, weight and letter-spacing are used for distinction.

## Layout & Spacing
The layout follows a **Fluid Margin** model optimized for mobile-first interaction. 
- **Margins:** A standard 20px side margin provides a "safe zone" that feels spacious.
- **Feed Structure:** Content cards occupy the full width between margins, with vertical spacing of 16px to create a continuous but distinct stream of information.
- **Alignment:** Centralized alignment is used for onboarding and empty states, while left-alignment is the standard for feed content to support quick scanning.

## Elevation & Depth
To maintain the "Soft" aesthetic, this design system avoids harsh drop shadows.
- **Tonal Depth:** Surfaces are differentiated by subtle shifts in background color (e.g., a white card on a #F8FAFC background).
- **Soft Glows:** Where elevation is necessary (like a floating action button), use a very diffused shadow matching the color of the element (e.g., a light blue shadow for a blue button) with a 20px blur and 10% opacity.
- **Inner Borders:** Use 1px solid borders in a slightly darker shade of the background color instead of shadows for card definitions.

## Shapes
The shape language is the "Petit Lien" signature. 
- **Standard Elements:** Use a 24px radius (`rounded-xl` in this system) for all main containers and buttons.
- **Images:** Photos of children and activities should always feature the same 24px corner radius to soften the grid.
- **Interactive States:** On press, elements should slightly scale down (0.98) rather than changing color significantly, reinforcing a tactile, "squishy" feel.

## Components
- **Buttons:** Large (56px height), fully rounded (pill-shaped). Primary buttons use the Sky Blue fill with white text.
- **Feed Cards:** White background, 24px corner radius, featuring a "Header" with the child's avatar (circular), a "Content" area for photos/text, and a "Footer" for simple reactions.
- **Interaction Bar:** A simplified version of a social footer. Use heart icons for "Appreciation" and bubble icons for "Comments," utilizing the Sand Pink for active states.
- **Input Fields:** Soft grey backgrounds with 24px rounded corners. The focus state is indicated by a 2px Sky Blue border.
- **Chips/Tags:** Used for categories like "Activity," "Meal," or "Nap." These use the Secondary Mint color with a 100px radius for a pill shape.
- **Avatars:** Always circular with a 2px Sky Blue border to denote "official" school updates.
