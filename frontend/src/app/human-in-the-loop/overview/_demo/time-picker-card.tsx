/**
 * NOT from the doc page. The Code tab's `page.tsx` imports `TimePickerCard`
 * and `TimeSlot` from "./time-picker-card", which no page publishes. This
 * re-exports the repo's own card, already used by `/human-in-the-loop`
 * (`frontend/src/app/human-in-the-loop/time-picker-card.tsx`).
 */
export { TimePickerCard, type TimeSlot } from "../../time-picker-card";
