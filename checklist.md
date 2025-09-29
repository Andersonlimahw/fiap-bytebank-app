ByteBank App — Cards Feature Checklist

- [x] Empty state banner on My Cards
  - Shows themed banner when user has no cards
  - Uses i18n strings for title, description, and action

- [x] Digital card flip (front/back)
  - Tap flips between card front and back
  - Smooth Animated rotation + subtle press scale
  - Back shows brand name, flag (logo), and holder name
  - Labels use i18n; colors respect theme

- [x] New card form i18n + theme pass
  - All labels and placeholders localized
  - Error messages localized (invalid number, invalid CVV)
  - Buttons use i18n and theme colors

- [ ] Additional polish
  - Add haptic feedback on flip (requires dependency)
  - Localize brand options list if desired
  - Mask number on change with better BIN formatting

Notes
- Did not change `./src/infrastructure/firebase/firebase.ts` as requested.
- Existing repositories (Mock/Firebase) remain intact; UI adapts to empty state automatically.
