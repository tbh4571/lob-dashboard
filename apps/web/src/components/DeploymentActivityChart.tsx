import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import type { PipelineRun } from '../types';

const CHART_HEIGHT = 120;
const BAR_WIDTH = 18;

interface DayCount {
  date: Date;
  label: string;
  success: number;
  failed: number;
}

function computeDailyDeployCounts(runs: PipelineRun[], days: number): DayCount[] {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(new Date());

  const buckets: DayCount[] = Array.from({ length: days }, (_, i) => {
    const date = new Date(today.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return { date, label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), success: 0, failed: 0 };
  });
  const indexByTime = new Map(buckets.map((b, i) => [b.date.getTime(), i]));

  for (const run of runs) {
    if (run.type !== 'cd') continue;
    if (run.status !== 'success' && run.status !== 'failed') continue;
    const idx = indexByTime.get(startOfDay(new Date(run.startTime)).getTime());
    if (idx == null) continue;
    if (run.status === 'success') buckets[idx].success += 1;
    else buckets[idx].failed += 1;
  }
  return buckets;
}

/** 14-day daily repave (CD) outcome trend. Success/failed reuse the same status
 * colors already used for run chips app-wide, rather than a new categorical palette. */
export function DeploymentActivityChart({ runs, days = 14 }: { runs: PipelineRun[]; days?: number }) {
  const [showTable, setShowTable] = useState(false);
  const daily = computeDailyDeployCounts(runs, days);
  const max = Math.max(1, ...daily.map((d) => d.success + d.failed));
  const totalSuccess = daily.reduce((sum, d) => sum + d.success, 0);
  const totalFailed = daily.reduce((sum, d) => sum + d.failed, 0);

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Deployment Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Repaves per day, last {days} days
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">
                Success ({totalSuccess})
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: 'error.main' }} />
              <Typography variant="caption" color="text.secondary">
                Failed ({totalFailed})
              </Typography>
            </Stack>
            <Button size="small" onClick={() => setShowTable((v) => !v)}>
              {showTable ? 'View chart' : 'View table'}
            </Button>
          </Stack>
        </Stack>

        {showTable ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Success</TableCell>
                <TableCell align="right">Failed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {daily.map((d) => (
                <TableRow key={d.label}>
                  <TableCell>{d.label}</TableCell>
                  <TableCell align="right">{d.success}</TableCell>
                  <TableCell align="right">{d.failed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '6px',
                height: CHART_HEIGHT,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {daily.map((d) => {
                const total = d.success + d.failed;
                const successH = Math.max(d.success > 0 ? 2 : 0, (d.success / max) * CHART_HEIGHT);
                const failedH = Math.max(d.failed > 0 ? 2 : 0, (d.failed / max) * CHART_HEIGHT);
                return (
                  <Tooltip
                    key={d.label}
                    title={
                      <Box>
                        <Typography variant="caption" display="block" fontWeight={600}>
                          {d.label}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Success: {d.success}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Failed: {d.failed}
                        </Typography>
                      </Box>
                    }
                  >
                    <Box
                      sx={{
                        width: BAR_WIDTH,
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        height: '100%',
                        cursor: total > 0 ? 'pointer' : 'default',
                      }}
                    >
                      {d.failed > 0 && (
                        <Box sx={{ height: failedH, bgcolor: 'error.main', borderRadius: '4px 4px 0 0' }} />
                      )}
                      {d.success > 0 && d.failed > 0 && <Box sx={{ height: 2 }} />}
                      {d.success > 0 && (
                        <Box
                          sx={{
                            height: successH,
                            bgcolor: 'success.main',
                            borderRadius: d.failed > 0 ? 0 : '4px 4px 0 0',
                          }}
                        />
                      )}
                      {total === 0 && <Box sx={{ height: 2, bgcolor: 'divider' }} />}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
            <Stack direction="row" sx={{ gap: '6px', mt: 0.5 }}>
              {daily.map((d, i) => (
                <Box key={d.label} sx={{ width: BAR_WIDTH, flexShrink: 0, textAlign: 'center' }}>
                  {i % 2 === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      {d.date.getDate()}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
