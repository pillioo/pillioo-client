// Static presentation data for the Product Entrance page only.
// Not connected to the real Safety Inbox API.

export type LandingPreviewTone = 'warning' | 'info' | 'success';

export interface LandingPreviewTicket {
  ticketId: string;
  drugName: string;
  eventType: string;
  statusLabel: string;
  tone: LandingPreviewTone;
}

export const LANDING_PREVIEW_TICKETS: LandingPreviewTicket[] = [
  {
    ticketId: 'T-2381',
    drugName: 'Dexamethasone Recall',
    eventType: 'Recall · High priority',
    statusLabel: 'Review required',
    tone: 'warning',
  },
  {
    ticketId: 'T-2379',
    drugName: 'Midazolam Shortage',
    eventType: 'Shortage · Inventory check',
    statusLabel: 'Processing',
    tone: 'info',
  },
  {
    ticketId: 'T-2374',
    drugName: 'Sodium Chloride Update',
    eventType: 'Labeling update',
    statusLabel: 'Complete',
    tone: 'success',
  },
];

export interface LandingWorkflowStep {
  index: string;
  title: string;
  description: string;
}

export const LANDING_WORKFLOW_STEPS: LandingWorkflowStep[] = [
  {
    index: '01',
    title: 'Detect',
    description:
      'Pillioo ingests recall, shortage, and labeling events as they are published.',
  },
  {
    index: '02',
    title: 'Analyze',
    description:
      'Inventory impact and supporting evidence are checked before anything reaches a pharmacist.',
  },
  {
    index: '03',
    title: 'Review',
    description:
      'A pharmacist reads the recommended action, inspects evidence, and approves or rejects.',
  },
];
