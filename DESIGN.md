# DESIGN

## Design Goal

This product is an operational tool for festival staff, booth operators, and visitors. The interface must help people complete time-sensitive work with minimal reading, especially on mobile devices in a busy venue.

The visual direction is quiet, clear, and operational. Avoid marketing-style hero layouts, decorative gradients, oversized cards, and equal visual weight for every action.

## Audiences And Screens

### Visitor Guestbook

- Goal: submit a guestbook entry quickly and recover from mistakes without staff help.
- Priority information: current step, required fields, selected booth, submit status, offline/sync status.
- Layout: one focused task per screen section, large touch targets, bottom action area on small screens.
- Avoid: dense explanatory copy, long forms without progress, visual effects that distract from form completion.

### Booth Operator Dashboard

- Goal: run a booth during the event.
- Priority information: booth name, queue status, next call action, guestbook entry link, recent stats.
- Layout: status-first dashboard with primary action near the top.
- Primary action: call next guest.
- Secondary actions: open guestbook, open queue display, refresh stats.
- Utility actions: CSV, email, reset. These should be visually separated from day-of-operation actions.

### Admin Dashboard

- Goal: monitor the whole event and manage setup/data safely.
- Priority information: total participation, active booths, issue states, backup status, event/booth management.
- Layout: dense but readable. Use tabs for different jobs, not decorative sections.
- Destructive actions must be grouped separately and require confirmation.

### Public Display

- Goal: show queue or statistics from a distance.
- Priority information: current number, waiting count, booth/event name, last updated time.
- Layout: high contrast, large numbers, minimal controls.

## Information Hierarchy

1. Current operational state.
2. Next recommended action.
3. Supporting metrics.
4. Management and export utilities.
5. Rare or destructive actions.

Do not place backup, reset, email, and CSV actions beside primary booth-operation actions with the same visual weight.

## Color

- Base background: neutral light gray, not a dominant gradient.
- Primary action: blue.
- Queue/attention state: amber.
- Success: green.
- Destructive: red, used sparingly.
- Avoid single-hue screens dominated by blue/purple gradients.
- Use color to clarify state or action type, not as decoration.

## Typography

- Use the existing system font stack.
- Keep operational headings compact.
- Use large numerals only for live counts, queue numbers, and display-mode information.
- Avoid negative letter spacing in new UI.
- Labels should be short and concrete.

## Components

### Cards

- Use cards for grouped information or repeated items.
- Prefer 8px radius for new operational surfaces unless an existing component requires otherwise.
- Avoid nested cards.
- Avoid glassmorphism and heavy shadows in new work.

### Buttons

- One primary action per screen section.
- Icon buttons need visible labels unless the icon is universally clear.
- Destructive buttons must not look like normal navigation cards.
- Touch target minimum: 44px.

### Status Panels

- Use status panels for queue state, sync state, and errors.
- Status panels should include a short label, a prominent value, and a clear next action when relevant.

### Forms

- Required fields must be visually obvious.
- Error messages should say what to fix.
- Preserve entered data after validation errors.

## Layout

- Mobile first for visitor and operator flows.
- Desktop admin views can be denser, but should remain scannable.
- Keep top-level navigation sticky only when it improves operation speed.
- Use responsive grids with stable min/max widths.

## Accessibility

- Preserve semantic buttons and links.
- Keep focus states visible.
- Keep contrast sufficient for outdoor/event lighting.
- Avoid relying on color alone for status.
- Do not hide important button text on mobile if that text distinguishes actions.

## Implementation Notes

- Prefer shared CSS classes in `public/static/style.css` over new inline styles.
- When changing an existing screen, remove repeated inline styles where practical.
- Do not introduce new UI libraries unless there is a concrete need.
- Keep route and API behavior unchanged during visual-only changes.

## Verification

- Build must pass with `npm run build`.
- Check mobile width around 390px and desktop width around 1280px.
- Confirm text does not overlap or overflow buttons/cards.
- Confirm primary actions remain visible without scrolling when possible.
