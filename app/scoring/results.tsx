// app/scoring/results.tsx - Minimal results screen (restored) with header and proportional podium
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { router } from 'expo-router';
import { usePlayerStore } from '../../store/playerStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScoringStore } from '../../store/scoringStore';
import { useSetupStore } from '../../store/setupStore';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import { evaluateBadgesForContext } from '../../data/badges';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0E1A' },
  scrollContent: { paddingBottom: 100 },
  header: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(196,162,76,0.3)', overflow: 'hidden' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FEF3C7', marginBottom: 6 },
  subtitle: { fontSize: 12, color: 'rgba(243,231,211,0.7)' },
  watermark: { position: 'absolute', top: 10, right: -20, fontSize: 72, color: 'rgba(196,162,76,0.08)', fontWeight: '900', transform: [{ rotate: '-10deg' }] },
  catchphrase: { fontSize: 14, color: '#C4A24C', fontStyle: 'italic', textAlign: 'center', marginBottom: 6 },
  winnerLine: { fontSize: 16, color: '#FEF3C7', fontWeight: 'bold', marginBottom: 4 },
  victoryPhrase: { fontSize: 13, color: 'rgba(243,231,211,0.9)', textAlign: 'center' },
  podiumContainer: { paddingVertical: 20, paddingHorizontal: 16, alignItems: 'center' },
  podiumRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: 200 },
  podiumPlace: { alignItems: 'center', marginHorizontal: 10 },
  podiumBar: { width: 80, borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 },
  placeNumber: { fontSize: 22, fontWeight: 'bold', color: '#0F0E1A', marginBottom: 4 },
  podiumName: { fontSize: 13, fontWeight: 'bold', color: '#0F0E1A', marginTop: 8, textAlign: 'center' },
  podiumScore: { fontSize: 18, fontWeight: 'bold', color: '#0F0E1A' },
  rankingsContainer: { paddingHorizontal: 16, marginTop: 16 },
  rankingCard: { backgroundColor: 'rgba(31,41,55,0.5)', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(196,162,76,0.2)' },
  rankingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftRow: { flexDirection: 'row', alignItems: 'center' },
  rankNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(196,162,76,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rankText: { fontSize: 16, fontWeight: 'bold', color: '#C4A24C' },
  playerName: { fontSize: 16, fontWeight: '600', color: '#F3E7D3' },
  scoreText: { fontSize: 22, fontWeight: 'bold', color: '#FEF3C7' },
  actionButtons: { paddingHorizontal: 16, paddingVertical: 20, gap: 12 },
  actionButton: { backgroundColor: '#C4A24C', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#C4A24C' },
  actionButtonText: { fontSize: 16, fontWeight: 'bold', color: '#0F0E1A' },
  secondaryButtonText: { color: '#C4A24C' },
});

export default function ResultsScreen() {
  const { players } = useSetupStore();
  const { getLeaderboard, getCategoryBreakdown, getAllTotals, completeScoring, gameMetadata } = useScoringStore();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const leaderboard = useMemo(() => getLeaderboard(), [getLeaderboard]);
  const winner = leaderboard[0];

  const handleSave = () => {
    try {
      // Persist game to history
      const setup = useSetupStore.getState();
      const totals = getAllTotals();
      const ranks: Record<string, number> = {};
      leaderboard.forEach((e) => (ranks[e.playerId] = e.rank));
      const scores: Record<string, number> = {};
      Object.entries(totals).forEach(([pid, total]) => (scores[pid] = total));

      // Build history entry (expanded for analytics)
      const playerOrder = setup.getOrderedPlayers().map((p) => p.id);
      const wondersForHistory = setup.getAssignedWonders();
      const perPlayerBreakdowns: Record<string, any> = {};
      players.forEach((p) => { perPlayerBreakdowns[p.id] = getCategoryBreakdown(p.id); });

      // Compute per-player badges (for analytics/history)
      const badgesAwarded: Record<string, string[]> = {};
      players.forEach((p) => {
        const w = wondersForHistory[p.id];
        const leadersPicked: string[] = (() => {
          try {
            const st = useScoringStore.getState();
            const dd = st.playerScores?.[p.id]?.categories?.leaders?.detailedData || {};
            return Array.isArray(dd.selectedLeaders) ? dd.selectedLeaders : [];
          } catch { return []; }
        })();
        const ctx = {
          playerId: p.id,
          rank: ranks[p.id] || 0,
          score: scores[p.id] || 0,
          breakdown: perPlayerBreakdowns[p.id] || {},
          expansions: setup.expansions,
          wonderBoardId: w?.boardId,
          playerCount: players.length,
          leadersRecruited: leadersPicked,
        } as const;
        badgesAwarded[p.id] = evaluateBadgesForContext(ctx).map((b) => b.id);
      });

      // Build slimmer history entry (omit heavy analytics)
      const historyEntrySlim = {
        date: new Date(),
        players: players.map((p) => p.name),
        playerOrder,
        expansions: setup.expansions,
        winner: winner?.playerId,
        scores,
        ranks,
        wonders: wondersForHistory,
        edificeProjects: setup.edificeProjects,
        duration: gameMetadata?.endTime && gameMetadata?.startTime
          ? Math.round(((new Date(gameMetadata.endTime).getTime() - new Date(gameMetadata.startTime).getTime()) / 1000) / 60)
          : undefined,
        metadata: { gameNumber: (gameMetadata as any)?.gameNumber },
      } as const;

      // Show spinner and defer writes to keep UI snappy
      setIsSaving(true);
      setTimeout(() => {
        setup.addGameToHistory(historyEntrySlim);

        const writePlayers = () => {
          usePlayerStore.getState().recordGameResult({
            gameId: `${(gameMetadata as any)?.gameNumber ?? Date.now()}`,
            date: new Date().toISOString(),
            playerOrder,
            scores,
            ranks,
            expansions: setup.expansions,
            wonders: Object.fromEntries(
              playerOrder.map((pid) => [pid, { boardId: wondersForHistory[pid]?.boardId, side: wondersForHistory[pid]?.side } as any])
            ),
            categoryBreakdowns: perPlayerBreakdowns,
            badgesAwarded,
          });

          completeScoring();
          setIsSaving(false);
          Alert.alert('Saved', 'Game results saved. Returning to Home.', [
            { text: 'OK', onPress: () => router.replace('/') },
          ]);
        };

        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => setTimeout(writePlayers, 0));
        } else {
          setTimeout(writePlayers, 0);
        }
      }, 0);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save results.');
    }
  };

  const handleShare = () => {
    Alert.alert('Share', 'Sharing coming soon.');
  };

  const header = (() => {
    if (!winner) return null;
    const { wonders } = useSetupStore.getState();
    const info = wonders[winner.playerId];
    const wonderMeta = (() => {
      if (!info?.boardId) return { name: '', side: '' };
      const w = WONDERS_DATABASE.find(x => x.id === info.boardId);
      return { name: w?.name || info.boardId, side: info.side || '' };
    })();
    const catchByWonder: Record<string, string> = {
      Alexandria: "Inspired by the Lighthouse's guiding light.",
      Babylon: "Wisdom flows from the Hanging Gardens.",
      Gizah: "Pyramids stand witness to this triumph.",
      Halikarnassos: "Legends carved in marble endure.",
      Olympia: "Victory crowned by the gods.",
      Rhodes: "The Colossus salutes this feat.",
      Byzantium: "Diplomacy and might in perfect harmony.",
      Petra: "Carved in stone, sealed in glory.",
      Roma: "All roads lead to this victory.",
    };
    const key = Object.keys(catchByWonder).find(k => wonderMeta.name.toLowerCase().includes(k.toLowerCase()));
    const catchphrase = key ? catchByWonder[key] : '';
    return (
      <>
        {!!key && <Text style={styles.watermark}>{key}</Text>}
        <Text style={styles.title}>Game #{gameMetadata?.gameNumber} Results</Text>
        {!!catchphrase && <Text style={styles.catchphrase}>{catchphrase}</Text>}
        <Text style={styles.winnerLine}>
          Winner: {players.find(p => p.id === winner.playerId)?.name} - {winner.total} pts
        </Text>
        {!!wonderMeta.name && (
          <Text style={styles.subtitle}>
            {wonderMeta.name} ({wonderMeta.side === 'night' ? 'Night' : 'Day'})
          </Text>
        )}
      </>
    );
  })();

  const gameStats = useMemo(() => {
    const totals = Object.values(getAllTotals());
    const total = totals.reduce((s, n) => s + n, 0);
    const average = totals.length > 0 ? Math.round(total / totals.length) : 0;
    const highest = Math.max(0, ...totals);
    const lowest = Math.min(0, ...totals);
    const spread = highest - lowest;
    const durationMin = gameMetadata?.endTime && gameMetadata?.startTime
      ? Math.round((new Date(gameMetadata.endTime).getTime() - new Date(gameMetadata.startTime).getTime()) / 60000)
      : null;
    return { average, highest, lowest, spread, durationMin };
  }, [getAllTotals, gameMetadata?.startTime, gameMetadata?.endTime]);

  // Note: handleSave and handleShare are defined earlier; remove duplicates here.

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>{header}{<Text style={styles.subtitle}>{new Date().toLocaleDateString()}  {players.length} Players</Text>}</View>

        {/* Podium */}
        {leaderboard.length >= 3 && (
          <View style={styles.podiumContainer}>
            <View style={styles.podiumRow}>
              {/* 2nd */}
              <View style={styles.podiumPlace}>
                <Text style={styles.podiumName}>{players.find(p => p.id === leaderboard[1].playerId)?.name}</Text>
                <View style={[styles.podiumBar, { backgroundColor: '#C0C0C0', height: 90 + Math.round((leaderboard[1].total / leaderboard[0].total) * 70) }]}>
                  <Text style={styles.placeNumber}>2nd</Text>
                  <Text style={styles.podiumScore}>{leaderboard[1].total}</Text>
                </View>
              </View>
              {/* 1st */}
              <View style={styles.podiumPlace}>
                <Text style={styles.podiumName}>{players.find(p => p.id === leaderboard[0].playerId)?.name}</Text>
                <View style={[styles.podiumBar, { backgroundColor: '#FFD700', height: 160 }]}>
                  <Text style={styles.placeNumber}>1st</Text>
                  <Text style={styles.podiumScore}>{leaderboard[0].total}</Text>
                </View>
              </View>
              {/* 3rd */}
              <View style={styles.podiumPlace}>
                <Text style={styles.podiumName}>{players.find(p => p.id === leaderboard[2].playerId)?.name}</Text>
                <View style={[styles.podiumBar, { backgroundColor: '#CD7F32', height: 90 + Math.round((leaderboard[2].total / leaderboard[0].total) * 70) }]}>
                  <Text style={styles.placeNumber}>3rd</Text>
                  <Text style={styles.podiumScore}>{leaderboard[2].total}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Winner Strategy Phrase */}
        {(() => {
          if (!winner) return null;
          const breakdown = getCategoryBreakdown(winner.playerId);
          const entries = Object.entries(breakdown).filter(([,v]) => (v as number) > 0).sort((a,b)=> (b[1] as number)-(a[1] as number));
          if (entries.length === 0) return null;
          const [topCat, topScore] = entries[0] as [string, number];
          const ratio = topScore / winner.total;
          const strategy = ratio > 0.4 ? topCat : (topCat === 'military' && (breakdown as any).navy > 10 ? 'naval' : 'balanced');
          const VICTORY_PHRASES: Record<string, string[]> = {
            military: ['A true Warmonger!', 'The Iron Fist of the Ancient World!'],
            naval: ['Admiral of the Seven Seas!', 'Naval supremacy across the Mediterranean!'],
            science: ['The Scholars Path leads to victory!', 'Knowledge is power!'],
            civil: ['A beacon of civilization!', 'Built a utopia worthy of the ages!'],
            commercial: ['The Merchant Prince claims their throne!', 'Trade routes rule the day!'],
            wonder: ['Architectural marvels remembered for millennia!', 'Wonder Builders magnificence!'],
            guild: ['The Guild Masters influence knows no bounds!', 'Associations unite for victory!'],
            balanced: ['A Renaissance civilization! Master of all trades!', 'Perfectly balanced, as all things should be!'],
          };
          const list = VICTORY_PHRASES[strategy] || VICTORY_PHRASES.balanced;
          const seed = `${winner.playerId}|${winner.total}|${topScore}`;
          let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
          const line = list[h % list.length];
          return (
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
              <Text style={styles.victoryPhrase}>{line}</Text>
            </View>
          );
        })()}

        {/* Rankings */}
        <View style={styles.rankingsContainer}>
          {leaderboard.map((e) => {
            const breakdown = getCategoryBreakdown(e.playerId) as any;
            const setup = useSetupStore.getState();
            const playerWonder = setup.wonders?.[e.playerId];
            const leadersPicked: string[] = (() => {
              try {
                const st = useScoringStore.getState();
                const dd = st.playerScores?.[e.playerId]?.categories?.leaders?.detailedData || {};
                return Array.isArray(dd.selectedLeaders) ? dd.selectedLeaders : [];
              } catch { return []; }
            })();
            const ctx = {
              playerId: e.playerId,
              rank: e.rank,
              score: e.total,
              breakdown,
              expansions: setup.expansions,
              wonderBoardId: playerWonder?.boardId,
              playerCount: players.length,
              leadersRecruited: leadersPicked,
            } as const;
            // Simple badge set (display only)
            /* const BADGES = {
              warmonger: { icon: '', name: 'Warmonger', condition: (b: any) => (b.military || 0) >= 20 },
              scientist: { icon: '', name: 'Great Scientist', condition: (b: any) => (b.science || 0) >= 25 },
              merchant: { icon: '', name: 'Merchant Prince', condition: (b: any) => (b.commercial || 0) >= 15 },
              builder: { icon: '', name: 'Master Builder', condition: (b: any) => (b.civil || 0) >= 20 },
              wonderous: { icon: '', name: 'Wonder Architect', condition: (b: any) => (b.wonder || 0) >= 15 },
              peaceful: { icon: '', name: 'Pacifist', condition: (b: any) => (b.military || 0) === 0 },
              perfectScore: { icon: '', name: 'Century Club', condition: (_: any) => e.total >= 100 },
              underdog: { icon: '', name: 'Underdog', condition: (_: any) => e.rank === 1 && e.total < 60 },
            } as const; */
            const badges = evaluateBadgesForContext(ctx);
            return (
              <View key={e.playerId} style={styles.rankingCard}>
                <View style={styles.rankingHeader}>
                  <View style={styles.leftRow}>
                    <View style={styles.rankNumber}><Text style={styles.rankText}>#{e.rank}</Text></View>
                    <Text style={styles.playerName}>{players.find(p => p.id === e.playerId)?.name}</Text>
                  </View>
                  <Text style={styles.scoreText}>{e.total}</Text>
                </View>
                {badges.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {badges.slice(0, 6).map(b => (
                      <View key={b.id} style={{
                        backgroundColor: 'rgba(99,102,241,0.2)', borderRadius: 12, paddingVertical: 2, paddingHorizontal: 8,
                        borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)'
                      }}>
                        <Text style={{ color: '#818CF8', fontSize: 11, fontWeight: '600' }}>{b.icon} {b.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Game Statistics */}
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <View style={{ backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' }}>
            <Text style={{ color: '#818CF8', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Game Statistics</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Average Score</Text>
              <Text style={{ color: '#C4A24C', fontWeight: '600' }}>{gameStats.average}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Highest</Text>
              <Text style={{ color: '#C4A24C', fontWeight: '600' }}>{gameStats.highest}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Lowest</Text>
              <Text style={{ color: '#C4A24C', fontWeight: '600' }}>{gameStats.lowest}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Spread</Text>
              <Text style={{ color: '#C4A24C', fontWeight: '600' }}>{gameStats.spread}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: 'rgba(243,231,211,0.7)' }}>Duration</Text>
              <Text style={{ color: '#C4A24C', fontWeight: '600' }}>{gameStats.durationMin != null ? `${gameStats.durationMin} min` : 'In Progress'}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}><Text style={styles.actionButtonText}>Save & Exit</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleShare}><Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Share Results</Text></TouchableOpacity>
        </View>
      </ScrollView>
      {isSaving && (
        <View style={{
          position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(15,14,26,0.7)'
        }}>
          <View style={{
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            paddingHorizontal: 20, paddingVertical: 16,
            borderRadius: 14,
            borderWidth: 1, borderColor: 'rgba(196,162,76,0.35)'
          }}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="large" color="#C4A24C" />
              <Text style={{ color: '#C4A24C', fontWeight: '700' }}>Saving</Text>
              <Text style={{ color: 'rgba(243,231,211,0.75)', fontSize: 12 }}>Writing results and analytics</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
