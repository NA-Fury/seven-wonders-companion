import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSetupStore } from '../../store/setupStore';
import { usePlayerStore } from '../../store/playerStore';
import { Screen, H1, Card } from '../../components/ui';
import { Table, type SortDir } from '../../components/ui/Table';
  import { 
  computeBestAverages,
  computeBiggestWinMargins,
  computeMostWins,
  computeTopScores,
  computeTopScoresGroupedByGame,
  filterByPlayerCount,
  computePersonalBests,
  computeWinRateRows,
  computeGamesPlayedRows,
  computeTop3RateRows,
  computeConsistencyRows,
  computeWonderWinsFromProfiles,
} from '../../utils/leaderboard';

export default function LeaderboardsScreen() {
  const history = useSetupStore((s) => s.gameHistory);
  const profiles = usePlayerStore((s) => s.profiles);

  const [view, setView] = useState<'scores' | 'wins' | 'averages' | 'margins' | 'bests' | 'winrate' | 'games' | 'top3' | 'consistency' | 'wonderwins'>('scores');
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [playerCount, setPlayerCount] = useState<number | 'all'>('all');
  const [scoreMode, setScoreMode] = useState<'points' | 'game+points'>('points');
  const [avgMin, setAvgMin] = useState<number>(3);
  const [rateMin, setRateMin] = useState<number>(3);

  const profileNames = useMemo(() => profiles, [profiles]);

  const historyByCount = useMemo(() => {
    if (playerCount === 'all') return history;
    return history.filter((g) => (g.players?.length || Object.keys(g.scores || {}).length || 0) === playerCount);
  }, [history, playerCount]);

  const topScoresAll = useMemo(() => computeTopScores(historyByCount, profileNames), [historyByCount, profileNames]);
  const topScoresGrouped = useMemo(() => computeTopScoresGroupedByGame(historyByCount, profileNames), [historyByCount, profileNames]);
  const mostWins = useMemo(() => computeMostWins(historyByCount, profileNames), [historyByCount, profileNames]);
  const bestAverages = useMemo(() => computeBestAverages(historyByCount, profileNames, avgMin), [historyByCount, profileNames, avgMin]);
  const biggestMargins = useMemo(() => computeBiggestWinMargins(historyByCount, profileNames), [historyByCount, profileNames]);
  const personalBests = useMemo(() => computePersonalBests(history, profileNames), [history, profileNames]);
  const winRateRows = useMemo(() => computeWinRateRows(profiles as any, rateMin), [profiles, rateMin]);
  const gamesPlayedRows = useMemo(() => computeGamesPlayedRows(profiles as any), [profiles]);
  const top3RateRows = useMemo(() => computeTop3RateRows(profiles as any, rateMin), [profiles, rateMin]);
  const consistencyRows = useMemo(() => computeConsistencyRows(profiles as any, rateMin), [profiles, rateMin]);
  const wonderWins = useMemo(() => computeWonderWinsFromProfiles(profiles as any), [profiles]);

  const withCountFilter = <T extends { playerCount?: number }>(rows: T[]) => (playerCount === 'all' ? rows : filterByPlayerCount(rows, playerCount));
  const scoresRows = scoreMode === 'points' ? withCountFilter(topScoresAll) : withCountFilter(topScoresGrouped);

  const headerPill = (label: string, active: boolean, onPress: () => void, key?: string | number) => (
    <Pressable key={key}
      onPress={onPress} style={{
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: active ? 'rgba(196,162,76,0.2)' : 'rgba(243,231,211,0.08)',
      borderWidth: 1,
      borderColor: active ? 'rgba(196,162,76,0.6)' : 'rgba(243,231,211,0.2)',
      marginRight: 8,
    }}>
      <Text style={{ color: active ? '#C4A24C' : 'rgba(243,231,211,0.8)', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen>
      <H1>🏆 Local Leaderboards</H1>
      <Text style={{ color: 'rgba(243,231,211,0.75)', marginBottom: 12 }}>Highlights and records across saved games.</Text>

      {/* View switcher */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          {headerPill('Top Scores', view === 'scores', () => { setView('scores'); setSortKey(undefined); }, 'scores')}
          {headerPill('Most Wins', view === 'wins', () => { setView('wins'); setSortKey(undefined); }, 'wins')}
          {headerPill('Best Averages', view === 'averages', () => { setView('averages'); setSortKey(undefined); }, 'averages')}
          {headerPill('Biggest Margins', view === 'margins', () => { setView('margins'); setSortKey(undefined); }, 'margins')}
          {headerPill('Personal Bests', view === 'bests', () => { setView('bests'); setSortKey(undefined); }, 'bests')}
          {headerPill('Win Rate', view === 'winrate', () => { setView('winrate'); setSortKey(undefined); }, 'winrate')}
          {headerPill('Most Games', view === 'games', () => { setView('games'); setSortKey(undefined); }, 'games')}
          {headerPill('Top 3 Rate', view === 'top3', () => { setView('top3'); setSortKey(undefined); }, 'top3')}
          {headerPill('Consistency', view === 'consistency', () => { setView('consistency'); setSortKey(undefined); }, 'consistency')}
          {headerPill('Wonder Wins', view === 'wonderwins', () => { setView('wonderwins'); setSortKey(undefined); }, 'wonderwins')}
        </View>
      </ScrollView>

      {/* Controls for current view */}
      {view === 'scores' && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {headerPill('Points Only', scoreMode === 'points', () => setScoreMode('points'))}
              {headerPill('Game + Points', scoreMode === 'game+points', () => setScoreMode('game+points'))}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {headerPill('All', playerCount === 'all', () => setPlayerCount('all'), 'pc_all')}
                {[3, 4, 5, 6, 7].map((n) => headerPill(`${n}P`, playerCount === n, () => setPlayerCount(n as any), `pc_${n}`))}
              </View>
            </ScrollView>
          </View>
        </Card>
      )}

      {view === 'averages' && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: 'rgba(243,231,211,0.9)' }}>Minimum games: {avgMin}</Text>
            <View style={{ flexDirection: 'row' }}>
              {[1, 3, 5, 10].map((n) => headerPill(`${n}+`, avgMin === n, () => setAvgMin(n), `avg_${n}`))}
            </View>
          </View>
        </Card>
      )}

      {(view === 'winrate' || view === 'top3' || view === 'consistency') && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: 'rgba(243,231,211,0.9)' }}>Minimum games: {rateMin}</Text>
            <View style={{ flexDirection: 'row' }}>
              {[1, 3, 5, 10].map((n) => headerPill(`${n}+`, rateMin === n, () => setRateMin(n), `rate_${n}`))}
            </View>
          </View>
        </Card>
      )}

      {/* Tables */}
      {view === 'scores' && (
        <Table
          columns={[
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'score', title: 'Points', flex: 1, align: 'right', sortAccessor: (r: any) => r.score },
            { key: 'gameId', title: 'Game', flex: 1 },
            { key: 'playerCount', title: 'Players', flex: 1, align: 'center', sortAccessor: (r: any) => r.playerCount },
            { key: 'date', title: 'Date', flex: 1 },
          ]}
          rows={scoresRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          onRowPress={(row: any) => { if (row.gameId) router.push(`/leaderboards/${row.gameId}` as any); }}
          emptyText={'No scores available yet.'}
        />
      )}

      {view === 'wins' && (
        <Table
          columns={[
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'count', title: 'Wins', flex: 1, align: 'right', sortAccessor: (r: any) => r.count },
          ]}
          rows={mostWins}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No wins recorded yet.'}
        />
      )}

      {view === 'averages' && (
        <Table
          columns={[
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'avg', title: 'Average', flex: 1, align: 'right', sortAccessor: (r: any) => r.avg },
            { key: 'games', title: 'Games', flex: 1, align: 'right', sortAccessor: (r: any) => r.games },
          ]}
          rows={bestAverages}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'Not enough games to compute averages.'}
        />
      )}

      {view === 'margins' && (
        <Table
          columns={[
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'margin', title: 'Win Margin', flex: 1, align: 'right', sortAccessor: (r: any) => r.margin },
            { key: 'gameId', title: 'Game', flex: 1 },
          ]}
          rows={biggestMargins}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          onRowPress={(row: any) => { if (row.gameId) router.push(`/leaderboards/${row.gameId}` as any); }}
          emptyText={'No margins to display yet.'}
        />
      )}

      {view === 'bests' && (
        <Table
          columns={[
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'best', title: 'Best Score', flex: 1, align: 'right', sortAccessor: (r: any) => r.best },
            { key: 'gameId', title: 'Game', flex: 1 },
          ]}
          rows={personalBests}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          onRowPress={(row: any) => { if (row.gameId) router.push(`/leaderboards/${row.gameId}` as any); }}
          emptyText={'No personal bests yet.'}
        />
      )}

      {view === 'winrate' && (
        <Table
          columns={[
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'winRate', title: 'Win Rate', flex: 1, align: 'right', sortAccessor: (r: any) => r.winRate, render: (r: any) => (
              <Text style={{ color: '#F3E7D3', textAlign: 'right' }}>{Math.round((r.winRate || 0) * 1000) / 10}%</Text>
            ) },
            { key: 'games', title: 'Games', flex: 1, align: 'right', sortAccessor: (r: any) => r.games },
          ]}
          rows={winRateRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No players with enough games yet.'}
        />
      )}

      {view === 'games' && (
        <Table
          columns={[
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'games', title: 'Games', flex: 1, align: 'right', sortAccessor: (r: any) => r.games },
          ]}
          rows={gamesPlayedRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No games played yet.'}
        />
      )}

      {view === 'top3' && (
        <Table
          columns={[
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'top3Rate', title: 'Top 3 Rate', flex: 1, align: 'right', sortAccessor: (r: any) => r.top3Rate, render: (r: any) => (
              <Text style={{ color: '#F3E7D3', textAlign: 'right' }}>{Math.round((r.top3Rate || 0) * 1000) / 10}%</Text>
            ) },
            { key: 'games', title: 'Games', flex: 1, align: 'right', sortAccessor: (r: any) => r.games },
          ]}
          rows={top3RateRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No players with enough games yet.'}
        />
      )}

      {view === 'consistency' && (
        <Table
          columns={[
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'floor', title: 'Highest Floor', flex: 1, align: 'right', sortAccessor: (r: any) => r.floor },
            { key: 'games', title: 'Games', flex: 1, align: 'right', sortAccessor: (r: any) => r.games },
          ]}
          rows={consistencyRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No players with enough games yet.'}
        />
      )}

      {view === 'wonderwins' && (
        <Table
          columns={[
            { key: 'wonderId', title: 'Wonder', flex: 2 },
            { key: 'name', title: 'Player', flex: 2 },
            { key: 'wins', title: 'Wins', flex: 1, align: 'right', sortAccessor: (r: any) => r.wins },
          ]}
          rows={wonderWins}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No wonder wins tracked yet.'}
        />
      )}
    </Screen>
  );
}
