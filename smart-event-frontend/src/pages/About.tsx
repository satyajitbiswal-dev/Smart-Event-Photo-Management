import React from 'react'
import { Box, Typography, Grid, Paper, Button, Avatar, Stack } from '@mui/material'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import CameraAltRounded from '@mui/icons-material/CameraAltRounded'
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded'
import ShieldRounded from '@mui/icons-material/ShieldRounded'
import SearchRounded from '@mui/icons-material/SearchRounded'
import GroupsRounded from '@mui/icons-material/GroupsRounded'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'

export default function About() {
  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>

      {/* HERO SECTION */}
      <Box
        sx={{
          py: 10,
          px: 3,
          background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          Smart Event Memories,
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          Beautifully Organized.
        </Typography>

        <Typography mt={2} maxWidth={700} mx="auto" color="#e0e7ff">
          A modern photo management platform for photographers, coordinators and guests. Upload,
          organize, search and share event memories effortlessly.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            endIcon={<ArrowForwardRounded />}
            sx={{ borderRadius: 3 }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            sx={{ borderRadius: 3, borderColor: 'white', color: 'white' }}
          >
            Learn More
          </Button>
        </Stack>
      </Box>

      {/* FEATURES */}
      <Box px={4} py={8} maxWidth={1200} mx="auto">
        <Typography variant="h4" fontWeight={600} textAlign="center">
          What Makes Us Smart
        </Typography>
        <Typography textAlign="center" color="text.secondary" mt={1}>
          Built around real event workflows and real-world problems
        </Typography>

        <Grid container spacing={4} mt={4}>
          {[{
            icon: <CameraAltRounded color="primary" />,
            title: 'Photographer-first uploads',
            desc: 'Bulk upload support with EXIF data preservation and ownership control.'
          },{
            icon: <CloudUploadRounded color="primary" />,
            title: 'Smart Processing',
            desc: 'Automatic thumbnail generation and metadata extraction.'
          },{
            icon: <SearchRounded color="primary" />,
            title: 'Powerful Search',
            desc: 'Find photos using tags, date, camera data or event filters.'
          },{
            icon: <ShieldRounded color="primary" />,
            title: 'Secure & Private',
            desc: 'Role based access for Admin, Photographer, Coordinator and Guest.'
          },{
            icon: <GroupsRounded color="primary" />,
            title: 'Team Workflow',
            desc: 'Invite members and manage responsibilities cleanly.'
          },{
            icon: <AutoAwesomeRounded color="primary" />,
            title: 'Future-ready AI',
            desc: 'ML powered tagging and smart recognition coming soon.'
          }].map((f, i) => (
            <Grid size={{xs: 12, sm:6, md:4}}key={i}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                <Avatar sx={{ bgcolor: 'primary.light', mb: 2 }}>
                  {f.icon}
                </Avatar>
                <Typography fontWeight={600}>{f.title}</Typography>
                <Typography color="text.secondary" mt={1} fontSize={14}>
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* WHO IT'S FOR */}
      <Box px={4} py={8} bgcolor="#fff">
        <Typography variant="h4" fontWeight={600} textAlign="center">
          Who It's For
        </Typography>

        <Grid container spacing={4} mt={4} maxWidth={1100} mx="auto">
          {[{
            role: 'Photographers',
            desc: 'Upload, tag and manage event photos while keeping ownership.'
          },{
            role: 'Event Coordinators',
            desc: 'Approve, curate and publish galleries for guests.'
          },{
            role: 'Guests',
            desc: 'Search, download and relive event memories easily.'
          }].map((r, i) => (
            <Grid size={{xs: 12,md:4}}key={i}>
              <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600}>{r.role}</Typography>
                <Typography color="text.secondary" mt={1}>{r.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* VISION + CTA */}
      <Box
        px={4}
        py={10}
        textAlign="center"
        sx={{ background: 'linear-gradient(135deg, #eef2ff, #f8fafc)' }}
      >
        <Typography variant="h4" fontWeight={600}>
          Our Vision
        </Typography>
        <Typography mt={2} color="text.secondary" maxWidth={700} mx="auto">
          To redefine how event photography is managed digitally by blending powerful technology
          with simplicity and emotion.
        </Typography>

        <Button
          variant="contained"
          size="large"
          sx={{ mt: 4, borderRadius: 3 }}
          endIcon={<ArrowForwardRounded />}
        >
          Start Your Journey
        </Button>
      </Box>

    </Box>
  )
}
