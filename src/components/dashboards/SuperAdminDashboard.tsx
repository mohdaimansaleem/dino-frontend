import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Business,
  Store,
  People,
  TrendingUp,
  Visibility,
  Edit,
  Add,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { getUserFirstName } from '../../utils/userUtils';

interface SuperAdminDashboardProps {
  className?: string;
}

interface DashboardStats {
  total_workspaces: number;
  total_venues: number;
  total_users: number;
  total_orders: number;
  total_revenue: number;
  active_venues: number;
}

interface WorkspaceData {
  id: string;
  name: string;
  venue_count: number;
  user_count: number;
  is_active: boolean;
  created_at: string;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dashboard stats
      const dashboardData = await dashboardService.getSuperAdminDashboard();
      setStats(dashboardData.summary);
      setWorkspaces(dashboardData.workspaces || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Super Admin Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={loadDashboardData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box className={className} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon color="primary" />
          Super Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {getUserFirstName(user)}! Here's your platform overview.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Dashboard" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Business color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.total_workspaces || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Workspaces
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Store color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.total_venues || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Venues
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Store color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.active_venues || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Venues
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.total_users || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.total_orders || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{stats?.total_revenue?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Workspaces Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Workspaces Overview
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => window.location.href = '/register'}
            >
              Add Workspace
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Workspace Name</TableCell>
                  <TableCell align="center">Venues</TableCell>
                  <TableCell align="center">Users</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workspaces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No workspaces found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  workspaces.map((workspace) => (
                    <TableRow key={workspace.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {workspace.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {workspace.venue_count}
                      </TableCell>
                      <TableCell align="center">
                        {workspace.user_count}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={workspace.is_active ? 'Active' : 'Inactive'}
                          color={workspace.is_active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {new Date(workspace.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => window.location.href = `/admin/workspace?id=${workspace.id}`}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => window.location.href = `/admin/workspace/edit?id=${workspace.id}`}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
        </>
      )}
    </Box>
  );
};

export default SuperAdminDashboard;