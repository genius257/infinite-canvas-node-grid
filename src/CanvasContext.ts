import { createContext } from "react";

export type Point = {
    x: number;
    y: number;
}

export type CanvasRelationship = {
    from: Point,
    to: Point,
    ref: SVGPolylineElement|null;
};

const CanvasContext = createContext<{
    registerException: (hammer: HammerManager) => void,
    registerRelationship: (relationship: CanvasRelationship) => () => void,
}|null>(null);

export default CanvasContext;
