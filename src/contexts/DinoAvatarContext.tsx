import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface DinoAvatarContextType {
  dinoAvatar: string;
  dinoName: string;
  generateNewAvatar: () => void;
  isLoading: boolean;
}

const DinoAvatarContext = createContext<DinoAvatarContextType | undefined>(undefined);

interface DinoAvatarProviderProps {
  children: ReactNode;
}

export const DinoAvatarProvider: React.FC<DinoAvatarProviderProps> = ({ children }) => {
  const [dinoAvatar, setDinoAvatar] = useState<string>('');
  const [dinoName, setDinoName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateNewAvatar = useCallback(() => {
    const dinosaurNames = [
      'trex', 'stegosaurus', 'triceratops', 'velociraptor', 'brontosaurus', 
      'allosaurus', 'ankylosaurus', 'parasaurolophus', 'spinosaurus', 'diplodocus',
      'carnotaurus', 'compsognathus', 'deinonychus', 'gallimimus', 'iguanodon',
      'kentrosaurus', 'lambeosaurus', 'maiasaura', 'nodosaurus', 'ouranosaurus',
      'pachycephalosaurus', 'quetzalcoatlus', 'raptorex', 'styracosaurus', 'therizinosaurus',
      'utahraptor', 'vulcanodon', 'wannanosaurus', 'xenotarsosaurus', 'yangchuanosaurus',
      'zuniceratops', 'albertosaurus', 'baryonyx', 'ceratosaurus', 'dracorex',
      'edmontosaurus', 'fukuiraptor', 'giganotosaurus', 'herrerasaurus', 'irritator'
    ];
    
    const randomDino = dinosaurNames[Math.floor(Math.random() * dinosaurNames.length)];
    const randomSeed = Math.random().toString(36).substring(2, 8);
    const timestamp = Date.now();
    
    // Try multiple avatar styles to ensure one works
    const avatarStyles = [
      `https://api.dicebear.com/7.x/bottts/svg?seed=${randomDino}${randomSeed}${timestamp}&backgroundColor=65c3c8&radius=50`,
      `https://api.dicebear.com/7.x/identicon/svg?seed=${randomDino}${randomSeed}${timestamp}&backgroundColor=4CAF50&radius=50`,
      `https://api.dicebear.com/7.x/shapes/svg?seed=${randomDino}${randomSeed}${timestamp}&backgroundColor=2196F3&radius=50`,
      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${randomDino}${randomSeed}${timestamp}&backgroundColor=FF9800&radius=50`
    ];
    
    const dinoAvatarUrl = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    
    console.log('🦕 Generated Dino Avatar:', randomDino, dinoAvatarUrl);
    
    setIsLoading(true);
    setDinoName(randomDino);
    setDinoAvatar(dinoAvatarUrl);
    
    // Set loading to false after a short delay to allow image to load
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Generate initial avatar on mount
  React.useEffect(() => {
    generateNewAvatar();
  }, [generateNewAvatar]);

  const value: DinoAvatarContextType = {
    dinoAvatar,
    dinoName,
    generateNewAvatar,
    isLoading,
  };

  return (
    <DinoAvatarContext.Provider value={value}>
      {children}
    </DinoAvatarContext.Provider>
  );
};

export const useDinoAvatar = (): DinoAvatarContextType => {
  const context = useContext(DinoAvatarContext);
  if (context === undefined) {
    throw new Error('useDinoAvatar must be used within a DinoAvatarProvider');
  }
  return context;
};

export default DinoAvatarContext;