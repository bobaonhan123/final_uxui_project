import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { BorderRadius, Colors } from '../constants/theme';
import type { Section } from '../types';

type StadiumSectionMapProps = {
  sections: Section[];
  selectedSectionId?: string | null;
  onSelectSection: (sectionId: string) => void;
};

type TouchZone = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const BASE_WIDTH = 328;
const BASE_HEIGHT = 319;

const STAGE_MAP_IMAGE = require('../../assets/stage-section-map.png');

const TOUCH_ZONES: TouchZone[] = [
  { left: 127, top: 16, width: 72, height: 108 },
  { left: 128, top: 170, width: 72, height: 108 },
  { left: 198, top: 39, width: 98, height: 198 },
  { left: 32, top: 39, width: 98, height: 198 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function StadiumSectionMap({
  sections,
  selectedSectionId,
  onSelectSection,
}: StadiumSectionMapProps) {
  const { width } = useWindowDimensions();
  const mapWidth = clamp(width - 32, 300, BASE_WIDTH);
  const scale = mapWidth / BASE_WIDTH;
  const mapHeight = BASE_HEIGHT * scale;

  const availableSections = useMemo(
    () => sections.filter((section) => section.available_count > 0),
    [sections],
  );

  const touchSections = TOUCH_ZONES.map(
    (_, index) => availableSections[index % Math.max(availableSections.length, 1)],
  );

  const size = (value: number) => value * scale;

  return (
    <View style={[styles.stagePlan, { width: mapWidth, height: mapHeight }]}>
      <Image
        resizeMode="stretch"
        source={STAGE_MAP_IMAGE}
        style={[styles.stageImage, { width: mapWidth, height: mapHeight }]}
      />

      {TOUCH_ZONES.map((zone, index) => {
        const section = touchSections[index];
        if (!section) return null;

        const selected = section.id === selectedSectionId;

        return (
          <TouchableOpacity
            key={`${section.id}-${index}`}
            accessibilityLabel={`Select ${section.name}`}
            activeOpacity={0.82}
            onPress={() => onSelectSection(section.id)}
            style={[
              styles.touchZone,
              {
                left: size(zone.left),
                top: size(zone.top),
                width: size(zone.width),
                height: size(zone.height),
                borderRadius: size(18),
              },
              selected && styles.touchZoneSelected,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stagePlan: {
    alignSelf: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  stageImage: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  touchZone: {
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  touchZoneSelected: {
    backgroundColor: 'rgba(54, 162, 255, 0.14)',
    borderColor: Colors.primary,
    borderWidth: 1,
  },
});

export default StadiumSectionMap;
