import type { ReactNode } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

export interface StatTile {
  key: string;
  icon: ReactNode;
  value: ReactNode;
  label: string;
}

/**
 * Single shared grid for all dashboard stat tiles, so persona-specific tiles line up
 * with the base tiles instead of wrapping in their own separately-sized row.
 *
 * Uses CSS grid with `auto-fit` (not MUI's flex-based Grid) for two reasons: every row
 * shares the same column tracks so tiles always land on identical widths, and a
 * short final row stretches to fill the full width instead of leaving a lone
 * narrow, left-aligned tile. Grid's per-row `stretch` alignment also keeps every
 * tile in a row the same height regardless of how many lines its label wraps to.
 */
export function StatGrid({ tiles }: { tiles: StatTile[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 2,
        mb: 4,
      }}
    >
      {tiles.map((tile) => (
        <Card key={tile.key} variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              {tile.icon}
              <Typography variant="h5" fontWeight={700}>
                {tile.value}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {tile.label}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
