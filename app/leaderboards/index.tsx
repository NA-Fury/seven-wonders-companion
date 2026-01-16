import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSetupStore } from '../../store/setupStore';
import { usePlayerStore } from '../../store/playerStore';
import { Card, Chip, H1, Screen } from '@/components/ui';
import { Table, type SortDir } from '../../components/ui/Table';
import { ARMADA_SHIPYARDS } from '../../data/armadaDatabase';
import { ALL_EDIFICE_PROJECTS } from '../../data/edificeDatabase';
import { WONDERS_DATABASE } from '../../data/wondersDatabase';
import {
  computeBestAverages,
  computeBiggestWinMargins,
  computeMostWins,
  computeTopScores,
  computeTopScoresGroupedByGame,
  filterByPlayerCount,
  computePersonalBests,
  computeGamesPlayedFromHistory,
  computeWinRateFromHistory,
  computeTop3RateFromHistory,
  computeConsistencyFromHistory,
  computeWonderWins,
  computeWonderWinsDayNight,
  computeShipyardWins,
  computeEdificePopularity,
  computeWinningStrategyCategories,
  filterHistoryByExpansion,
  type ExpansionFilter,
} from '../../utils/leaderboard';

const formatIdLabel = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

const WONDER_NAME_BY_ID = new Map(WONDERS_DATABASE.map((w) => [w.id, w.name]));
const SHIPYARD_NAME_BY_ID = new Map(ARMADA_SHIPYARDS.map((s) => [s.id, s.name]));
const EDIFICE_NAME_BY_ID = new Map(ALL_EDIFICE_PROJECTS.map((p) => [p.id, p.name]));

const getDisplayName = (map: Map<string, string>, value?: string) => {
  if (!value) return '';
  return map.get(value) ?? formatIdLabel(value);
};

