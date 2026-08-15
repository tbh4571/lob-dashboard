import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Avatar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AppsIcon from '@mui/icons-material/Apps';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TimelineIcon from '@mui/icons-material/Timeline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { trpc } from '../lib/trpc';
import type { UserRole } from '@lob/shared';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  {
    label: 'Applications',
    path: '/applications',
    icon: <AppsIcon />,
    children: [{ label: 'Components', path: '/components', icon: <ViewModuleIcon fontSize="small" /> }],
  },
  {
    label: 'Runs',
    path: '/runs',
    icon: <TimelineIcon />,
    children: [{ label: 'Deployments', path: '/deployments', icon: <RocketLaunchIcon fontSize="small" /> }],
  },
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const { data: user } = trpc.auth.me.useQuery();

  const setRole = (role: UserRole) => {
    localStorage.setItem('dev-role', role);
    window.location.reload();
  };

  const drawer = (
    <Box sx={{ pt: 1 }}>
      <Typography variant="h6" sx={{ px: 2, py: 1.5, fontWeight: 700, color: 'primary.main' }}>
        LOB Dashboard
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <Box key={item.path}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
            {item.children?.map((child) => (
              <ListItemButton
                key={child.path}
                component={Link}
                to={child.path}
                selected={location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)}
                onClick={() => setMobileOpen(false)}
                sx={{ pl: 4 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{child.icon}</ListItemIcon>
                <ListItemText primary={child.label} slotProps={{ primary: { variant: 'body2' } }} />
              </ListItemButton>
            ))}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderBottom: '3px solid',
          borderColor: 'secondary.main',
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            Line of Business Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user && (
              <Chip
                size="small"
                label={user.role}
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'secondary.contrastText',
                  fontWeight: 600,
                  border: 'none',
                }}
              />
            )}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                <PersonIcon fontSize="small" />
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>
                <Typography variant="body2">{user?.name || 'Guest'}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem disabled>
                <Typography variant="caption">Switch role (dev only)</Typography>
              </MenuItem>
              <MenuItem onClick={() => setRole('executive')}>Executive</MenuItem>
              <MenuItem onClick={() => setRole('developer')}>Developer</MenuItem>
              <MenuItem onClick={() => setRole('operations')}>Operations</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
