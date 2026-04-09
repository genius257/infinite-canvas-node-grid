import Hammer, { Pan, Recognizer } from "hammerjs";
import { FC, ReactNode, useEffect, useRef } from "react";
import HammerContext from "./HammerContext";
import { twJoin, twMerge } from 'tailwind-merge'

type CanvasProps = {
    children: ReactNode,
    className?: string,
};

type Point = {
    x: number,
    y: number,
};

const Canvas: FC<CanvasProps> = ({children, className}) => {
    const outerReference = useRef<HTMLDivElement|null>(null);
    const innerReference = useRef<HTMLDivElement|null>(null);
    const position = useRef<Point>({x: 0, y: 0});
    const canvasPanRef = useRef<PanRecognizer | null>(null);
    const isPanAllowed = useRef<boolean>(true);

    const registerException = (manager: HammerManager) => {
        manager.on('panstart panend', (event) => {
            switch (event.type) {
                case 'panstart':
                    isPanAllowed.current = false;
                    break;
                case 'panend':
                    isPanAllowed.current = true;
                    break;
                default:
                    break;
            }
        })
    }

    useEffect(() => {
        if (outerReference.current === null || innerReference.current === null) {
            return;
        }

        const div = outerReference.current;

        if (div === null) {
            return;
        }

        const hammer = new Hammer.Manager(div);
        const pan = new Hammer.Pan({threshold: 0, pointers: 0});
        hammer.add(pan);
        canvasPanRef.current = pan;
        let isPanning = false;
        hammer.on('panstart panmove', (event) => {
            if (isPanAllowed.current === false) {
                return;
            };
            isPanning = true;

            const x = position.current.x + event.deltaX;
            const y = position.current.y + event.deltaY;

            innerReference.current!.style.transform = `translate(${x}px, ${y}px)`;
            outerReference.current!.style.backgroundPosition = `${x-2}px ${y-2}px, ${x-2}px ${y-2}px, ${x-1}px ${y-1}px, ${x-1}px ${y-1}px`;
        });
        hammer.on('panend', (event) => {
            if (isPanning === false) {
                return;
            };
            isPanning = false;

            position.current.x += event.deltaX;
            position.current.y += event.deltaY;
        });

        return () => hammer.destroy();
    }, []);

    className = twJoin('bg-blueprint', twMerge('overflow-hidden', className));

    return (
        <HammerContext value={{ registerException }}>
            <div className={className} ref={outerReference}>
                <div className='w-full h-full' ref={innerReference}>
                    {children}
                </div>
            </div>
        </HammerContext>
    );
};

export default Canvas;