export default function LeaderboardsScreen() {
  const history = useSetupStore((s) => s.gameHistory);
  const profiles = usePlayerStore((s) => s.profiles);

  const [view, setView] = useState<'scores' | 'wins' | 'averages' | 'margins' | 'bests' | 'winrate' | 'games' | 'top3' | 'consistency' | 'wonderwins' | 'wonderdaynight' | 'shipyards' | 'edifice' | 'strategies'>('scores');
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [playerCount, setPlayerCount] = useState<number | 'all'>('all');
  const [scoreMode, setScoreMode] = useState<'points' | 'game+points'>('points');
  const [avgMin, setAvgMin] = useState<number>(3);
  const [rateMin, setRateMin] = useState<number>(3);
  const [expFilter, setExpFilter] = useState<ExpansionFilter>('all');

  const profileNames = useMemo(() => profiles, [profiles]);

  const historyByExp = useMemo(() => filterHistoryByExpansion(history, expFilter), [history, expFilter]);
  const historyByCount = useMemo(() => {
    if (playerCount === 'all') return historyByExp;
    return historyByExp.filter((g) => (g.players?.length || Object.keys(g.scores || {}).length || 0) === playerCount);
  }, [historyByExp, playerCount]);

  const topScoresAll = useMemo(() => computeTopScores(historyByCount, profileNames), [historyByCount, profileNames]);
  const topScoresGrouped = useMemo(() => computeTopScoresGroupedByGame(historyByCount, profileNames), [historyByCount, profileNames]);
  const mostWins = useMemo(() => computeMostWins(historyByCount, profileNames), [historyByCount, profileNames]);
  const bestAverages = useMemo(() => computeBestAverages(historyByCount, profileNames, avgMin), [historyByCount, profileNames, avgMin]);
  const biggestMargins = useMemo(() => computeBiggestWinMargins(historyByCount, profileNames), [historyByCount, profileNames]);
  const personalBests = useMemo(() => computePersonalBests(historyByCount, profileNames), [historyByCount, profileNames]);
  const winRateRows = useMemo(() => computeWinRateFromHistory(historyByCount, profileNames, rateMin), [historyByCount, profileNames, rateMin]);
  const gamesPlayedRows = useMemo(() => computeGamesPlayedFromHistory(historyByCount, profileNames), [historyByCount, profileNames]);
  const top3RateRows = useMemo(() => computeTop3RateFromHistory(historyByCount, profileNames, rateMin), [historyByCount, profileNames, rateMin]);
  const consistencyRows = useMemo(() => computeConsistencyFromHistory(historyByCount, profileNames, rateMin), [historyByCount, profileNames, rateMin]);
  const wonderWins = useMemo(() => computeWonderWins(historyByCount, profileNames), [historyByCount, profileNames]);
  const wonderDayNight = useMemo(() => computeWonderWinsDayNight(historyByCount), [historyByCount]);
  const shipyardWins = useMemo(() => computeShipyardWins(historyByCount), [historyByCount]);
  const edificePop = useMemo(() => computeEdificePopularity(historyByCount), [historyByCount]);
  const strategyCats = useMemo(() => computeWinningStrategyCategories(historyByCount), [historyByCount]);

  const withCountFilter = <T extends { playerCount?: number }>(rows: T[]) => (playerCount === 'all' ? rows : filterByPlayerCount(rows, playerCount));
  const scoresRows = scoreMode === 'points' ? withCountFilter(topScoresAll) : withCountFilter(topScoresGrouped);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator contentContainerStyle={{ paddingBottom: 40 }}>
        <H1>Local Leaderboards</H1>
      <Text style={{ color: 'rgba(243,231,211,0.75)', marginBottom: 12 }}>Highlights and records across saved games.</Text>

      {/* View switcher (wrapped for responsiveness) */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        <Chip label="Top Scores" active={view === 'scores'} onPress={() => { setView('scores'); setSortKey(undefined); }} />
        <Chip label="Most Wins" active={view === 'wins'} onPress={() => { setView('wins'); setSortKey(undefined); }} />
        <Chip label="Best Averages" active={view === 'averages'} onPress={() => { setView('averages'); setSortKey(undefined); }} />
        <Chip label="Biggest Margins" active={view === 'margins'} onPress={() => { setView('margins'); setSortKey(undefined); }} />
        <Chip label="Personal Bests" active={view === 'bests'} onPress={() => { setView('bests'); setSortKey(undefined); }} />
        <Chip label="Win Rate" active={view === 'winrate'} onPress={() => { setView('winrate'); setSortKey(undefined); }} />
        <Chip label="Most Games" active={view === 'games'} onPress={() => { setView('games'); setSortKey(undefined); }} />
        <Chip label="Top 3 Rate" active={view === 'top3'} onPress={() => { setView('top3'); setSortKey(undefined); }} />
        <Chip label="Consistency" active={view === 'consistency'} onPress={() => { setView('consistency'); setSortKey(undefined); }} />
        <Chip label="Wonder Wins" active={view === 'wonderwins'} onPress={() => { setView('wonderwins'); setSortKey(undefined); }} />
        <Chip label="Day vs Night" active={view === 'wonderdaynight'} onPress={() => { setView('wonderdaynight'); setSortKey(undefined); }} />
        <Chip label="Shipyard Wins" active={view === 'shipyards'} onPress={() => { setView('shipyards'); setSortKey(undefined); }} />
        <Chip label="Edifice Popularity" active={view === 'edifice'} onPress={() => { setView('edifice'); setSortKey(undefined); }} />
        <Chip label="Winning Strategies" active={view === 'strategies'} onPress={() => { setView('strategies'); setSortKey(undefined); }} />
      </View>

      {/* Expansion filter (wrapped) */}
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip label="All Games" active={expFilter === 'all'} onPress={() => setExpFilter('all')} />
          <Chip label="Base" active={expFilter === 'base'} onPress={() => setExpFilter('base')} />
          <Chip label="Leaders" active={expFilter === 'leaders'} onPress={() => setExpFilter('leaders')} />
          <Chip label="Cities" active={expFilter === 'cities'} onPress={() => setExpFilter('cities')} />
          <Chip label="Armada" active={expFilter === 'armada'} onPress={() => setExpFilter('armada')} />
          <Chip label="Edifice" active={expFilter === 'edifice'} onPress={() => setExpFilter('edifice')} />
          <Chip label="Reset" active={false} onPress={() => { setExpFilter('all'); setPlayerCount('all'); setScoreMode('points'); setAvgMin(3); setRateMin(3); setSortKey(undefined); }} />
        </View>
      </Card>

      {/* Controls for current view */}
      {view === 'scores' && (
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Chip label="Points Only" active={scoreMode === 'points'} onPress={() => setScoreMode('points')} />
            <Chip label="Game + Points" active={scoreMode === 'game+points'} onPress={() => setScoreMode('game+points')} />
            <Chip label="All" active={playerCount === 'all'} onPress={() => setPlayerCount('all')} />
            {[3,4,5,6,7].map((n) => (
              <Chip key={`pc_${n}`} label={`${n}P`} active={playerCount === n} onPress={() => setPlayerCount(n as any)} />
            ))}
          </View>
        </Card>
      )}

      {view === 'averages' && (
        <Card>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginBottom: 6 }}>Minimum games: {avgMin}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[1, 3, 5, 10].map((n) => (
              <Chip key={`avg_${n}`} label={`${n}+`} active={avgMin === n} onPress={() => setAvgMin(n)} />
            ))}
          </View>
        </Card>
      )}

      {(view === 'winrate' || view === 'top3' || view === 'consistency') && (
        <Card>
          <Text style={{ color: 'rgba(243,231,211,0.9)', marginBottom: 6 }}>Minimum games: {rateMin}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[1, 3, 5, 10].map((n) => (
              <Chip key={`rate_${n}`} label={`${n}+`} active={rateMin === n} onPress={() => setRateMin(n)} />
            ))}
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
            { 
              key: 'wonderId', 
              title: 'Wonder', 
              flex: 2,
              render: (r: any) => (
                <Text style={{ color: '#F3E7D3' }}>{getDisplayName(WONDER_NAME_BY_ID, r.wonderId)}</Text>
              ),
              sortAccessor: (r: any) => getDisplayName(WONDER_NAME_BY_ID, r.wonderId),
            },
            { key: 'wins', title: 'Wins', flex: 1, align: 'right', sortAccessor: (r: any) => r.wins },
          ]}
          rows={wonderWins as any}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No wonder wins tracked yet.'}
        />
      )}

      {view === 'wonderdaynight' && (
        <Table
          columns={[
            { 
              key: 'wonderId', 
              title: 'Wonder', 
              flex: 2,
              render: (r: any) => (
                <Text style={{ color: '#F3E7D3' }}>{getDisplayName(WONDER_NAME_BY_ID, r.wonderId)}</Text>
              ),
              sortAccessor: (r: any) => getDisplayName(WONDER_NAME_BY_ID, r.wonderId),
            },
            { key: 'day', title: 'Day Wins', flex: 1, align: 'right', sortAccessor: (r: any) => r.day },
            { key: 'night', title: 'Night Wins', flex: 1, align: 'right', sortAccessor: (r: any) => r.night },
          ]}
          rows={wonderDayNight as any}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No day/night wins yet.'}
        />
      )}

      {view === 'shipyards' && (
        <Table
          columns={[
            { 
              key: 'shipyardId', 
              title: 'Shipyard', 
              flex: 2,
              render: (r: any) => (
                <Text style={{ color: '#F3E7D3' }}>{getDisplayName(SHIPYARD_NAME_BY_ID, r.shipyardId)}</Text>
              ),
              sortAccessor: (r: any) => getDisplayName(SHIPYARD_NAME_BY_ID, r.shipyardId),
            },
            { key: 'wins', title: 'Wins', flex: 1, align: 'right', sortAccessor: (r: any) => r.wins },
          ]}
          rows={shipyardWins as any}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No Armada shipyard wins yet.'}
        />
      )}

      {view === 'edifice' && (
        <Table
          columns={[
            { 
              key: 'projectId', 
              title: 'Edifice', 
              flex: 2,
              render: (r: any) => (
                <Text style={{ color: '#F3E7D3' }}>{getDisplayName(EDIFICE_NAME_BY_ID, r.projectId)}</Text>
              ),
              sortAccessor: (r: any) => getDisplayName(EDIFICE_NAME_BY_ID, r.projectId),
            },
            { key: 'count', title: 'Games', flex: 1, align: 'right', sortAccessor: (r: any) => r.count },
          ]}
          rows={edificePop as any}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No Edifice projects recorded.'}
        />
      )}

      {view === 'strategies' && (
        <Table
          columns={[
            { key: 'category', title: 'Winning Strategy', flex: 2 },
            { key: 'wins', title: 'Wins', flex: 1, align: 'right', sortAccessor: (r: any) => r.wins },
          ]}
          rows={strategyCats as any}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
          emptyText={'No strategy data yet.'}
        />
      )}
      </ScrollView>
    </Screen>
  );
}



