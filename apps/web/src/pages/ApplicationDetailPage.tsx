import { Link as RouterLink } from 'react-router-dom';
import { Box, Breadcrumbs, Link } from '@mui/material';
import { NoDataNotice } from '../components/NoDataNotice';

export function ApplicationDetailPage() {
  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/applications" underline="hover" color="inherit">
          Applications
        </Link>
      </Breadcrumbs>

      <NoDataNotice label="application details" />
    </Box>
  );
}
