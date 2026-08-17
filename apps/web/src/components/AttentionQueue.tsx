import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Stack, Chip, Link, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { PipelineRun } from '../types';
import { applicationUrl, componentUrl, getApplicationById, getComponentById, runUrl } from '../lib/mockData';
import { usePagination } from '../lib/usePagination';
import { PaginationFooter } from './PaginationFooter';

interface Props {
  /** Failed runs, most recent first. Not pre-sliced — the queue paginates internally. */
  runs: PipelineRun[];
  /** Page size. */
  limit?: number;
}

/**
 * Persona-agnostic, paginated table of recent pipeline failures, each tagged
 * with the application and component it belongs to. Rendered identically
 * across the Executive, Developer, and Operations dashboard views so nobody
 * has to hunt through per-persona sections to see what's currently broken
 * and where.
 */
export function AttentionQueue({ runs, limit = 5 }: Props) {
  const navigate = useNavigate();
  const { page, setPage, pageCount, start, total, pageItems: items } = usePagination(runs, limit);

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <ErrorIcon color={total > 0 ? 'error' : 'success'} fontSize="small" />
        <Typography variant="h6" fontWeight={600}>
          Attention Queue
        </Typography>
        {total > 0 && <Chip size="small" label={total} color="error" />}
      </Stack>

      {total === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircleIcon color="success" fontSize="small" />
              <Typography color="text.secondary">No failures right now — every recent run succeeded.</Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Run Id</TableCell>
                <TableCell>Application</TableCell>
                <TableCell>Component</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((run) => {
                const application = getApplicationById(run.applicationId);
                const component = getComponentById(run.componentId);
                return (
                  <TableRow
                    key={run.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(runUrl(run))}
                  >
                    <TableCell>{run.label}</TableCell>
                    <TableCell>
                      {application ? (
                        <Link
                          component={RouterLink}
                          to={applicationUrl(application.id)}
                          underline="hover"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {application.name}
                        </Link>
                      ) : (
                        run.applicationId
                      )}
                    </TableCell>
                    <TableCell>
                      {component ? (
                        <Link
                          component={RouterLink}
                          to={componentUrl(component.id)}
                          underline="hover"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {component.name}
                        </Link>
                      ) : (
                        run.componentId
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={run.type === 'ci' ? 'CI / Rebase' : 'CD / Repave'} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        component={RouterLink}
                        to={runUrl(run)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <PaginationFooter page={page} pageCount={pageCount} total={total} limit={limit} start={start} onChange={setPage} />
        </Card>
      )}
    </Box>
  );
}
