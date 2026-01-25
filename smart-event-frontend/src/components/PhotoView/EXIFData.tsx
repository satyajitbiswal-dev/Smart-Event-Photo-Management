import React from 'react'
import type { PhotoEXIF } from '../../types/types';
import { Stack, Typography } from '@mui/material';

type ExifSectionProps = {
  exif?: PhotoEXIF;
};


const PhotoEXIFData = ({exif}: ExifSectionProps) => {
    if(!exif) return null
    const photoexifDisplay = [
        {
            label: "Location",
            value: exif?.gps_latitude && exif?.gps_longitude ?
             `${exif?.gps_latitude}, ${exif?.gps_longitude}` : null,
        },
        {
            label: "Camera",
            value: exif?.camera_model ?? null,
        },
        {
            label: "Aperture",
            value: exif?.aperture ?? null,
        },
        {
            label: "Shutter Speed",
            value: exif?.shutter_speed ?? null,
        },
    ];
  return (
    <Stack direction={'column'} spacing={'1'}>
        {
            photoexifDisplay.filter((e) => e.value !== null).map((exif) => (
                <Stack direction={'row'} spacing={0.5} key={exif.label}>
                    <Typography variant='subtitle2'> {exif.label}: </Typography>
                    <Typography variant='body2'> {exif.value} </Typography>
                </Stack>
            ))
        }
    </Stack>
  )
}

export default PhotoEXIFData
