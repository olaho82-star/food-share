import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Listing } from '../../types';

type Category = Listing['category'];

const categoryLabels: Record<Category, string> = {
  bakery: 'Bakery',
  'fruit-veg': 'Fruit & Veg',
  dairy: 'Dairy',
  cooked: 'Cooked Food',
  other: 'Other',
};

interface Props {
  category: Category;
  active?: boolean;
}

export function CategoryTag({ category, active = false }: Props) {
  return (
    <View style={[styles.tag, active && styles.activeTag]}>
      <Text style={[styles.label, active && styles.activeLabel]}>
        {categoryLabels[category]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: Colors.paleLemon,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  activeTag: {
    backgroundColor: Colors.primaryYellow,
    borderWidth: 1,
    borderColor: Colors.goldenAmber,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.deepAmber,
  },
  activeLabel: {
    color: Colors.darkBrown,
  },
});
