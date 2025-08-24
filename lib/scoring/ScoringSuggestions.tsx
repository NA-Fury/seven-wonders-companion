// components/scoring/ScoringSuggestions.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { ScoringSummary } from '../../lib/scoring/advancedScoringUtils';

interface ScoringSuggestionsProps {
  summary: ScoringSummary;
  onCategoryFocus?: (category: string) => void;
}

export function ScoringSuggestions({ summary, onCategoryFocus }: ScoringSuggestionsProps) {
  const bestKey = summary.efficiency.strongestCategory as keyof ScoringSummary['categories'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scoring Insights</Text>
      </View>

      {/* Efficiency Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: '#C4A24C' }]}>Efficiency</Text>
          <Text style={styles.metricValue}>{summary.efficiency.pointsPerCategory}</Text>
          <Text style={styles.metricSubtext}>pts/category</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: '#10B981' }]}>Balance</Text>
          <Text style={styles.metricValue}>{summary.efficiency.balance}%</Text>
          <Text style={styles.metricSubtext}>strategy focus</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: '#8B5CF6' }]}>Best Category</Text>
          <Text style={[styles.metricValue, { textTransform: 'capitalize' }]}>
            {summary.efficiency.strongestCategory}
          </Text>
          <Text style={styles.metricSubtext}>
            {(summary.categories[bestKey] ?? 0)} pts
          </Text>
        </View>
      </View>

      {/* Recommendations */}
      <View>
        <Text style={styles.sectionTitle}>Strategy Recommendations</Text>

        <ScrollView style={styles.recommendationsContainer} showsVerticalScrollIndicator={false}>
          {summary.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Category Breakdown */}
      <View style={{ marginTop: 16 }}>
        <Text style={styles.breakdown}>Score Breakdown: {summary.breakdown}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(19, 92, 102, 0.2)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(243, 231, 211, 0.1)',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F3E7D3',
    marginLeft: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(196, 162, 76, 0.1)',
    borderRadius: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F3E7D3',
  },
  metricSubtext: {
    fontSize: 10,
    color: 'rgba(243, 231, 211, 0.7)',
  },
  recommendationsContainer: {
    maxHeight: 128,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(19, 92, 102, 0.1)',
    borderRadius: 6,
  },
  bullet: {
    color: '#C4A24C',
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    color: 'rgba(243, 231, 211, 0.9)',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  breakdown: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(243, 231, 211, 0.8)',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F3E7D3',
    marginBottom: 12,
  },
});
