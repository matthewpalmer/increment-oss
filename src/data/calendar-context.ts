import type { Calendar } from "../domain/cadence/calendar";
import { CalendarUTC } from "../domain/cadence/utc-calendar";

// TODO: Allow for user configurable timezones/calendar
export function makeCalendar(): Calendar {
    return CalendarUTC;
}
