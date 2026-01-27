import { Box, Grid, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
import { fetchPhotographerDashboard } from "../../app/dashboardslice";
import { useNavigate } from "react-router-dom";
import { PhotoCamera, Event, Visibility, Favorite, Comment, Download } from "@mui/icons-material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { IconButton, Tooltip, Stack } from "@mui/material";


const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card
    sx={{
      borderRadius: 3,
      height: "100%",
      background: `linear-gradient(135deg, ${color}15, ${color}05)`,
    }}
  >
    <CardContent
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        "&:last-child": { pb: 2 },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: `${color}20`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography fontSize={13} color="text.secondary">
          {label}
        </Typography>
        <Typography fontSize={24} fontWeight={700}>
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);
const spinStyle = {
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
};

const PhotographerDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { summary, events, loading } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchPhotographerDashboard());
  }, [dispatch]);

  if (loading || !summary) {
    return <CircularProgress />;
  }

  return (
    <Box p={3} sx={spinStyle}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Photographer Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of your event coverage & engagement
          </Typography>
        </Box>

        <Tooltip title="Refresh dashboard">
          <IconButton
            size="small"
            disabled={loading}
            onClick={() => dispatch(fetchPhotographerDashboard())}
          >
            <RefreshIcon
              sx={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
          </IconButton>
        </Tooltip>
      </Stack>


      {/* ===== SUMMARY ===== */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <StatCard
            label="Total Events"
            value={summary.total_events}
            icon={<Event />}
            color="#6366f1"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <StatCard
            label="Total Photos"
            value={summary.total_photos}
            icon={<PhotoCamera />}
            color="#0ea5e9"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <StatCard
            label="Views"
            value={summary.total_views}
            icon={<Visibility />}
            color="#22c55e"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <StatCard
            label="Likes"
            value={summary.total_likes}
            icon={<Favorite />}
            color="#ef4444"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <StatCard
            label="Comments"
            value={summary.total_comments}
            icon={<Comment />}
            color="#f59e0b"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <StatCard
            label="Downloads"
            value={summary.total_downloads}
            icon={<Download />}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>


      {/* ===== EVENTS TABLE ===== */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={600} mb={2}>
            Event Performance
          </Typography>
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Photos</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Views</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Likes</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Comments</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Downloads</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {events.map((row) => (
                  <TableRow key={row.event.id}>
                    <TableCell>{row.event.event_name}</TableCell>
                    <TableCell>{row.event.event_date}</TableCell>
                    <TableCell>{row.photo_count}</TableCell>
                    <TableCell>{row.view_count}</TableCell>
                    <TableCell>{row.like_count}</TableCell>
                    <TableCell>{row.comment_count}</TableCell>
                    <TableCell>{row.download_count}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() =>
                          navigate(`/event/${row.event.id}/photos`)
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PhotographerDashboard;
