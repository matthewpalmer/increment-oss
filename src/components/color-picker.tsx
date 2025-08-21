import { Flex, Box } from "@radix-ui/themes";
import { useCallback } from "react";

export const ColorPickerColors = [
    "#3E63DD", // Cobalt (default)
    "#E5484D", // Red
    "#F76B15", // Orange
    "#F5D90A", // Yellow
    "#46A758", // Green
    "#2BB0ED", // Blue
    "#1D4ED8", // Dark Blue
    "#0090A7", // Teal
    "#8E4EC6", // Purple
    "#E93D82", // Pink
    "#9BA1A6", // Neutral (Gray)
];

export interface ColorPickerProps {
    selectedColor: string;
    colorChanged: (color: string) => void;
}

export function ColorPicker(props: ColorPickerProps) {
    return (
        <Flex py="1">
            {
                ColorPickerColors.map(color => {
                    const isSelected = props.selectedColor === color;
                    
                    const colorTabStyle: any = { backgroundColor: color };
                    const containerStyle: any = { borderColor: isSelected ? color : 'transparent' }

                    return (
                        <Box key={color} 
                            style={containerStyle}
                            className={`rounded-[5px] border-2 w-9 h-9 p-0.5`}
                            onClick={() => props.colorChanged(color)}>
                                <div className="rounded-[2px] w-full h-full" style={colorTabStyle}>

                                </div>
                        </Box>
                    )
                })
            }
        </Flex>
    )
}