import { motion, type Transition, type MotionStyle } from "motion/react";

interface RevolutionProgressRingProps {
    duration: number;
    color: string;
    trailColor: string;
    trailOpacity: number;
    strokeWidth: number;
    turns: number;
}

function circleRevolutionsPath(
    centerX: number,
    centerY: number,
    radius: number,
    turns: number,
): string {
    if (!radius || !turns) return ``;

    // Starting from startAngle, construct the path with a number of
    // half-arcs linked together to form circles,
    // and then draw the fraction of a circle remaining.

    // Always start from the top of the circle
    let angle = -Math.PI / 2;

    let x0 = centerX + radius * Math.cos(angle);
    let y0 = centerY + radius * Math.sin(angle);
    let d = `M ${x0} ${y0}`;

    // Add half arcs to the path
    const fullHalfArcs = Math.floor(turns * 2);

    for (let i = 0; i < fullHalfArcs; i++) {
        angle += Math.PI;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        d += ` A ${radius} ${radius} 0 0 1 ${x} ${y}`;
    }

    // Add remaining arc to the path
    const remainingTurnFraction = turns * 2 - fullHalfArcs;

    if (remainingTurnFraction < 0.001) {
        // Weirdness for JS floats
        return d;
    }

    const remainingAngle = remainingTurnFraction * Math.PI;
    angle += remainingAngle;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    d += ` A ${radius} ${radius} 0 0 1 ${x} ${y}`;

    return d;
}

export function RevolutionProgressRing(props: RevolutionProgressRingProps) {
    const transition: Transition = {
        duration: props.duration,
        ease: "easeInOut"
    };

    const diameter = 200;

    const pathCommand = circleRevolutionsPath(diameter / 2, diameter / 2, diameter / 2, props.turns);

    const box: MotionStyle = {
        width: props.strokeWidth + 10,
        height: props.strokeWidth + 10,
        backgroundColor: props.color,
        borderRadius: props.strokeWidth,
        position: "absolute",
        top: 0,
        left: 0,
        offsetPath: `path("${pathCommand}")`,
    };

    return (
        <div style={{ position: "relative" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={diameter} height={diameter} overflow="visible">
                <motion.path
                    d={pathCommand}
                    fill="transparent"
                    initial={{ pathLength: 0.001 }}
                    animate={{ pathLength: 1 }}
                    strokeWidth={props.strokeWidth}
                    stroke={props.trailColor}
                    strokeOpacity={props.trailOpacity}
                    strokeLinecap="round"
                    transition={transition}
                />
            </svg>

            <motion.div
                style={box}
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={transition}
            />
        </div>
    )
}