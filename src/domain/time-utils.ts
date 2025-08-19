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
