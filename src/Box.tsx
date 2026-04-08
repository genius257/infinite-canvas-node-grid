import { FC, ReactNode, useContext, useEffect, useRef } from "react";
import HammerContext from "./HammerContext";
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
    const reference = useRef<HTMLDivElement|null>(null);
    const position = useRef<Point>({x: 0, y: 0});
    const hammerContext = useContext(HammerContext);

    useEffect(() => {
        const div = reference.current;

        if (div === null) {
            return;
        }

        const hammer = new Manager(div);
        const pan = new Pan({threshold: 0, pointers: 0});
        hammer.add(pan);

        hammer.on('panstart panmove', (event) => {
            const x = position.current.x + event.deltaX;
            const y = position.current.y + event.deltaY;
            div.style.transform = `translate(${x}px, ${y}px)`;
        });
        hammer.on('panend', (event) => {
            position.current.x += event.deltaX;
            position.current.y += event.deltaY;
        });

        hammerContext?.registerException(hammer);

        return () => hammer.destroy();
    }, [hammerContext?.registerException]);

    className = twMerge(
        'group relative',
        className,
    );

    const registerException = (hammer: HammerManager) => {
        //
    }

    return (
        <HammerContext value={{registerException}}>
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
                <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity peer-hover/right:opacity-100 hover:opacity-100 z-20 cursor-crosshair" />

                {/* Bottom Edge Trigger */}
                <div className="peer/bottom absolute -bottom-2 left-0 h-6 w-full cursor-pointer z-10" />
                <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity peer-hover/bottom:opacity-100 hover:opacity-100 z-20 cursor-crosshair" />

                {/* Left Edge Trigger */}
                <div className="peer/left absolute -left-2 top-0 h-full w-6 cursor-pointer z-10" />
                <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity peer-hover/left:opacity-100 hover:opacity-100 z-20 cursor-crosshair" />
            </div>
        </HammerContext>
    );
};

export default Box;
