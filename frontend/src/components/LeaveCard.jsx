import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CalendarMonth,
  AccessTime,
  ChatBubbleOutline,
  CheckCircleOutline,
  HighlightOff,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { DEPARTMENT_CONFIG } from '../constants/departments';
import { useLeaveTypes } from '../context/LeaveTypeContext';

/**
 * Status color and label mapping
 */
const STATUS_CONFIG = {
  pending: { color: 'warning', label: 'Pending', dot: '#fbbf24' },
  approved: { color: 'success', label: 'Approved', dot: '#34d399' },
  rejected: { color: 'error', label: 'Rejected', dot: '#f87171' },
  cancelled: { color: 'default', label: 'Cancelled', dot: '#8892b0' },
};

/**
 * Premium leave request card with status dot, hover effects, and review comment section
 */
const LeaveCard = ({ leave, onCancel, onReview, showEmployee = false }) => {
  const { leaveTypes } = useLeaveTypes();
  const statusConfig = STATUS_CONFIG[leave.status] || STATUS_CONFIG.pending;
  
  const typeObj = leaveTypes.find(t => t.identifier === leave.leaveType) || {};
  const typeColor = typeObj.color || '#818cf8';
  const typeEmoji = typeObj.icon || '📋';
  const typeName = typeObj.name || leave.leaveType;
  const duration = leave.duration ||
    dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1;

  return (
    <Card
      sx={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${typeColor}15`
              : `0 8px 28px rgba(0,0,0,0.08), 0 0 0 1px ${typeColor}15`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 3,
          background: `linear-gradient(90deg, ${typeColor}, ${typeColor}66)`,
          opacity: 0.7,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${typeEmoji} ${typeName}`}
              size="small"
              sx={{
                bgcolor: `${typeColor}12`,
                color: typeColor,
                fontWeight: 700,
                textTransform: 'capitalize',
                fontSize: '0.73rem',
                borderRadius: 2,
                border: `1px solid ${typeColor}18`,
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: statusConfig.dot,
                  boxShadow: `0 0 6px ${statusConfig.dot}60`,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: statusConfig.dot,
                  fontSize: '0.7rem',
                }}
              >
                {statusConfig.label}
              </Typography>
            </Box>
          </Box>

          {leave.status === 'pending' && (
            <Box sx={{ display: 'flex', gap: 0.3 }}>
              {onReview && (
                <>
                  <Tooltip title="Approve" arrow>
                    <IconButton
                      size="small"
                      onClick={() => onReview(leave, 'approved')}
                      sx={{
                        color: 'success.main',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          bgcolor: 'rgba(52,211,153,0.1)',
                        },
                      }}
                    >
                      <CheckCircleOutline sx={{ fontSize: 19 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject" arrow>
                    <IconButton
                      size="small"
                      onClick={() => onReview(leave, 'rejected')}
                      sx={{
                        color: 'error.main',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          bgcolor: 'rgba(248,113,113,0.08)',
                        },
                      }}
                    >
                      <HighlightOff sx={{ fontSize: 19 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {onCancel && (
                <Tooltip title="Cancel Request" arrow>
                  <IconButton
                    size="small"
                    onClick={() => onCancel(leave._id)}
                    sx={{
                      color: 'text.secondary',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'error.main',
                        transform: 'scale(1.1)',
                        bgcolor: 'rgba(248,113,113,0.08)',
                      },
                    }}
                  >
                    <CancelIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>

        {/* Employee name (if applicable) */}
        {showEmployee && leave.employee && (
          <Box sx={{ mb: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700 }}
            >
              {leave.employee.name || 'Unknown'}
            </Typography>
            {leave.employee.department && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                  {(DEPARTMENT_CONFIG[leave.employee.department] || {}).emoji || '🏢'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.7rem' }}
                >
                  {leave.employee.department}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Reason */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 2,
            lineHeight: 1.65,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {leave.reason}
        </Typography>

        {/* Date and duration info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            flexWrap: 'wrap',
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(136,146,176,0.04)'
                : 'rgba(0,0,0,0.02)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              color: 'text.secondary',
            }}
          >
            <CalendarMonth sx={{ fontSize: 15, opacity: 0.7 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {dayjs(leave.startDate).format('MMM D')} — {dayjs(leave.endDate).format('MMM D, YYYY')}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              color: 'text.secondary',
            }}
          >
            <AccessTime sx={{ fontSize: 15, opacity: 0.7 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {duration} day{duration > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        {/* Review Comment */}
        {leave.reviewComment && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(136,146,176,0.04)'
                  : 'rgba(0,0,0,0.02)',
              borderLeft: '3px solid',
              borderColor:
                leave.status === 'approved' ? 'success.main' : 'error.main',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <ChatBubbleOutline sx={{ fontSize: 13, color: 'text.secondary', opacity: 0.6 }} />
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.68rem' }}
              >
                Manager's Note
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
              {leave.reviewComment}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveCard;
