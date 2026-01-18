import { useMediaQuery, useTheme } from "@mui/material";

type sizebreakpoints = {
    xs: number,
    sm: number,
    md: number,
}

export default function useBreakPointValue({xs, sm, md}:sizebreakpoints) {
    const theme = useTheme()

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const isTablet = useMediaQuery(theme.breakpoints.between('sm','md'))

    const value = isMobile ? xs : isTablet ? sm : md ;
    return value
}