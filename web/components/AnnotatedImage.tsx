import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';

export type Annotation = {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  label: string;
  pointerDirection?: 'left' | 'right' | 'up' | 'down';
};

interface Props {
  source: ImageSourcePropType;
  annotations: Annotation[];
  aspectRatio?: number;
}

export default function AnnotatedImage({ source, annotations, aspectRatio = 1 }: Props) {
  return (
    <View style={[styles.container, { aspectRatio }]}>
      <Image source={source} style={styles.image} resizeMode="contain" />
      
      {annotations.map((ann) => (
        <View 
          key={ann.id} 
          style={[
            styles.annotationWrapper, 
            { left: `${ann.x}%`, top: `${ann.y}%` }
          ]}
        >
          {/* Target Dot */}
          <View style={styles.dot} />
          
          {/* Label Container */}
          <View style={[
            styles.labelContainer,
            (!ann.pointerDirection || ann.pointerDirection === 'right') && styles.labelRight,
            ann.pointerDirection === 'left' && styles.labelLeft,
            ann.pointerDirection === 'up' && styles.labelUp,
            ann.pointerDirection === 'down' && styles.labelDown,
          ]}>
            <Text style={styles.labelText}>{ann.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    marginVertical: 16,
    backgroundColor: '#022C1A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  annotationWrapper: {
    position: 'absolute',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D4AF37',
    borderWidth: 2.5,
    borderColor: '#ECFDF5',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  labelContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(3,53,33,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  labelText: {
    color: '#ECFDF5',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  labelLeft: { right: 20 },
  labelRight: { left: 20 },
  labelUp: { bottom: 20 },
  labelDown: { top: 20 },
});
