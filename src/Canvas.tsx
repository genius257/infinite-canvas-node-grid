import Hammer, { Pan, Recognizer } from "hammerjs";
import { createContext, FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import CanvasContext, { CanvasRelationship } from "./CanvasContext";
import { twJoin, twMerge } from 'tailwind-merge'

type CanvasProps = {
    children: ReactNode,
    className?: string,
};

type Point = {
    x: number,
    y: number,
};

type Relationship = CanvasRelationship & {id: number};

const useRelationships = (initialRelations: Set<Relationship> = new Set<Relationship>()) => {
    // const [relationships, setRelationships] = useState(initialRelations);
    const relationships = useRef<Set<Relationship>>(initialRelations);
    const [relations, setRelations] = useState(Array.from(initialRelations));
    const maxId = useRef<number>(0);

    const addRelation = useCallback((relationship: CanvasRelationship) => {
        const _relation = relationship as Relationship;
        _relation.id = maxId.current++;
        relationships.current.add(_relation);
        setRelations(Array.from(relationships.current));
    }, [setRelations]);
    const removeRelation = useCallback((relationship: Relationship) => {
        relationships.current.delete(relationship);
        setRelations(Array.from(relationships.current));
    }, [setRelations]);

    return [relations, addRelation, removeRelation] as const;
}

const Canvas: FC<CanvasProps> = ({children, className}) => {
    const outerReference = useRef<HTMLDivElement|null>(null);
    const innerReference = useRef<HTMLDivElement|null>(null);
    const position = useRef<Point>({x: 0, y: 0});
    const canvasPanRef = useRef<PanRecognizer | null>(null);
    const isPanAllowed = useRef<boolean>(true);
    const relationPoints = useRef<unknown[]>([]);
    const [relationships, addRelationship, removeRelationship] = useRelationships();
    const relationLayerRef = useRef<SVGGElement|null>(null);

    const contextValue = useMemo(() => {
        const registerRelationship = (relationship: CanvasRelationship) => {
            addRelationship(relationship);
            return () => removeRelationship(relationship as any);
        }

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

        return {registerRelationship, registerException};
    }, [addRelationship, removeRelationship]);

    useEffect(() => {
        if (outerReference.current === null || innerReference.current === null) {
            return;
        }

        const div = outerReference.current;

        if (div === null) {
            return;
        }

        const hammer = new Hammer.Manager(div);
        const pan = new Hammer.Pan({threshold: 0, pointers: 0, enable: () => isPanAllowed.current === true});
        hammer.add(pan);
        canvasPanRef.current = pan;
        let isPanning = false;
        hammer.on('panstart panmove', (event) => {
            isPanning = true;

            const x = position.current.x + event.deltaX;
            const y = position.current.y + event.deltaY;

            innerReference.current!.style.transform = `translate(${x}px, ${y}px)`;
            relationLayerRef.current!.style.transform = `translate(${x}px, ${y}px)`;
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
        <CanvasContext value={contextValue}>
            <div className={className} ref={outerReference}>
                <div className='w-full h-full' ref={innerReference}>
                    {children}
                </div>
                <svg width="100vw" height="100vh" className="absolute top-0 left-0 pointer-events-none">
                    <defs>
                        <marker
                            id="triangle"
                            viewBox="0 0 10 10"
                            refX="1"
                            refY="2.5"
                            markerUnits="strokeWidth"
                            markerWidth="10"
                            markerHeight="10"
                            orient="auto-start-reverse"
                        >
                            <path d="M 0 0 L 5 2.5 L 0 5 z" fill="red" />
                        </marker>
                        <marker
                            id="circle"
                            markerWidth="8"
                            markerHeight="8"
                            refX="4"
                            refY="4"
                        >
                            <circle cx="4" cy="4" r="2" stroke="none" fill="red" />
                        </marker>
                    </defs>
                    <g ref={relationLayerRef}>
                        {relationships.map((relationship) => (
                            <polyline
                                key={relationship.id}
                                ref={(instance) => {relationship.ref = instance}}
                                //points="128,64 150,64 150,182 128,182"
                                points={`${relationship.from.x},${relationship.from.y} ${relationship.to.x},${relationship.to.y}`}
                                fill="transparent"
                                stroke="black"
                                className="[pointer-events:stroke] stroke-2 strokedash"
                                markerStart="url(#triangle)"
                                markerMid="url(#circle)"
                                markerEnd="url(#triangle)"
                                strokeDasharray="10"
                            />))}
                    </g>
                </svg>
            </div>
        </CanvasContext>
    );
};

export default Canvas;
