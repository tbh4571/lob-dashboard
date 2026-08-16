import { Box, Typography } from '@mui/material';
import { NoDataNotice } from '../components/NoDataNotice';

export function RunsPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Pipeline Runs
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        CI (Rebase / GitHub Actions) and CD (Repave / Harness) executions
      </Typography>

      <NoDataNotice label="pipeline runs" />
    </Box>
  );
}
