import { ScreenTransition } from '@/components/ScreenTransition';
import { SightCard } from '@/components/SightCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { CATEGORIES } from '@/data/categories';
import { SIGHTS } from '@/data/sights';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n, { tData } from '@/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACTIVITIES } from '@/data/activities';
import { MUSEUMS } from '@/data/museums';
import { RESTAURANTS } from '@/data/restaurants';

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { category } = useLocalSearchParams<{ category: string }>();
  const [search, setSearch] = useState('');

  // Merge all data sources and ensure they have categories
  const allItems = [
    ...SIGHTS.map(s => ({ ...s, category: 'sights' as const })),
    ...MUSEUMS.map(m => ({ ...m, category: 'museums' as const })),
    ...RESTAURANTS.map(r => ({ ...r, category: 'restaurants' as const })),
    ...ACTIVITIES.map(a => ({ ...a, category: 'activities' as const })),
  ];

  const filteredItems = allItems.filter(item => {
    const itemName = tData(item, 'name').toLowerCase();
    const itemLocation = (tData(item, 'location') || '').toString().toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = itemName.includes(searchLower) || itemLocation.includes(searchLower);

    if (!category) return matchesSearch;

    const itemCategory = (item as any).category?.toString().toLowerCase();
    const filterCategory = category.toString().toLowerCase();

    return matchesSearch && itemCategory === filterCategory;
  });

  return (
    <ScreenTransition associatedPath="/explore">
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>
                  {category ? i18n.t(category as any) : i18n.t('exploreTitle')}
                </Text>

                {/* Category Cards */}
                {/* Category Cards */}
                <View style={styles.categoriesContainer}>
                  {CATEGORIES.map(cat => {
                    const isActive = category === cat.nameKey;
                    return (
                      <Pressable
                        key={`${cat.id}-${isActive}`} // Force remount on state change
                        style={[
                          styles.categoryCard,
                          { backgroundColor: cat.color },
                          isActive && styles.categoryCardActive
                        ]}
                        onPress={() => router.setParams({ category: isActive ? '' : cat.nameKey })}
                      >
                        <View style={styles.categoryContent}>
                          <Text style={[styles.categoryText, { color: '#2D2A26' }]}>
                            {i18n.t(cat.nameKey)}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={[styles.searchBar, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <IconSymbol name="house.fill" size={20} color={theme.icon} style={{ display: 'none' }} />
                  <TextInput
                    placeholder={i18n.t('searchPlaceholder')}
                    placeholderTextColor={theme.icon}
                    style={[styles.searchInput, { color: theme.text }]}
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <SightCard
              sight={item}
              onPress={() => router.push(`/sight/${item.id}` as any)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    fontFamily: 'System',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  categoriesContainer: {
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Ensures they stick to edges with space in middle
    gap: 12, // Gap for vertical spacing (row gap)
  },
  categoryCard: {
    width: '47%', // Slightly less than 48% to be safe with rounding
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12, // Explicit bottom margin for rows
    // Background color is set dynamically per category
  },
  categoryCardActive: {
    borderWidth: 3, // Thicker border for bigger cards
    borderColor: '#2D2A26',
    transform: [{ scale: 1.02 }], // Subtle scale
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  categoryText: {
    fontWeight: '800', // Bolder text
    fontSize: 16,
    textAlign: 'center',
    zIndex: 10,
    textTransform: 'uppercase', // More stylistic
    letterSpacing: 1,
  },
});
