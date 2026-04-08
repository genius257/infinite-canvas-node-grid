import { createContext } from "react";

const HammerContext = createContext<{
    registerException: (hammer: HammerManager) => void,
}|null>(null);

export default HammerContext;
