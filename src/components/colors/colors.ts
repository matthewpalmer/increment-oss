import * as colorProps from "@radix-ui/themes/src/props/color.prop.ts";

export type UserColor = { hex: string; name: string };

type AccentColor = (typeof colorProps.accentColors)[number];

export const userColorsList: UserColor[] = [
    { name: 'blue', hex: '#0091ff' },
    { name: 'cyan', hex: '#05a2c2' },
    { name: 'teal', hex: '#12a594' },
    { name: 'green', hex: '#30a46c' },
    { name: 'grass', hex: '#46a758' },
    { name: 'orange', hex: '#f76808' },
    { name: 'tomato', hex: '#e54d2e' },
    { name: 'red', hex: '#e5484d' },
    { name: 'ruby', hex: '#ca244d' },
    { name: 'crimson', hex: '#e93d82' },
    { name: 'pink', hex: '#d6409f' },
    { name: 'plum', hex: '#ab4aba' },
    { name: 'purple', hex: '#8e4ec6' },
    { name: 'violet', hex: '#6e56cf' },
    { name: 'iris', hex: '#5753c6' },
    { name: 'indigo', hex: '#3e63dd' },
    { name: 'brown', hex: '#ad7f58' },
    { name: 'bronze', hex: '#7d5e54' },
    { name: 'gold', hex: '#978365' },
    { name: 'gray', hex: '#8f8f8f' },
];

export function getNameForColor(hex?: string): AccentColor {
    const color = userColorsList.find(c => c.hex.toLowerCase() === hex?.toLowerCase());

    if (!color) {
        console.log('Invalid color name given to getNameForColor', hex);
        return 'blue'
    }

    return color.name as AccentColor;
}

export function getColorForName(name?: string) {
    const color = userColorsList.find(c => c.name.toLowerCase() === name?.toLowerCase());

    if (!color) {
        console.log('Invalid color name given to getColorForName', name);
        return '#0091ff'
    }

    return color.hex;
}

export function hexToRgba(hex: string, alpha: number) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
