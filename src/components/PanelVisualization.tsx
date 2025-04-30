import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';

interface SolarPanelProps {
    condition?: 'good' | 'dusty' | 'damaged' | 'normal';
    temperature?: number;
}

const SolarPanel: React.FC<SolarPanelProps> = ({ condition = 'good', temperature = 25 }) => {
    // Define different colors based on panel condition
    const panelColors = {
        good: '#2196f3',
        dusty: '#bf9b30',
        damaged: '#f44336',
        normal: '#64b5f6'
    };

    const panelColor = panelColors[condition] || panelColors.normal;

    return (
        <>
            {/* Panel frame */}
            <mesh position={[0, 0, -0.1]}>
                <boxGeometry args={[5.2, 3.2, 0.1]} />
                <meshStandardMaterial color="#666" />
            </mesh>
            
            {/* Solar cells */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[5, 3, 0.05]} />
                <meshPhongMaterial 
                    color={panelColor}
                    shininess={100}
                    specular="#ffffff"
                />
            </mesh>

            {/* Temperature visualization overlay */}
            <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[5, 3]} />
                <meshPhongMaterial 
                    color="#ff0000"
                    opacity={temperature > 40 ? 0.3 : temperature > 30 ? 0.2 : 0.1}
                    transparent
                    depthWrite={false}
                />
            </mesh>
        </>
    );
};

const PanelVisualization: React.FC = () => {
    const [viewMode, setViewMode] = useState('normal');
    const [panelCondition, setPanelCondition] = useState('good');
    const [temperature, setTemperature] = useState(25);

    return (
        <div style={{ height: '500px', width: '100%' }}>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                <FormControl size="small">
                    <InputLabel>View Mode</InputLabel>
                    <Select
                        value={viewMode}
                        label="View Mode"
                        onChange={(e) => setViewMode(e.target.value)}
                        style={{ minWidth: 120 }}
                    >
                        <MenuItem value="normal">Normal</MenuItem>
                        <MenuItem value="thermal">Thermal</MenuItem>
                        <MenuItem value="efficiency">Efficiency</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small">
                    <InputLabel>Panel Condition</InputLabel>
                    <Select
                        value={panelCondition}
                        label="Panel Condition"
                        onChange={(e) => setPanelCondition(e.target.value)}
                        style={{ minWidth: 120 }}
                    >
                        <MenuItem value="good">Good</MenuItem>
                        <MenuItem value="dusty">Dusty</MenuItem>
                        <MenuItem value="damaged">Damaged</MenuItem>
                    </Select>
                </FormControl>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Typography variant="body2">Temperature:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                        {temperature}°C
                    </Typography>
                </div>
            </div>

            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                
                <SolarPanel condition={panelCondition as 'good' | 'dusty' | 'damaged' | 'normal'} temperature={temperature} />
                
                <OrbitControls 
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    minDistance={3}
                    maxDistance={10}
                />
            </Canvas>
        </div>
    );
};

export default PanelVisualization; 