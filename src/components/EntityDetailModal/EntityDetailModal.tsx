import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
} from '@mui/material';
import { IonIcon } from '@ionic/react';
import {
  closeOutline,
  personOutline,
  ribbonOutline,
  businessOutline,
  calendarOutline,
  schoolOutline,
  locationOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import './EntityDetailModal.css';

export interface EntityDetailModalProps {
  open: boolean;
  onClose: () => void;
  record: any | null;
  entityType?: 'Chief Minister' | 'Governor' | string;
}

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  open,
  onClose,
  record,
  entityType = 'Chief Minister',
}) => {
  if (!record) return null;

  const name = record.name || 'Unknown';
  const state = record.state || record.rulingstate?.Statename || 'Unknown';
  const status = record.status || (record.rulingstate?.Status === 'UT' ? 'UT' : 'State');
  const isPresent = record.ispresent ?? true;

  // Party info (for CMs)
  const partyAbbr =
    record.party ||
    record.party?.abbreviation ||
    record.rawParty?.abbreviation ||
    null;
  const partyName =
    record.partyName ||
    record.party?.partyname ||
    record.rawParty?.partyname ||
    partyAbbr ||
    '';
  const partyColor =
    record.partyColor ||
    record.party?.partyColor ||
    record.rawParty?.partyColor ||
    '#2563eb';

  // Education info
  const education =
    record.highestEducation ||
    record.HighestEducation ||
    record.education ||
    '-';
  const university =
    record.university ||
    record.University ||
    '-';

  // Dates & Periods
  const startDate =
    record.startDate ||
    (Array.isArray(record.rulingperiods)
      ? record.rulingperiods[0]?.startdate
      : record.rulingperiods?.startdate) ||
    '-';

  const endDate =
    record.endDate ||
    (Array.isArray(record.rulingperiods)
      ? record.rulingperiods[0]?.enddate
      : record.rulingperiods?.enddate) ||
    (isPresent ? 'Present' : '-');

  const rulingPeriodsList: Array<{ startdate?: string; enddate?: string }> =
    Array.isArray(record.rulingperiods) ? record.rulingperiods : [];

  // Birth / Origin
  const birthPlace =
    record.birthCity?.cityName
      ? `${record.birthCity.cityName}${
          record.birthCity.state?.Statename ? `, ${record.birthCity.state.Statename}` : ''
        }`
      : typeof record.birthCity === 'string'
      ? record.birthCity
      : null;

  // Get Initials for avatar
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          background: '#ffffff',
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          m: 0,
          p: '20px 24px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        }}
      >
        <div className="detail-modal-header-content">
          <div className="detail-modal-avatar">
            {initials || <IonIcon icon={personOutline} />}
          </div>
          <div>
            <h2 className="detail-modal-title">{name}</h2>
            <div className="detail-modal-subtitle">
              <span>{entityType}</span>
              <span className="subtitle-divider">•</span>
              <span className="subtitle-state">{state}</span>
            </div>
          </div>
        </div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            color: '#64748b',
            background: '#f1f5f9',
            '&:hover': { background: '#e2e8f0', color: '#0f172a' },
          }}
        >
          <IonIcon icon={closeOutline} style={{ fontSize: '20px' }} />
        </IconButton>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent sx={{ p: '20px 24px', background: '#ffffff' }}>
        {/* Quick Badges Row */}
        <div className="detail-badges-row">
          <span className={`detail-status-pill ${status === 'UT' ? 'ut' : 'state'}`}>
            {status === 'UT' ? 'Union Territory' : 'State'}
          </span>

          {partyAbbr && (
            <span
              className="detail-party-pill"
              style={{
                backgroundColor: `${partyColor}18`,
                color: partyColor,
                borderColor: `${partyColor}40`,
              }}
              title={partyName}
            >
              <span
                className="party-color-dot"
                style={{ backgroundColor: partyColor }}
              />
              {partyAbbr} {partyName && partyName !== partyAbbr ? `(${partyName})` : ''}
            </span>
          )}

          <span className={`detail-incumbent-pill ${isPresent ? 'active' : 'former'}`}>
            <span className="pulse-dot" />
            {isPresent ? 'Active Incumbent' : 'Former'}
          </span>
        </div>

        {/* Info Grid */}
        <div className="detail-sections-grid">
          {/* Section 1: Constitutional & Executive Office */}
          <div className="detail-section-card">
            <div className="detail-section-header">
              <IonIcon icon={businessOutline} className="detail-section-icon" />
              <span>Constitutional Office</span>
            </div>
            <div className="detail-items-list">
              <div className="detail-item">
                <span className="detail-label">Designation</span>
                <span className="detail-value">{entityType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Jurisdiction</span>
                <span className="detail-value">{state} ({status})</span>
              </div>
              {record.constituency && record.constituency !== '-' && (
                <div className="detail-item">
                  <span className="detail-label">Constituency</span>
                  <span className="detail-value">{record.constituency}</span>
                </div>
              )}
              {record.reservation && (
                <div className="detail-item">
                  <span className="detail-label">Reservation Category</span>
                  <span className="detail-value">{record.reservation}</span>
                </div>
              )}
              {record.elected && record.elected !== '-' && (
                <div className="detail-item">
                  <span className="detail-label">Elected / Category</span>
                  <span className="detail-value">{record.elected}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Constitutional Mandate</span>
                <span className="detail-value">
                  {entityType === 'Chief Minister'
                    ? `Appointed by Governor of ${state} (Article 164)`
                    : entityType === 'Governor'
                    ? 'Appointed by President of India (Article 155)'
                    : entityType.includes('Lok Sabha')
                    ? `Direct Election by Voters of ${record.constituency || state} (Article 81)`
                    : entityType.includes('Rajya Sabha')
                    ? `Elected by Legislative Assembly of ${state} (Article 80)`
                    : entityType.includes('MLA')
                    ? `Direct Election by Voters of ${record.constituency || state} (Article 170)`
                    : entityType.includes('MLC')
                    ? `${record.elected || 'Elected by State Electorate'} (Article 171)`
                    : 'Constitutional Representation'}
                </span>
              </div>
              {partyName && (
                <div className="detail-item">
                  <span className="detail-label">Party Affiliation</span>
                  <span className="detail-value" style={{ fontWeight: 700, color: partyColor }}>
                    {partyName} {partyAbbr ? `(${partyAbbr})` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Tenure & Ruling Period */}
          <div className="detail-section-card">
            <div className="detail-section-header">
              <IonIcon icon={calendarOutline} className="detail-section-icon" />
              <span>Tenure & Ruling Period</span>
            </div>
            <div className="detail-items-list">
              <div className="detail-item">
                <span className="detail-label">Term Start Date</span>
                <span className="detail-value">{startDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Term End Date</span>
                <span className="detail-value">
                  {isPresent ? (
                    <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <IonIcon icon={checkmarkCircleOutline} /> Present (Serving)
                    </span>
                  ) : (
                    endDate
                  )}
                </span>
              </div>
              {rulingPeriodsList.length > 1 && (
                <div className="detail-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                  <span className="detail-label">All Recorded Terms</span>
                  <div className="ruling-periods-list">
                    {rulingPeriodsList.map((p, idx) => (
                      <div key={idx} className="ruling-period-chip">
                        Term {idx + 1}: {p.startdate || '-'} to {p.enddate || 'Present'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Demographic Profile */}
          <div className="detail-section-card">
            <div className="detail-section-header">
              <IonIcon icon={ribbonOutline} className="detail-section-icon" />
              <span>Demographic Profile</span>
            </div>
            <div className="detail-items-list">
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{record.gender || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Religion</span>
                <span className="detail-value">{record.religion || '-'}</span>
              </div>
              {birthPlace && (
                <div className="detail-item">
                  <span className="detail-label">Place of Origin / Birth</span>
                  <span className="detail-value" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <IonIcon icon={locationOutline} style={{ color: '#0d9488' }} />
                    {birthPlace}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Academic Background */}
          <div className="detail-section-card">
            <div className="detail-section-header">
              <IonIcon icon={schoolOutline} className="detail-section-icon" />
              <span>Academic Credentials</span>
            </div>
            <div className="detail-items-list">
              <div className="detail-item">
                <span className="detail-label">Highest Qualification</span>
                <span className="detail-value" style={{ fontWeight: 600 }}>{education}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">University / Institution</span>
                <span className="detail-value">{university}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* FOOTER */}
      <DialogActions
        sx={{
          p: '14px 24px',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div className="detail-modal-footer-info">
          <span>Record ID:</span> <code>{record.id || 'N/A'}</code>
        </div>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '13px',
            borderRadius: '8px',
            padding: '6px 20px',
            background: '#2563eb',
            '&:hover': { background: '#1d4ed8' },
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

