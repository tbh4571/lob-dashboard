import { Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link } from '@mui/material';
import { NoDataNotice } from '../components/NoDataNotice';

export function RunDetailPage() {
  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/runs" underline="hover" color="inherit">
          Runs
        </Link>
      </Breadcrumbs>

      <NoDataNotice label="run details" />
    </Box>
  );
}
