import { Stack, Typography, Button, Divider } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface Props {
  page: number;
  pageCount: number;
  total: number;
  limit: number;
  start: number;
  onChange: (page: number) => void;
}

/** "Showing X–Y of Z" + Previous/Next, styled to sit at the bottom of a Card-wrapped Table.
 * Renders nothing when everything fits on one page. */
export function PaginationFooter({ page, pageCount, total, limit, start, onChange }: Props) {
  if (pageCount <= 1) return null;

  return (
    <>
      <Divider />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        rowGap={1}
        sx={{ px: 2, py: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {start + 1}–{Math.min(start + limit, total)} of {total}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" startIcon={<ChevronLeftIcon />} disabled={page === 0} onClick={() => onChange(page - 1)}>
            Previous
          </Button>
          <Typography variant="body2" color="text.secondary">
            Page {page + 1} of {pageCount}
          </Typography>
          <Button
            size="small"
            endIcon={<ChevronRightIcon />}
            disabled={page >= pageCount - 1}
            onClick={() => onChange(page + 1)}
          >
            Next
          </Button>
        </Stack>
      </Stack>
    </>
  );
}
