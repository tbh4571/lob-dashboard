import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Divider,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { PipelineRun } from '../types';
import { getApplicationById, getComponentById } from '../lib/mockData';

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
  const [page, setPage] = useState(0);
  const total = runs.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * limit;
  const items = runs.slice(start, start + limit);

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
                    onClick={() => navigate(`/runs/${run.id}`)}
                  >
                    <TableCell>{run.label}</TableCell>
                    <TableCell>
                      {application ? (
                        <Link
                          component={RouterLink}
                          to={`/applications/${application.id}`}
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
                          to={`/components/${component.id}`}
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
                        to={`/runs/${run.id}`}
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

          {pageCount > 1 && (
            <>
              <Divider />
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {start + 1}–{Math.min(start + limit, total)} of {total}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    startIcon={<ChevronLeftIcon />}
                    disabled={currentPage === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Page {currentPage + 1} of {pageCount}
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ChevronRightIcon />}
                    disabled={currentPage >= pageCount - 1}
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            </>
          )}
        </Card>
      )}
    </Box>
  );
}
