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
  Divider,
  Chip,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AppsIcon from '@mui/icons-material/Apps';
import TimelineIcon from '@mui/icons-material/Timeline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { usePersona, type PersonaRole } from '../lib/persona';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Applications', path: '/applications', icon: <AppsIcon /> },
  { label: 'Pipeline Runs', path: '/runs', icon: <TimelineIcon /> },
  { label: 'Deployments', path: '/deployments', icon: <RocketLaunchIcon /> },
];

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const { persona, setRole } = usePersona();

  const chooseRole = (role: PersonaRole) => {
    setRole(role);
    setAnchorEl(null);
  };

  const drawer = (
    <Box sx={{ pt: 1 }}>
      <Typography variant="h6" sx={{ px: 2, py: 1.5, fontWeight: 700, color: 'primary.main' }}>
        LOB Dashboard
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
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
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Line of Business Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              label={persona.role}
              sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                fontWeight: 600,
                border: 'none',
                textTransform: 'capitalize',
              }}
            />
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                <PersonIcon fontSize="small" />
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>
                <Typography variant="body2">{persona.name}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">
                  {persona.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem disabled>
                <Typography variant="caption">Switch role (demo only, no auth)</Typography>
              </MenuItem>
              <MenuItem selected={persona.role === 'executive'} onClick={() => chooseRole('executive')}>
                Executive
              </MenuItem>
              <MenuItem selected={persona.role === 'developer'} onClick={() => chooseRole('developer')}>
                Developer
              </MenuItem>
              <MenuItem selected={persona.role === 'operations'} onClick={() => chooseRole('operations')}>
                Operations
              </MenuItem>
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
