import { Box, Paper, Typography, Grid, Divider } from '@mui/material'
import AddUser from '../../components/RBAC/Admin/AddUser'
import RemoveUser from '../../components/RBAC/Admin/RemoveUser'
import UpdateUser from '../../components/RBAC/Admin/UpdateUser'
import AddEvent from '../../components/RBAC/Admin/AddEvent'
import RemoveEvent from '../../components/RBAC/Admin/RemoveEvent'

const Admin = () => {
  return (
    <Box sx={{ backgroundColor: '#f8fafc', py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }} >
      <Box mx={"auto"} sx={{ maxWidth: { xs: '100%', sm: 900, md: 1200 } }}>
        <Paper elevation={3} sx={{
          p: { xs: 2, md: 4 }, borderRadius: { xs: 2, md: 3 },
          textAlign: "center",
          background: "linear-gradient(135deg, #ffffff, #f1f5f9)",
        }}>
          <Typography variant='h4'
            gutterBottom
            sx={{
              fontWeight: 600,
              fontSize: {
                xs: '1.5rem', md: '2rem'
              }
            }}>Admin Control Panel</Typography>
          <Typography variant='subtitle2' gutterBottom
            sx={{
              fontSize: {
                xs: '1rem', md: '1.5rem'
              }
            }
            }>
            Manage users and events with full administrative access
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6, sm: 6 }}>
              <Paper
                elevation={3} sx={{
                  p: { xs: 2, md: 3 }, borderRadius: { xs: 2, md: 3 },
                  textAlign: "center",
                  background: "linear-gradient(135deg, #79dcfa, #e7e7f3)",
                }}>
                <Typography variant='h6' gutterBottom fontWeight={600}
                  sx={{
                    fontSize: {
                      xs: '1rem', md: '1.5rem'
                    }
                  }
                  }>
                 User Management
                </Typography>

                <Divider />
                    <AddUser/>
                    <RemoveUser/>
                    <UpdateUser/>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6, sm: 6 }}>
              <Paper
                elevation={3} sx={{
                  p: { xs: 2, md: 3 }, borderRadius: { xs: 2, md: 3 },
                  textAlign: "center",
                  background: "linear-gradient(135deg, #ff8e8e, #f1f5f9)",
                }}>
                  <Typography variant='h6' gutterBottom fontWeight={600}
                  sx={{
                    fontSize: {
                      xs: '1rem', md: '1.5rem'
                    }
                  }
                  }>
                 Event Management
                </Typography>
                <Divider/>
                  <AddEvent/>
                  <RemoveEvent/>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  )
}

export default Admin