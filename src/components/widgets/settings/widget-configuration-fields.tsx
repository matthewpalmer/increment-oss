import type { WidgetConfig } from "../../../domain/types";

export interface WidgetConfigurationFieldsProps {
    widgetConfig?: WidgetConfig;
    onWidgetConfigChanged: (widgetConfig: WidgetConfig) => void;
}
