import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow, Link } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import type { Component, Schedule } from '../../types';
import { componentUrl } from '../../lib/mockData';
import { cronExpression, describeNextRun, describeSchedule } from '../../lib/scheduleFormat';
import type { StatTile } from '../../components/StatGrid';
import { usePagination } from '../../lib/usePagination';
import { PaginationFooter } from '../../components/PaginationFooter';
import { UpcomingSchedulesTables } from '../../components/UpcomingSchedulesTables';

interface Props {
  components: Component[];
  schedules: Schedule[];
}

export function operationsStats(schedules: Schedule[]): StatTile[] {
  const enabledCount = schedules.filter((s) => s.enabled).length;

  return [
    {
      key: 'active-schedules',
      icon: <RocketLaunchIcon color="info" />,
      value: enabledCount,
      label: 'Active repave schedules',
    },
  ];
}

export function OperationsOverview({ components, schedules }: Props) {
  const enabledSchedules = schedules.filter((s) => s.enabled);
  const componentImage = (id: string) => {
    const c = components.find((c) => c.id === id);
    return c?.currentImageTag ? `${c.imageRepository}:${c.currentImageTag}` : '—';
  };

  const activeSchedules = usePagination(enabledSchedules, 5);

  return (
    <Box>
      <UpcomingSchedulesTables schedules={schedules} components={components} />

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Active Schedules
      </Typography>
      {enabledSchedules.length > 0 ? (
        <Card variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Next run</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeSchedules.pageItems.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={componentUrl(s.componentId)} underline="hover">
                      {components.find((c) => c.id === s.componentId)?.name ?? s.componentId}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationFooter
            page={activeSchedules.page}
            pageCount={activeSchedules.pageCount}
            total={activeSchedules.total}
            limit={activeSchedules.limit}
            start={activeSchedules.start}
            onChange={activeSchedules.setPage}
          />
        </Card>
      ) : (
        <Typography color="text.secondary">No active schedules.</Typography>
      )}
    </Box>
  );
}
