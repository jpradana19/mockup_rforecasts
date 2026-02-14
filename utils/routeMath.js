import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

export const interpolatePoint = (p1, p2, fraction) => {
    return [
        p1[0] + (p2[0] - p1[0]) * fraction,
        p1[1] + (p2[1] - p1[1]) * fraction
    ];
}

export const splitRouteByMidnight = (points, departureStr, arrivalStr, timezone = 'UTC') => {
    if (!points || points.length < 2) return [];

    // Assuming departureStr and arrivalStr are ISO strings (e.g. 2023-10-27T10:00) 
    // representing local time in the selected timezone.
    // We strictly interpret them as "Wall Clock Time" in that timezone.

    // 1. Create zoned date objects (or UTC representations of that local time)
    // We treat the inputs as if they are already in the target timezone.
    // However, JS Date parser usually assumes local browser time or UTC if Z is present.
    // Ideally, we should parse the string parts and construct a date in that timezone.
    // For simplicity with `fromZonedTime`:
    // We take the string "2023-10-27T10:00" and say "This is 10:00 in Jakarta".

    const start = fromZonedTime(departureStr, timezone)
    const end = fromZonedTime(arrivalStr, timezone)
    const totalDuration = end.getTime() - start.getTime();

    // Default color if invalid time
    const defaultColors = ['#0ea5e9', '#f59e0b']; // Sky Blue, Amber
    if (totalDuration <= 0) return [{ coords: points, color: defaultColors[0] }];

    let totalDist = 0;
    for (let i = 0; i < points.length - 1; i++) {
        totalDist += calculateDistance(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    }

    const speed = totalDist / totalDuration; // km per ms

    const segments = [];
    let currentColorIdx = 0;

    let currentP = points[0];
    let currentTimeMs = start.getTime(); // Absolute UTC timestamp

    // Initialize first segment
    let currentSegmentCoords = [currentP];

    for (let i = 0; i < points.length - 1; i++) {
        const targetP = points[i + 1];

        // Calculate full segment properties
        const dist = calculateDistance(currentP[0], currentP[1], targetP[0], targetP[1]);
        const duration = dist / speed;
        const arrivalAtTargetMs = currentTimeMs + duration;

        let segmentStartP = currentP;
        let segmentStartTimeMs = currentTimeMs;

        // We use a loop to handle multiple midnights
        while (true) {
            // Find next midnight relative to segmentStartTime in the target timezone
            // 1. Convert absolute time to zoned time
            const zonedCurrent = toZonedTime(segmentStartTimeMs, timezone);

            // 2. Get start of next day in that zone
            const zonedNextMidnight = new Date(zonedCurrent);
            zonedNextMidnight.setDate(zonedCurrent.getDate() + 1);
            zonedNextMidnight.setHours(0, 0, 0, 0);

            // 3. Convert back to absolute UTC timestamp
            const nextMidnightMs = fromZonedTime(zonedNextMidnight, timezone).getTime();

            // If arrival at target is before next midnight, no split needed
            if (arrivalAtTargetMs <= nextMidnightMs) {
                currentSegmentCoords.push(targetP);
                currentP = targetP;
                currentTimeMs = arrivalAtTargetMs;
                break;
            } else {
                // Split needed
                const timeToTarget = arrivalAtTargetMs - segmentStartTimeMs;
                const timeToMidnight = nextMidnightMs - segmentStartTimeMs;
                const fraction = timeToMidnight / timeToTarget;

                const splitP = interpolatePoint(segmentStartP, targetP, fraction);

                // Finish current segment
                currentSegmentCoords.push(splitP);
                segments.push({
                    coords: [...currentSegmentCoords],
                    color: defaultColors[currentColorIdx % defaultColors.length]
                });

                // Switch color and start new segment
                currentColorIdx++;
                currentSegmentCoords = [splitP];

                // Advance parameters for next loop iteration
                segmentStartP = splitP;
                segmentStartTimeMs = nextMidnightMs;
            }
        }
    }

    // Push the final segment remainder
    if (currentSegmentCoords.length > 1) {
        segments.push({
            coords: [...currentSegmentCoords],
            color: defaultColors[currentColorIdx % defaultColors.length]
        });
    }

    return segments;
}

export const formatSpeed = (speedKmMs) => {
    if (!speedKmMs || isNaN(speedKmMs) || speedKmMs === Infinity) return '0.0';
    // speedKmMs is km per millisecond
    // to km/h: speed * 1000 * 3600
    // to knots: km/h / 1.852
    const kmh = speedKmMs * 3600000;
    const knots = kmh / 1.852;
    return knots.toFixed(1);
}

export const calculateSpeedVal = (points, departureStr, arrivalStr, departureZone = 'UTC', arrivalZone = 'UTC') => {
    if (!points || points.length < 2) return 0;

    // Parse strictly using zones
    const startMs = fromZonedTime(departureStr, departureZone).getTime();
    const endMs = fromZonedTime(arrivalStr, arrivalZone).getTime();

    const duration = endMs - startMs;
    if (duration <= 0) return 0;

    let totalDist = 0;
    for (let i = 0; i < points.length - 1; i++) {
        totalDist += calculateDistance(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    }
    return totalDist / duration;
}
