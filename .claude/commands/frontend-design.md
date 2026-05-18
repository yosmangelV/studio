Load the skill at `.agents/skills/frontend-design/SKILL.md` and apply it in the context of this Angular design system.

## Context for this project

This is a design system (not a consumer app), so the aesthetic direction applies to **Storybook stories and the components themselves**, not a full page. When the user asks to design or refine a component:

1. **Read** the existing component files (`.ts`, `.html`, `.scss`)
2. **Apply** the frontend-design skill principles: bold aesthetic direction, distinctive typography via CSS variables, intentional motion, spatial composition
3. **Constraints to respect** (from CLAUDE.md):
   - Angular standalone components
   - Design tokens from `tokens.scss` (CSS custom properties)
   - Dark mode support required
   - WCAG AA accessibility
   - SCSS with BEM for component styles
   - Tailwind for layout utilities in templates
4. **Update** the Storybook story to showcase the design decisions

Also load `.agents/skills/tailwind-css-patterns/SKILL.md` for layout and responsive utilities.

## What to deliver

- Updated component files with refined styles
- Dark mode variant using `@media (prefers-color-scheme: dark)` and `.dark` class
- Updated story with an `AllVariants` showcase
- Brief explanation of the aesthetic choices made
