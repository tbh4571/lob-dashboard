import type { ReactNode } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

export interface StatCardDef {
  icon: ReactNode;
  value: ReactNode;
  label: string;
}

export function StatCardRow({ stats }: { stats: StatCardDef[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 1.5,
        mb: 4,
      }}
    >
      {stats.map((stat, i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              {stat.icon}
              <Typography variant="h5" fontWeight={700}>
                {stat.value}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {stat.label}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
