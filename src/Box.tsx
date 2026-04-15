import { FC, ReactNode, useContext, useEffect, useRef } from "react";
import CanvasContext, { CanvasRelationship } from "./CanvasContext";
import { Manager, Pan } from "hammerjs";
import { twMerge } from "tailwind-merge";

type BoxProps = {
    children?: ReactNode,
    className?: string,
};

type Point = {
    x: number,
    y: number,
};

const Box: FC<BoxProps> = ({children, className}) => {
    const reference = useRef<HTMLDivElement>(null);
    const position = useRef<Point>({x: 0, y: 0});
    const hammerContext = useContext(CanvasContext);
    const rightRef = useRef<HTMLDivElement>(null);
    const relationship = useRef<CanvasRelationship|null>(null);
    const relationships = useRef<Set<CanvasRelationship>>(new Set());

    useEffect(() => {
        const div = reference.current;

        if (div === null) {
            return;
        }

        let isPanAllowed = true;
        const hammer = new Manager(div);
        const pan = new Pan({threshold: 0, pointers: 0, enable: () => isPanAllowed});
        hammer.add(pan);

        hammer.on('panstart panmove', (event) => {
            if (!isPanAllowed) return;
            const x = position.current.x + event.deltaX;
            const y = position.current.y + event.deltaY;
            div.style.transform = `translate(${x}px, ${y}px)`;
            for (const relationship of relationships.current) {
                const x = relationship.from.x + event.deltaX;
                const y = relationship.from.y + event.deltaY;
                relationship.ref?.setAttribute('points', `${x},${y} ${relationship.to.x},${relationship.to.y}`);
            }
        });
        hammer.on('panend', (event) => {
            if (!isPanAllowed) return;
            position.current.x += event.deltaX;
            position.current.y += event.deltaY;
            for (const relationship of relationships.current) {
                relationship.from.x += event.deltaX;
                relationship.from.y += event.deltaY;
            }
        });

        hammerContext?.registerException(hammer);

        const hammerRight = new Manager(rightRef.current!);
        const panRight = new Pan({threshold: 0, pointers: 0});
        let lostRelationship: null | (() => void) = null;
        hammerRight.add(panRight);
        hammerRight.on('panstart panmove panend', (event) => {
            switch (event.type) {
                case 'panstart':
                    isPanAllowed = false;
                    {
                        const x = position.current.x + div.offsetWidth + div.offsetLeft;
                        const y = position.current.y + div.offsetHeight / 2 + div.offsetTop;
                        relationship.current = {from: {x: x, y: y}, to: {x: x, y: y}, ref: null};
                    }
                    hammerContext?.registerRelationship(relationship.current);
                    break;
                case 'panmove':
                    const x = relationship.current!.to.x + event.deltaX;
                    const y = relationship.current!.to.y + event.deltaY;
                    if (relationship.current?.ref?.points !== undefined) {
                        relationship.current.ref.setAttribute('points', `${relationship.current.from.x},${relationship.current.from.y} ${x},${y}`);
                    }
                    break;
                case 'panend':
                    isPanAllowed = true;
                    if (relationship.current !== null) {
                        relationship.current.to.x += event.deltaX;
                        relationship.current.to.y += event.deltaY;
                        relationships.current.add(relationship.current);
                    }
                default:
                    break;
            }
        });

        return () => {
            hammer.destroy();
            hammerRight.destroy();
        }
    }, [hammerContext?.registerException]);

    className = twMerge(
        'group relative',
        className,
    );

    return (
        <div
            className={className}
            ref={reference}
        >
            {children}

            {/* Connection Dots (hidden by default, show on parent hover) */}
            <div className="absolute inset-0 pointer-events-none hidden">
                {/* Top Dot */}
                <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 scale-0 rounded-full bg-blue-500 transition-transform group-hover:scale-100 pointer-events-auto cursor-crosshair hover:bg-blue-600" />
                
                {/* Right Dot */}
                <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 scale-0 rounded-full bg-blue-500 transition-transform group-hover:scale-100 pointer-events-auto cursor-crosshair hover:bg-blue-600" />
                
                {/* Bottom Dot */}
                <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 scale-0 rounded-full bg-blue-500 transition-transform group-hover:scale-100 pointer-events-auto cursor-crosshair hover:bg-blue-600" />
                
                {/* Left Dot */}
                <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 scale-0 rounded-full bg-blue-500 transition-transform group-hover:scale-100 pointer-events-auto cursor-crosshair hover:bg-blue-600" />
            </div>

            {/* Top Edge Trigger */}
            <div className="peer/top absolute -top-2 left-0 h-6 w-full cursor-pointer z-10" />
            <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity peer-hover/top:opacity-100 hover:opacity-100 z-20 cursor-crosshair" />

            {/* Right Edge Trigger */}
            <div className="peer/right absolute -right-2 top-0 h-full w-6 cursor-pointer z-10" />
            <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity peer-hover/right:opacity-100 hover:opacity-100 z-20 cursor-crosshair" ref={rightRef} />

            {/* Bottom Edge Trigger */}
            <div className="peer/bottom absolute -bottom-2 left-0 h-6 w-full cursor-pointer z-10" />
            <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity peer-hover/bottom:opacity-100 hover:opacity-100 z-20 cursor-crosshair" />

            {/* Left Edge Trigger */}
            <div className="peer/left absolute -left-2 top-0 h-full w-6 cursor-pointer z-10" />
            <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity peer-hover/left:opacity-100 hover:opacity-100 z-20 cursor-crosshair" />
        </div>
    );
};

export default Box;
