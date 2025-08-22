import { Grid } from "@radix-ui/themes";
import type { CSSProperties, ReactNode } from "react";

interface WidgetGridProps {
    children: ReactNode
}

export function WidgetGrid(props: WidgetGridProps) {
    return (
        <Grid columns={"4"} gap="3" style={{ gridAutoFlow: "dense" }}>
            {
                props.children
            }
        </Grid>
    )
}

export interface WidgetProps {
    children: ReactNode;
    size: { columns: number, rows: number };
    className?: string;
    borderColor?: string;
}

export function Widget(props: WidgetProps) {
    return (
        <div className={`widget ${props.className || ''}`} style={{
            "--c": props.size.columns,
            "--r": props.size.rows,
            "borderColor": props.borderColor || ''
        } as CSSProperties}>
            { props.children }
        </div>
    )
}
