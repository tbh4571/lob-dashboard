import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Card, Chip, Table, TableBody, TableCell, TableHead, TableRow, Link } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import type { Component, PipelineRun, Schedule } from '../../types';
import { componentUrl } from '../../lib/mockData';
import type { Persona } from '../../lib/persona';
import { cronExpression, describeNextRun, describeSchedule } from '../../lib/scheduleFormat';
import type { StatTile } from '../../components/StatGrid';
import { usePagination } from '../../lib/usePagination';
import { PaginationFooter } from '../../components/PaginationFooter';
import { UpcomingSchedulesTables } from '../../components/UpcomingSchedulesTables';

interface Props {
  schedules: Schedule[];
  components: Component[];
  persona: Persona;
}

export function developerStats(runs: PipelineRun[]): StatTile[] {
  const ciCompleted = runs.filter(
    (r) => r.type === 'ci' && (r.status === 'success' || r.status === 'failed'),
  );
  const ciSuccessRate =
    ciCompleted.length > 0
      ? Math.round((ciCompleted.filter((r) => r.status === 'success').length / ciCompleted.length) * 100)
      : 100;

  return [
    {
      key: 'ci-success-rate',
      icon: <BuildIcon color={ciSuccessRate >= 90 ? 'success' : 'warning'} />,
      value: `${ciSuccessRate}%`,
      label: 'CI / Rebase success rate',
    },
  ];
}

export function DeveloperOverview({ schedules, components, persona }: Props) {
  const mySchedules = schedules.filter((s) => s.createdBy === persona.id);
  const mySchedulesPage = usePagination(mySchedules, 5);
  const componentName = (id: string) => components.find((c) => c.id === id)?.name ?? id;
  const componentImage = (id: string) => {
    const c = components.find((c) => c.id === id);
    return c?.currentImageTag ? `${c.imageRepository}:${c.currentImageTag}` : '—';
  };

  return (
    <Box>
      <UpcomingSchedulesTables schedules={schedules} components={components} />

      <Typography variant="h6" fontWeight={600} gutterBottom>
        My Schedules
      </Typography>
      {mySchedules.length > 0 ? (
        <Card variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Next run</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mySchedulesPage.pageItems.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={componentUrl(s.componentId)} underline="hover">
                      {componentName(s.componentId)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{describeSchedule(s)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      <code>{cronExpression(s)}</code>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <code>{componentImage(s.componentId)}</code>
                  </TableCell>
                  <TableCell>{describeNextRun(s)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={s.enabled ? 'Enabled' : 'Paused'} color={s.enabled ? 'success' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationFooter
            page={mySchedulesPage.page}
            pageCount={mySchedulesPage.pageCount}
            total={mySchedulesPage.total}
            limit={mySchedulesPage.limit}
            start={mySchedulesPage.start}
            onChange={mySchedulesPage.setPage}
          />
        </Card>
      ) : (
        <Typography color="text.secondary">You haven't created any schedules yet.</Typography>
      )}
    </Box>
  );
}
