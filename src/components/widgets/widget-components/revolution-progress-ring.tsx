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
    startAngle: number = -Math.PI / 2 // By default start from the top
): string {
    if (!radius || !turns) return ``;

    // Starting from startAngle, construct the path with a number of
    // half-arcs linked together to form circles,
    // and then draw the fraction of a circle remaining.

    let angle = startAngle;

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
    const diameter = 200;

    const transition: Transition = {
        duration: props.turns ? props.duration : 0,
        ease: "easeInOut"
    };

    const pathCommand = circleRevolutionsPath(diameter / 2, diameter / 2, diameter / 2, props.turns ? props.turns : 1);
    const fullCircle = circleRevolutionsPath(diameter / 2, diameter / 2, diameter / 2, 2);

    const box: MotionStyle = {
        width: props.strokeWidth + 10,
        height: props.strokeWidth + 10,
        backgroundColor: props.color,
        borderRadius: props.strokeWidth,
        position: "absolute",
        top: 0,
        left: 0,
        offsetPath: `path("${pathCommand}")`,
        boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.1)',
    };

    return (
        <div style={{ position: "relative" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={diameter} height={diameter} overflow="visible">
                <motion.path
                    d={fullCircle}
                    fill="transparent"
                    strokeWidth={props.strokeWidth}
                    stroke={'rgba(120, 120, 150, 0.1)'}
                    strokeOpacity={1}
                    strokeLinecap="round"
                />

                {
                    props.turns
                    ? (
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
                    )
                    : null
                }
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