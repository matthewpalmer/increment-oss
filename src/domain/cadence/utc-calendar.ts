import type { Calendar } from "./calendar";

export const CalendarUTC: Calendar = {
    timezoneKey: "UTC",

    startOfDay(date) {
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    },

    startOfISOWeek(date) {
        const day = date.getUTCDay() || 7;
        const startOfDay = this.startOfDay(date);
        return this.addDays(startOfDay, -(day - 1))
    },

    startOfMonth(date) {
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
    },

    addDays(date, numberOfDays) {
        const result = new Date(date);
        result.setUTCDate(result.getUTCDate() + numberOfDays);
        return result;
    },

    dayOfWeek(date) {
        return date.getUTCDay();
    },

    dayOfMonth(date) {
        return date.getUTCDate();
    },

    monthOfYear(date) {
        return date.getUTCMonth();
    },

    addMonths(date, numberOfMonths) {
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + numberOfMonths, 1))
    },

    now() {
        return new Date()
    },

    windowForCadence(cadence, at, startOfLifetime?: Date) {
        if (cadence === 'daily') {
            const start = this.startOfDay(at);
            const end = this.addDays(start, 1);
            return { start, end };
        }

        if (cadence === 'weekly') {
            const start = this.startOfISOWeek(at);
            const end = this.addDays(start, 7);
            return { start, end };
        }

        if (cadence === 'monthly') {
            const start = this.startOfMonth(at);
            const end = this.addMonths(start, 1);
            return { start, end };
        }

        if (cadence === 'lifetime') {
            if (!startOfLifetime) throw new Error('windowForCadence requires startOfLifetime for lifetime cadences')
            return { start: startOfLifetime, end: at }
        }

        throw new Error('Unsupported cadence')
    },
}