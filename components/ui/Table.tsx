import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export type SortDir = 'asc' | 'desc';

export type TableColumn<T> = {
  key: keyof T | string;
  title: string;
  width?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
  sortAccessor?: (row: T) => string | number | Date | null | undefined;
};

export function Table<T extends { id?: string | number }>(
  {
    columns,
    rows,
    sortKey,
    sortDir,
    onSort,
    onRowPress,
    emptyText = 'No data',
  }: {
    columns: TableColumn<T>[];
    rows: T[];
    sortKey?: string;
    sortDir?: SortDir;
    onSort?: (key: string, dir: SortDir) => void;
    onRowPress?: (row: T) => void;
    emptyText?: string;
  }
) {
  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => (typeof c.key === 'string' ? c.key : String(c.key)) === sortKey);
    if (!col) return rows;
    const acc = col.sortAccessor || ((row: any) => row[sortKey as any]);
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = acc(a) as any;
      const bv = acc(b) as any;
      if (av == null && bv == null) return 0;
      if (av == null) return sortDir === 'asc' ? -1 : 1;
      if (bv == null) return sortDir === 'asc' ? 1 : -1;
      if (av instanceof Date && bv instanceof Date) {
        return sortDir === 'asc' ? av.getTime() - bv.getTime() : bv.getTime() - av.getTime();
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const as = String(av);
      const bs = String(bv);
      return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return copy;
  }, [rows, columns, sortKey, sortDir]);

  const thStyle = (align?: 'left' | 'center' | 'right') => ({
    color: theme.colors.accent,
    fontWeight: '800' as const,
    fontSize: 12,
    textAlign: align || 'left',
  });
  const tdStyle = (align?: 'left' | 'center' | 'right') => ({
    color: theme.colors.textPrimary,
    fontSize: 13,
    textAlign: align || 'left',
  });

  const sortIndicator = (key: string) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? '^' : 'v';
  };

  return (
    <View style={{
      borderRadius: theme.radius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: theme.colors.accentSoft }}>
        {columns.map((c) => {
          const key = typeof c.key === 'string' ? c.key : String(c.key);
          return (
            <Pressable
              key={key}
              onPress={() => {
                if (!onSort) return;
                const dir: SortDir = sortKey === key && sortDir === 'desc' ? 'asc' : 'desc';
                onSort(key, dir);
              }}
              style={{ flex: c.flex ?? 0, width: c.width, marginRight: 12 }}
            >
              <Text style={thStyle(c.align)}>
                {c.title} <Text style={{ color: theme.colors.textMuted }}>{sortIndicator(key)}</Text>
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Rows */}
      {sorted.length === 0 ? (
        <View style={{ padding: 14 }}>
          <Text style={{ color: theme.colors.textSecondary }}>{emptyText}</Text>
        </View>
      ) : (
        sorted.map((row: any, idx: number) => {
          const content = (
            <View style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12 }}>
              {columns.map((c, i) => (
                <View key={i} style={{ flex: c.flex ?? 0, width: c.width, marginRight: 12 }}>
                  {c.render ? (
                    c.render(row)
                  ) : (
                    <Text style={tdStyle(c.align)}>{String((row as any)[c.key as any] ?? '')}</Text>
                  )}
                </View>
              ))}
            </View>
          );
          const key = row.id ?? idx;
          return onRowPress ? (
            <Pressable
              key={key}
              onPress={() => onRowPress(row)}
              style={({ pressed }) => ({
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: 'rgba(243,231,211,0.06)',
                backgroundColor: pressed ? 'rgba(243,231,211,0.04)' : 'transparent',
              })}
            >
              {content}
            </Pressable>
          ) : (
            <View
              key={key}
              style={{
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: 'rgba(243,231,211,0.06)',
              }}
            >
              {content}
            </View>
          );
        })
      )}
    </View>
  );
}
