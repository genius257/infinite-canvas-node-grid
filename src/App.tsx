import Canvas from './Canvas';
import Box from './Box';

function App() {
    return (
        <Canvas className='w-screen h-screen overflow-hidden'>
            <Box className='w-32 h-32 bg-blue-400 cursor-grab active:cursor-grabbing'/>
            <Box className='w-32 h-32 bg-blue-400 cursor-grab active:cursor-grabbing'/>
        </Canvas>
    );
}

export default App
