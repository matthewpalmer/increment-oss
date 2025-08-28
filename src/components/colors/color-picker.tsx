import { Flex, Box } from "@radix-ui/themes";
import { userColorsList } from "./colors";

export interface ColorPickerProps {
    selectedColor: string;
    colorChanged: (color: string) => void;
}

export function ColorPicker(props: ColorPickerProps) {
    return (
        <Flex py="1" wrap={"wrap"} maxWidth={"380px"}>
            {
                userColorsList.map(color => {
                    const isSelected = props.selectedColor === color.hex;

                    const colorTabStyle: any = { backgroundColor: color.hex };
                    const containerStyle: any = { borderColor: isSelected ? color.hex : 'transparent' }

                    return (
                        <Box key={color.hex}
                            aria-label={`Color ${color.name}`}
                            role="button"
                            tabIndex={0}
                            style={containerStyle}
                            className={`rounded-[5px] border-2 w-9 h-9 p-0.5`}
                            onClick={() => props.colorChanged(color.hex)}>
                            <div className="rounded-[2px] w-full h-full" style={colorTabStyle}>

                            </div>
                        </Box>
                    )
                })
            }
        </Flex>
    )
}