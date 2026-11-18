import { Card, CardContent, Box, Typography } from '@mui/material';

/**
 * Premium animated statistics card with gradient accent bar and hover effects
 */
const StatsCard = ({ title, value, icon, color = '#818cf8', subtitle }) => {
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 12px 32px ${color}18`,
          '& .stats-icon-box': {
            transform: 'scale(1.08) rotate(3deg)',
          },
          '&::before': {
            height: 5,
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          transition: 'height 0.3s ease',
        },
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                fontSize: '0.68rem',
                display: 'block',
                mb: 0.8,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${color}, ${color}99)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
                fontSize: '2rem',
              }}
            >
              {value ?? 0}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  mt: 0.5,
                  display: 'block',
                  fontSize: '0.7rem',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            className="stats-icon-box"
            sx={{
              p: 1.5,
              borderRadius: 3.5,
              background: `linear-gradient(135deg, ${color}18, ${color}08)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: `1px solid ${color}12`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
