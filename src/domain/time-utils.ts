export function IncrementDateTimeNow() {
    return (new Date).getTime();
}

export function TimeDurationToString(durationInSeconds: number) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    // const seconds = durationInSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }

    return `${minutes}m`
}

export function TimestampToLocalTime(timeIntervalSince1970: number) {
    return new Date(timeIntervalSince1970).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).toLowerCase();
}

export function TimestampToLocalDate(timeIntervalSince1970: number) {
    return new Date(timeIntervalSince1970).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function convertHoursMinutesToDuration(hours: string, minutes: string): number {
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    const safeHours = Number.isFinite(h) && h >= 0 ? h : 0;
    const safeMinutes = Number.isFinite(m) && m >= 0 ? m : 0;

    return safeHours * 3600 + safeMinutes * 60;
}

export function convertDurationToHoursMinutes(seconds: number): { hours: string; minutes: string } {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return { hours: "0", minutes: "0" };
    }

    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
        hours: hours.toString(),
        minutes: minutes.toString(),
    };
}