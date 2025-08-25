import { Button, Flex } from "@radix-ui/themes";
import type { DashboardWidget, DashboardWidgetType, Goal, Project } from "../../../domain/types"
import { GoalsListWidget } from "../widget-components/goals-list-widget";
import { ProgressBarWidget } from "../widget-components/progress-bar";
import { ProgressCircleWidget } from "../widget-components/progress-circle-widget";
import { Widget } from "./widget-grid";
import type { ComponentType, ReactNode } from "react";
import { DotsHorizontalIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { TotalTimeWidget } from "../widget-components/total-time";

export type DashboardWidgetProps = {
    dashboardWidget: DashboardWidget;
    project: Project;
    goals: Goal[];
    menuSlot: ReactNode
};

const WidgetComponentForType: Record<DashboardWidgetType, ComponentType<DashboardWidgetProps>> = {
    "goals-list": GoalsListWidget,
    "progress-bar": ProgressBarWidget,
    "progress-circle": ProgressCircleWidget,
    "total-time": TotalTimeWidget
};

interface WidgetVendorProps {
    widget: DashboardWidget;
    project: Project;
    goals: Goal[];
    onSettingsActivated: (widget: DashboardWidget, project: Project, goals: Goal[]) => void;
};

export function WidgetVendor({ widget, project, goals, onSettingsActivated }: WidgetVendorProps) {
    const WidgetComponent = WidgetComponentForType[widget.type];

    return (
        <Widget
            size={{ columns: widget.xSize, rows: widget.ySize }}
            className="bg-slate-100/60 p-4 rounded-lg">

            <WidgetComponent 
                dashboardWidget={widget} 
                project={project} 
                goals={goals}
                menuSlot={(
                    <Button 
                        size="1" 
                        radius="full" 
                        color="gray" 
                        variant="ghost"
                        onClick={(e) => {
                            e.preventDefault();
                            onSettingsActivated(widget, project, goals)
                        }}><DotsHorizontalIcon /></Button>
                )} />
        </Widget>
    );
}
