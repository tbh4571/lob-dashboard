// Local, in-memory mock data for the LOB Dashboard UI.
// Stands in for the backend described in ../types.ts until one is wired up.
// Timestamps are generated relative to "now" so the data stays plausible
// no matter when the app is opened.

import type {
  Application,
  Component,
  Environment,
  PipelineRun,
  PipelineStep,
  RunStatus,
  RunType,
  Schedule,
  StepStatus,
} from '../types';
import { makeRunName, slugify } from './id';

const NOW = Date.now();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const iso = (msAgo: number) => new Date(NOW - msAgo).toISOString();

export const applications: Application[] = [
  {
    id: 'app-1',
    name: 'Customer Portal',
    description: 'External facing customer self-service portal',
    owner: 'Digital Experience',
    createdAt: iso(220 * DAY),
    updatedAt: iso(3 * HOUR),
  },
  {
    id: 'app-2',
    name: 'Claims Processing',
    description: 'Core claims intake and adjudication system',
    owner: 'Claims Ops',
    createdAt: iso(280 * DAY),
    updatedAt: iso(19 * HOUR),
  },
  {
    id: 'app-3',
    name: 'Policy Admin',
    description: 'Policy lifecycle management',
    owner: 'Underwriting',
    createdAt: iso(150 * DAY),
    updatedAt: iso(30 * HOUR),
  },
  {
    id: 'app-4',
    name: 'Billing & Payments',
    description: 'Invoicing, billing calculation, and payment processing',
    owner: 'Finance Systems',
    createdAt: iso(190 * DAY),
    updatedAt: iso(8 * HOUR),
  },
  {
    id: 'app-5',
    name: 'Agent Portal',
    description: 'Internal tools for agents to manage policies and quotes',
    owner: 'Distribution',
    createdAt: iso(130 * DAY),
    updatedAt: iso(11 * HOUR),
  },
  {
    id: 'app-6',
    name: 'Fraud Detection',
    description: 'Real-time fraud scoring and case investigation',
    owner: 'Risk & Compliance',
    createdAt: iso(95 * DAY),
    updatedAt: iso(5 * MINUTE),
  },
  {
    id: 'app-7',
    name: 'Underwriting Workbench',
    description: 'Risk assessment and quoting workbench for underwriters',
    owner: 'Underwriting',
    createdAt: iso(170 * DAY),
    updatedAt: iso(7 * HOUR),
  },
  {
    id: 'app-8',
    name: 'Reinsurance Ceding',
    description: 'Treaty management and ceding calculations',
    owner: 'Reinsurance',
    createdAt: iso(210 * DAY),
    updatedAt: iso(16 * HOUR),
  },
  {
    id: 'app-9',
    name: 'Regulatory Reporting',
    description: 'Statutory and regulatory filing pipeline',
    owner: 'Compliance',
    createdAt: iso(240 * DAY),
    updatedAt: iso(4 * HOUR),
  },
  {
    id: 'app-10',
    name: 'Employee Portal',
    description: 'Internal employee self-service portal',
    owner: 'HR Technology',
    createdAt: iso(110 * DAY),
    updatedAt: iso(9 * HOUR),
  },
];

export const components: Component[] = [
  {
    id: 'comp-1',
    applicationId: 'app-1',
    name: 'portal-ui',
    description: 'React frontend for customer portal',
    imageRepository: 'ghcr.io/lob/portal-ui',
    currentImageTag: '1.4.2',
    environments: {
      nonprod: { status: 'healthy', version: '1.4.2', lastDeployedAt: iso(6 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '1.4.1', lastDeployedAt: iso(2 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '1.4.0', lastDeployedAt: iso(6 * DAY), replicas: 4, readyReplicas: 4 },
    },
    createdAt: iso(220 * DAY),
    updatedAt: iso(6 * HOUR),
  },
  {
    id: 'comp-2',
    applicationId: 'app-1',
    name: 'portal-api',
    description: 'Backend API for customer portal',
    imageRepository: 'ghcr.io/lob/portal-api',
    currentImageTag: '2.1.0',
    environments: {
      nonprod: { status: 'healthy', version: '2.1.0', lastDeployedAt: iso(4 * HOUR), replicas: 3, readyReplicas: 3 },
      preprod: { status: 'degraded', version: '2.0.8', lastDeployedAt: iso(3 * DAY), replicas: 3, readyReplicas: 2 },
      production: { status: 'healthy', version: '2.0.5', lastDeployedAt: iso(10 * DAY), replicas: 6, readyReplicas: 6 },
    },
    createdAt: iso(220 * DAY),
    updatedAt: iso(4 * HOUR),
  },
  {
    id: 'comp-3',
    applicationId: 'app-2',
    name: 'claims-worker',
    description: 'Async claims processing worker',
    imageRepository: 'ghcr.io/lob/claims-worker',
    currentImageTag: '3.0.1',
    environments: {
      nonprod: { status: 'healthy', version: '3.0.1', lastDeployedAt: iso(35 * MINUTE), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '3.0.0', lastDeployedAt: iso(3 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '2.9.4', lastDeployedAt: iso(15 * DAY), replicas: 5, readyReplicas: 5 },
    },
    createdAt: iso(280 * DAY),
    updatedAt: iso(35 * MINUTE),
  },
  {
    id: 'comp-4',
    applicationId: 'app-3',
    name: 'policy-service',
    description: 'Policy CRUD and lifecycle service',
    imageRepository: 'ghcr.io/lob/policy-service',
    currentImageTag: '1.8.3',
    environments: {
      nonprod: { status: 'healthy', version: '1.8.3', lastDeployedAt: iso(30 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'unknown', version: '1.8.1', lastDeployedAt: iso(7 * DAY), replicas: 2, readyReplicas: 0 },
      production: { status: 'healthy', version: '1.7.9', lastDeployedAt: iso(20 * DAY), replicas: 4, readyReplicas: 4 },
    },
    createdAt: iso(150 * DAY),
    updatedAt: iso(30 * HOUR),
  },
  {
    id: 'comp-5',
    applicationId: 'app-2',
    name: 'claims-api',
    description: 'REST API fronting claims processing',
    imageRepository: 'ghcr.io/lob/claims-api',
    currentImageTag: '2.4.0',
    environments: {
      nonprod: { status: 'healthy', version: '2.4.0', lastDeployedAt: iso(9 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '2.3.6', lastDeployedAt: iso(4 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '2.3.5', lastDeployedAt: iso(12 * DAY), replicas: 4, readyReplicas: 4 },
    },
    createdAt: iso(280 * DAY),
    updatedAt: iso(9 * HOUR),
  },
  {
    id: 'comp-6',
    applicationId: 'app-3',
    name: 'policy-ui',
    description: 'Frontend for policy administration',
    imageRepository: 'ghcr.io/lob/policy-ui',
    currentImageTag: '1.2.7',
    environments: {
      nonprod: { status: 'healthy', version: '1.2.7', lastDeployedAt: iso(12 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'deploying', version: '1.2.6', lastDeployedAt: iso(5 * DAY), replicas: 2, readyReplicas: 1 },
      production: { status: 'healthy', version: '1.2.4', lastDeployedAt: iso(18 * DAY), replicas: 3, readyReplicas: 3 },
    },
    createdAt: iso(150 * DAY),
    updatedAt: iso(12 * HOUR),
  },
  {
    id: 'comp-7',
    applicationId: 'app-4',
    name: 'billing-service',
    description: 'Billing calculation and invoicing service',
    imageRepository: 'ghcr.io/lob/billing-service',
    currentImageTag: '4.1.2',
    environments: {
      nonprod: { status: 'healthy', version: '4.1.2', lastDeployedAt: iso(10 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '4.1.1', lastDeployedAt: iso(6 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '4.0.9', lastDeployedAt: iso(16 * DAY), replicas: 4, readyReplicas: 4 },
    },
    createdAt: iso(190 * DAY),
    updatedAt: iso(10 * HOUR),
  },
  {
    id: 'comp-8',
    applicationId: 'app-4',
    name: 'payment-gateway',
    description: 'Payment processing and gateway integration',
    imageRepository: 'ghcr.io/lob/payment-gateway',
    currentImageTag: '5.0.3',
    environments: {
      nonprod: { status: 'healthy', version: '5.0.3', lastDeployedAt: iso(8 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '5.0.2', lastDeployedAt: iso(4 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'degraded', version: '4.9.8', lastDeployedAt: iso(2 * DAY), replicas: 6, readyReplicas: 4 },
    },
    createdAt: iso(190 * DAY),
    updatedAt: iso(2 * DAY),
  },
  {
    id: 'comp-9',
    applicationId: 'app-5',
    name: 'agent-portal-ui',
    description: 'React frontend for the agent portal',
    imageRepository: 'ghcr.io/lob/agent-portal-ui',
    currentImageTag: '1.6.0',
    environments: {
      nonprod: { status: 'healthy', version: '1.6.0', lastDeployedAt: iso(14 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '1.5.9', lastDeployedAt: iso(7 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '1.5.7', lastDeployedAt: iso(22 * DAY), replicas: 3, readyReplicas: 3 },
    },
    createdAt: iso(130 * DAY),
    updatedAt: iso(14 * HOUR),
  },
  {
    id: 'comp-10',
    applicationId: 'app-5',
    name: 'agent-portal-api',
    description: 'Backend API for agent portal',
    imageRepository: 'ghcr.io/lob/agent-portal-api',
    currentImageTag: '2.0.4',
    environments: {
      nonprod: { status: 'healthy', version: '2.0.4', lastDeployedAt: iso(11 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'unknown', version: '2.0.3', lastDeployedAt: iso(9 * DAY), replicas: 2, readyReplicas: 0 },
      production: { status: 'healthy', version: '2.0.1', lastDeployedAt: iso(25 * DAY), replicas: 4, readyReplicas: 4 },
    },
    createdAt: iso(130 * DAY),
    updatedAt: iso(11 * HOUR),
  },
  {
    id: 'comp-11',
    applicationId: 'app-6',
    name: 'fraud-scoring-engine',
    description: 'Real-time transaction fraud scoring engine',
    imageRepository: 'ghcr.io/lob/fraud-scoring-engine',
    currentImageTag: '3.3.0',
    environments: {
      nonprod: { status: 'healthy', version: '3.3.0', lastDeployedAt: iso(5 * MINUTE), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '3.2.4', lastDeployedAt: iso(10 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '3.2.1', lastDeployedAt: iso(28 * DAY), replicas: 5, readyReplicas: 5 },
    },
    createdAt: iso(95 * DAY),
    updatedAt: iso(5 * MINUTE),
  },
  {
    id: 'comp-12',
    applicationId: 'app-6',
    name: 'fraud-case-manager',
    description: 'Fraud case investigation and management UI',
    imageRepository: 'ghcr.io/lob/fraud-case-manager',
    currentImageTag: '1.1.5',
    environments: {
      nonprod: { status: 'healthy', version: '1.1.5', lastDeployedAt: iso(13 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '1.1.4', lastDeployedAt: iso(7 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '1.1.2', lastDeployedAt: iso(19 * DAY), replicas: 3, readyReplicas: 3 },
    },
    createdAt: iso(95 * DAY),
    updatedAt: iso(13 * HOUR),
  },
  {
    id: 'comp-13',
    applicationId: 'app-7',
    name: 'uw-rules-engine',
    description: 'Automated underwriting rules engine',
    imageRepository: 'ghcr.io/lob/uw-rules-engine',
    currentImageTag: '2.6.1',
    environments: {
      nonprod: { status: 'healthy', version: '2.6.1', lastDeployedAt: iso(7 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '2.6.0', lastDeployedAt: iso(5 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '2.5.8', lastDeployedAt: iso(21 * DAY), replicas: 4, readyReplicas: 4 },
    },
    createdAt: iso(170 * DAY),
    updatedAt: iso(7 * HOUR),
  },
  {
    id: 'comp-14',
    applicationId: 'app-7',
    name: 'uw-document-service',
    description: 'Document intake and OCR for underwriting',
    imageRepository: 'ghcr.io/lob/uw-document-service',
    currentImageTag: '1.9.0',
    environments: {
      nonprod: { status: 'healthy', version: '1.9.0', lastDeployedAt: iso(15 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'degraded', version: '1.8.7', lastDeployedAt: iso(6 * DAY), replicas: 2, readyReplicas: 1 },
      production: { status: 'healthy', version: '1.8.5', lastDeployedAt: iso(24 * DAY), replicas: 3, readyReplicas: 3 },
    },
    createdAt: iso(170 * DAY),
    updatedAt: iso(15 * HOUR),
  },
  {
    id: 'comp-15',
    applicationId: 'app-8',
    name: 'ceding-calculator',
    description: 'Calculates ceded premium and loss shares',
    imageRepository: 'ghcr.io/lob/ceding-calculator',
    currentImageTag: '1.4.3',
    environments: {
      nonprod: { status: 'healthy', version: '1.4.3', lastDeployedAt: iso(9 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '1.4.2', lastDeployedAt: iso(4 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '1.4.0', lastDeployedAt: iso(17 * DAY), replicas: 3, readyReplicas: 3 },
    },
    createdAt: iso(210 * DAY),
    updatedAt: iso(9 * HOUR),
  },
  {
    id: 'comp-16',
    applicationId: 'app-8',
    name: 'treaty-manager',
    description: 'Reinsurance treaty configuration and tracking',
    imageRepository: 'ghcr.io/lob/treaty-manager',
    currentImageTag: '2.1.4',
    environments: {
      nonprod: { status: 'healthy', version: '2.1.4', lastDeployedAt: iso(16 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '2.1.3', lastDeployedAt: iso(9 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'unknown', version: '2.1.0', lastDeployedAt: iso(30 * DAY), replicas: 3, readyReplicas: 0 },
    },
    createdAt: iso(210 * DAY),
    updatedAt: iso(16 * HOUR),
  },
  {
    id: 'comp-17',
    applicationId: 'app-9',
    name: 'reg-report-generator',
    description: 'Generates statutory filings',
    imageRepository: 'ghcr.io/lob/reg-report-generator',
    currentImageTag: '3.5.2',
    environments: {
      nonprod: { status: 'healthy', version: '3.5.2', lastDeployedAt: iso(10 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '3.5.1', lastDeployedAt: iso(6 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '3.4.9', lastDeployedAt: iso(14 * DAY), replicas: 4, readyReplicas: 4 },
    },
    createdAt: iso(240 * DAY),
    updatedAt: iso(10 * HOUR),
  },
  {
    id: 'comp-18',
    applicationId: 'app-9',
    name: 'reg-data-pipeline',
    description: 'ETL pipeline feeding regulatory reports',
    imageRepository: 'ghcr.io/lob/reg-data-pipeline',
    currentImageTag: '4.2.0',
    environments: {
      nonprod: { status: 'degraded', version: '4.2.0', lastDeployedAt: iso(4 * HOUR), replicas: 3, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '4.1.8', lastDeployedAt: iso(3 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '4.1.5', lastDeployedAt: iso(11 * DAY), replicas: 5, readyReplicas: 5 },
    },
    createdAt: iso(240 * DAY),
    updatedAt: iso(4 * HOUR),
  },
  {
    id: 'comp-19',
    applicationId: 'app-9',
    name: 'reg-audit-trail',
    description: 'Immutable audit log service for filings',
    imageRepository: 'ghcr.io/lob/reg-audit-trail',
    currentImageTag: '1.0.9',
    environments: {
      nonprod: { status: 'healthy', version: '1.0.9', lastDeployedAt: iso(12 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '1.0.8', lastDeployedAt: iso(7 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '1.0.6', lastDeployedAt: iso(23 * DAY), replicas: 3, readyReplicas: 3 },
    },
    createdAt: iso(240 * DAY),
    updatedAt: iso(12 * HOUR),
  },
  {
    id: 'comp-20',
    applicationId: 'app-10',
    name: 'employee-portal-ui',
    description: 'Frontend for employee self-service',
    imageRepository: 'ghcr.io/lob/employee-portal-ui',
    currentImageTag: '1.3.1',
    environments: {
      nonprod: { status: 'healthy', version: '1.3.1', lastDeployedAt: iso(13 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'healthy', version: '1.3.0', lastDeployedAt: iso(5 * DAY), replicas: 2, readyReplicas: 2 },
      production: { status: 'healthy', version: '1.2.8', lastDeployedAt: iso(15 * DAY), replicas: 3, readyReplicas: 3 },
    },
    createdAt: iso(110 * DAY),
    updatedAt: iso(13 * HOUR),
  },
  {
    id: 'comp-21',
    applicationId: 'app-10',
    name: 'employee-portal-api',
    description: 'Backend API for employee portal',
    imageRepository: 'ghcr.io/lob/employee-portal-api',
    currentImageTag: '2.2.3',
    environments: {
      nonprod: { status: 'healthy', version: '2.2.3', lastDeployedAt: iso(9 * HOUR), replicas: 2, readyReplicas: 2 },
      preprod: { status: 'deploying', version: '2.2.2', lastDeployedAt: iso(1 * DAY), replicas: 2, readyReplicas: 1 },
      production: { status: 'healthy', version: '2.2.0', lastDeployedAt: iso(20 * DAY), replicas: 4, readyReplicas: 4 },
    },
    createdAt: iso(110 * DAY),
    updatedAt: iso(9 * HOUR),
  },
];

export const schedules: Schedule[] = [
  {
    id: 'sch-1',
    componentId: 'comp-1',
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    hour: 2,
    mode: 'automated',
    environments: ['nonprod'],
    enabled: true,
    createdBy: 'persona-dev',
    createdAt: iso(75 * DAY),
    updatedAt: iso(75 * DAY),
  },
  {
    id: 'sch-2',
    componentId: 'comp-2',
    frequency: 'weekly',
    dayOfWeek: 0, // Sunday
    hour: 3,
    mode: 'automated',
    environments: ['nonprod', 'preprod'],
    enabled: true,
    createdBy: 'persona-dev',
    createdAt: iso(45 * DAY),
    updatedAt: iso(14 * DAY),
  },
  {
    id: 'sch-3',
    componentId: 'comp-3',
    frequency: 'weekly',
    dayOfWeek: 2, // Tuesday
    hour: 1,
    mode: 'manual',
    environments: [],
    enabled: true,
    createdBy: 'persona-dev',
    createdAt: iso(60 * DAY),
    updatedAt: iso(60 * DAY),
  },
  {
    id: 'sch-4',
    componentId: 'comp-4',
    frequency: 'biweekly',
    dayOfWeek: 1, // Monday
    hour: 4,
    mode: 'automated',
    environments: ['preprod'],
    enabled: false,
    createdBy: 'persona-ops',
    createdAt: iso(100 * DAY),
    updatedAt: iso(20 * DAY),
  },
  {
    id: 'sch-5',
    componentId: 'comp-8',
    frequency: 'weekly',
    dayOfWeek: 3, // Wednesday
    hour: 2,
    mode: 'automated',
    environments: ['nonprod'],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(50 * DAY),
    updatedAt: iso(50 * DAY),
  },
  {
    id: 'sch-6',
    componentId: 'comp-11',
    frequency: 'biweekly',
    dayOfWeek: 4, // Thursday
    hour: 23,
    mode: 'automated',
    environments: ['nonprod', 'preprod'],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(40 * DAY),
    updatedAt: iso(40 * DAY),
  },
  {
    id: 'sch-7',
    componentId: 'comp-13',
    frequency: 'weekly',
    dayOfWeek: 5, // Friday
    hour: 22,
    mode: 'manual',
    environments: [],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(35 * DAY),
    updatedAt: iso(35 * DAY),
  },
  {
    id: 'sch-8',
    componentId: 'comp-19',
    frequency: 'weekly',
    dayOfWeek: 6, // Saturday
    hour: 5,
    mode: 'automated',
    environments: ['nonprod', 'preprod', 'production'],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(65 * DAY),
    updatedAt: iso(65 * DAY),
  },
  {
    id: 'sch-9',
    componentId: 'comp-5',
    frequency: 'weekly',
    dayOfWeek: 3, // Wednesday
    hour: 2,
    mode: 'automated',
    environments: ['nonprod'],
    enabled: true,
    createdBy: 'persona-dev',
    createdAt: iso(55 * DAY),
    updatedAt: iso(55 * DAY),
  },
  {
    id: 'sch-10',
    componentId: 'comp-6',
    frequency: 'weekly',
    dayOfWeek: 4, // Thursday
    hour: 3,
    mode: 'manual',
    environments: [],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(48 * DAY),
    updatedAt: iso(48 * DAY),
  },
  {
    id: 'sch-11',
    componentId: 'comp-7',
    frequency: 'biweekly',
    dayOfWeek: 2, // Tuesday
    hour: 1,
    mode: 'automated',
    environments: ['nonprod', 'preprod'],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(80 * DAY),
    updatedAt: iso(30 * DAY),
  },
  {
    id: 'sch-12',
    componentId: 'comp-9',
    frequency: 'weekly',
    dayOfWeek: 0, // Sunday
    hour: 4,
    mode: 'automated',
    environments: ['nonprod'],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(42 * DAY),
    updatedAt: iso(42 * DAY),
  },
  {
    id: 'sch-13',
    componentId: 'comp-10',
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    hour: 5,
    mode: 'manual',
    environments: [],
    enabled: false,
    createdBy: 'persona-ops',
    createdAt: iso(70 * DAY),
    updatedAt: iso(15 * DAY),
  },
  {
    id: 'sch-14',
    componentId: 'comp-12',
    frequency: 'biweekly',
    dayOfWeek: 5, // Friday
    hour: 20,
    mode: 'automated',
    environments: ['nonprod', 'preprod', 'production'],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(60 * DAY),
    updatedAt: iso(60 * DAY),
  },
  {
    id: 'sch-15',
    componentId: 'comp-14',
    frequency: 'weekly',
    dayOfWeek: 2, // Tuesday
    hour: 6,
    mode: 'automated',
    environments: ['nonprod'],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(38 * DAY),
    updatedAt: iso(38 * DAY),
  },
  {
    id: 'sch-16',
    componentId: 'comp-15',
    frequency: 'weekly',
    dayOfWeek: 3, // Wednesday
    hour: 1,
    mode: 'manual',
    environments: [],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(52 * DAY),
    updatedAt: iso(52 * DAY),
  },
  {
    id: 'sch-17',
    componentId: 'comp-16',
    frequency: 'biweekly',
    dayOfWeek: 6, // Saturday
    hour: 7,
    mode: 'automated',
    environments: ['preprod'],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(90 * DAY),
    updatedAt: iso(90 * DAY),
  },
  {
    id: 'sch-18',
    componentId: 'comp-17',
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    hour: 23,
    mode: 'automated',
    environments: ['nonprod'],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(33 * DAY),
    updatedAt: iso(33 * DAY),
  },
  {
    id: 'sch-19',
    componentId: 'comp-18',
    frequency: 'weekly',
    dayOfWeek: 4, // Thursday
    hour: 2,
    mode: 'automated',
    environments: ['nonprod', 'preprod'],
    enabled: false,
    createdBy: 'persona-ops',
    createdAt: iso(58 * DAY),
    updatedAt: iso(10 * DAY),
  },
  {
    id: 'sch-20',
    componentId: 'comp-20',
    frequency: 'weekly',
    dayOfWeek: 0, // Sunday
    hour: 6,
    mode: 'manual',
    environments: [],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(44 * DAY),
    updatedAt: iso(44 * DAY),
  },
  {
    id: 'sch-21',
    componentId: 'comp-21',
    frequency: 'biweekly',
    dayOfWeek: 3, // Wednesday
    hour: 3,
    mode: 'automated',
    environments: ['nonprod'],
    enabled: true,
    createdBy: 'persona-ops',
    createdAt: iso(28 * DAY),
    updatedAt: iso(28 * DAY),
  },
];

function makeSteps(names: string[], finalStatus: 'success' | 'failed' = 'success', endedAgo = 0): PipelineStep[] {
  const stepDuration = 45_000;
  return names.map((name, i) => {
    const isLast = i === names.length - 1;
    const status: StepStatus = isLast && finalStatus === 'failed' ? 'failed' : 'success';
    const offsetFromEnd = (names.length - i - 1) * stepDuration;
    const end = endedAgo + offsetFromEnd;
    const start = end + stepDuration;
    return {
      id: `step-${i + 1}`,
      name,
      status,
      order: i + 1,
      startTime: iso(start),
      endTime: iso(end),
      durationMs: stepDuration,
      logsUrl: '#',
      message: status === 'failed' ? 'Step failed – see logs' : undefined,
    };
  });
}

const CI_STEP_NAMES = ['Checkout', 'Build', 'Unit Tests', 'Scan', 'Push Image'];
const CD_STEP_NAMES = ['Approve', 'Fetch Artifact', 'Deploy OpenShift', 'Smoke Tests', 'Notify'];

interface RebaseOpts {
  /** Only used to keep fake externalUrl numbers distinct; identity comes from the random run name. */
  n: number;
  agoMs: number;
  status?: Extract<RunStatus, 'success' | 'failed' | 'running'>;
  triggeredBy?: string;
  trigger?: PipelineRun['trigger'];
}

interface RepaveOpts {
  /** Only used to keep fake externalUrl numbers distinct; identity comes from the random run name. */
  n: number;
  agoMs: number;
  environments: Environment[];
  status?: Extract<RunStatus, 'success' | 'failed' | 'cancelled' | 'pending'>;
  triggeredBy?: string;
  trigger?: PipelineRun['trigger'];
}

function makeRebaseRun(component: Component, opts: RebaseOpts): PipelineRun {
  const { n, agoMs, status = 'success', triggeredBy = 'persona-dev', trigger = 'on-demand' } = opts;
  const application = getApplicationById(component.applicationId);
  const name = makeRunName('rebase', application?.name ?? component.applicationId, component.name);
  if (status === 'running') {
    return {
      id: name,
      componentId: component.id,
      applicationId: component.applicationId,
      type: 'ci',
      label: name,
      status: 'running',
      trigger,
      triggeredBy,
      startTime: iso(agoMs),
      externalUrl: `https://github.com/lob/${component.name}/actions/runs/${1000 + n}`,
      steps: [
        { id: 's1', name: 'Checkout', status: 'success', order: 1, startTime: iso(agoMs), endTime: iso(agoMs - 18_000), durationMs: 18_000 },
        { id: 's2', name: 'Build', status: 'success', order: 2, startTime: iso(agoMs - 18_000), endTime: iso(agoMs - 132_000), durationMs: 114_000 },
        { id: 's3', name: 'Unit Tests', status: 'running', order: 3, startTime: iso(agoMs - 132_000) },
        { id: 's4', name: 'Scan', status: 'pending', order: 4 },
        { id: 's5', name: 'Push Image', status: 'pending', order: 5 },
      ],
      createdAt: iso(agoMs),
    };
  }
  const durationMs = 750_000;
  return {
    id: name,
    componentId: component.id,
    applicationId: component.applicationId,
    type: 'ci',
    label: name,
    status,
    trigger,
    triggeredBy,
    startTime: iso(agoMs + durationMs),
    endTime: iso(agoMs),
    durationMs,
    externalUrl: `https://github.com/lob/${component.name}/actions/runs/${1000 + n}`,
    steps: makeSteps(CI_STEP_NAMES, status === 'failed' ? 'failed' : 'success', agoMs),
    createdAt: iso(agoMs + durationMs),
  };
}

function makeRepaveRun(component: Component, opts: RepaveOpts): PipelineRun {
  const { n, agoMs, environments, status = 'success', triggeredBy = 'persona-ops', trigger = 'on-demand' } = opts;
  const application = getApplicationById(component.applicationId);
  const name = makeRunName('repave', application?.name ?? component.applicationId, component.name);
  const id = name;
  const label = name;
  const externalUrl = `https://app.harness.io/.../executions/${2000 + n}`;

  if (status === 'pending') {
    return {
      id,
      componentId: component.id,
      applicationId: component.applicationId,
      type: 'cd',
      label,
      status: 'pending',
      trigger,
      triggeredBy,
      environments,
      startTime: iso(agoMs),
      steps: CD_STEP_NAMES.slice(1).map((name, i) => ({ id: `s${i + 1}`, name, status: 'pending' as const, order: i + 1 })),
      createdAt: iso(agoMs),
    };
  }
  if (status === 'cancelled') {
    return {
      id,
      componentId: component.id,
      applicationId: component.applicationId,
      type: 'cd',
      label,
      status: 'cancelled',
      trigger,
      triggeredBy,
      environments,
      startTime: iso(agoMs + 90_000),
      endTime: iso(agoMs),
      durationMs: 90_000,
      externalUrl,
      steps: [
        { id: 's1', name: 'Approve', status: 'success', order: 1, startTime: iso(agoMs + 90_000), endTime: iso(agoMs + 45_000), durationMs: 45_000 },
        { id: 's2', name: 'Fetch Artifact', status: 'skipped', order: 2 },
        { id: 's3', name: 'Deploy OpenShift', status: 'skipped', order: 3 },
        { id: 's4', name: 'Smoke Tests', status: 'skipped', order: 4 },
        { id: 's5', name: 'Notify', status: 'skipped', order: 5 },
      ],
      createdAt: iso(agoMs + 90_000),
    };
  }
  const durationMs = 495_000;
  return {
    id,
    componentId: component.id,
    applicationId: component.applicationId,
    type: 'cd',
    label,
    status,
    trigger,
    triggeredBy,
    environments,
    startTime: iso(agoMs + durationMs),
    endTime: iso(agoMs),
    durationMs,
    externalUrl,
    steps: makeSteps(CD_STEP_NAMES, status === 'failed' ? 'failed' : 'success', agoMs),
    createdAt: iso(agoMs + durationMs),
  };
}

const [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19, c20, c21] = components;

export const runs: PipelineRun[] = [
  // portal-ui (app-1 / comp-1)
  makeRebaseRun(c1, { n: 1, agoMs: 6 * HOUR }),
  makeRepaveRun(c1, { n: 1, agoMs: 2 * DAY, environments: ['nonprod'], trigger: 'scheduled', triggeredBy: 'system', status: 'failed' }),

  // portal-api (app-1 / comp-2)
  makeRebaseRun(c2, { n: 1, agoMs: 5 * HOUR }),
  makeRepaveRun(c2, { n: 1, agoMs: 3 * DAY, environments: ['preprod'], status: 'failed' }),
  makeRepaveRun(c2, { n: 2, agoMs: -30 * MINUTE, environments: ['nonprod'], status: 'pending', trigger: 'scheduled', triggeredBy: 'system' }),

  // claims-worker (app-2 / comp-3)
  makeRepaveRun(c3, { n: 1, agoMs: 8 * DAY, environments: ['nonprod'] }),
  makeRebaseRun(c3, { n: 1, agoMs: 3 * MINUTE, status: 'running' }),

  // policy-service (app-3 / comp-4)
  makeRepaveRun(c4, { n: 1, agoMs: 20 * DAY, environments: ['production'] }),
  makeRepaveRun(c4, { n: 2, agoMs: 7 * DAY, environments: ['preprod'], status: 'cancelled' }),
  makeRebaseRun(c4, { n: 1, agoMs: 30 * HOUR }),

  // claims-api (app-2 / comp-5)
  makeRebaseRun(c5, { n: 1, agoMs: 9 * HOUR }),
  makeRepaveRun(c5, { n: 1, agoMs: 4 * DAY, environments: ['nonprod'], status: 'failed' }),

  // policy-ui (app-3 / comp-6)
  makeRebaseRun(c6, { n: 1, agoMs: 12 * HOUR, status: 'failed' }),
  makeRepaveRun(c6, { n: 1, agoMs: 5 * DAY, environments: ['preprod'] }),

  // billing-service (app-4 / comp-7)
  makeRebaseRun(c7, { n: 1, agoMs: 10 * HOUR }),
  makeRepaveRun(c7, { n: 1, agoMs: 6 * DAY, environments: ['nonprod'] }),

  // payment-gateway (app-4 / comp-8)
  makeRebaseRun(c8, { n: 1, agoMs: 8 * HOUR }),
  makeRepaveRun(c8, { n: 1, agoMs: 2 * DAY, environments: ['production'], status: 'failed', triggeredBy: 'persona-ops' }),

  // agent-portal-ui (app-5 / comp-9)
  makeRebaseRun(c9, { n: 1, agoMs: 14 * HOUR }),
  makeRepaveRun(c9, { n: 1, agoMs: 9 * DAY, environments: ['nonprod'], status: 'failed' }),

  // agent-portal-api (app-5 / comp-10)
  makeRebaseRun(c10, { n: 1, agoMs: 11 * HOUR }),
  makeRepaveRun(c10, { n: 1, agoMs: 6 * DAY, environments: ['preprod'] }),

  // fraud-scoring-engine (app-6 / comp-11)
  makeRepaveRun(c11, { n: 1, agoMs: 10 * DAY, environments: ['nonprod'] }),
  makeRebaseRun(c11, { n: 1, agoMs: 5 * MINUTE, status: 'running' }),

  // fraud-case-manager (app-6 / comp-12)
  makeRebaseRun(c12, { n: 1, agoMs: 13 * HOUR }),
  makeRepaveRun(c12, { n: 1, agoMs: 7 * DAY, environments: ['nonprod'] }),

  // uw-rules-engine (app-7 / comp-13)
  makeRebaseRun(c13, { n: 1, agoMs: 7 * HOUR, status: 'failed' }),
  makeRepaveRun(c13, { n: 1, agoMs: 5 * DAY, environments: ['nonprod'] }),

  // uw-document-service (app-7 / comp-14)
  makeRebaseRun(c14, { n: 1, agoMs: 15 * HOUR }),
  makeRepaveRun(c14, { n: 1, agoMs: 8 * DAY, environments: ['preprod'] }),

  // ceding-calculator (app-8 / comp-15)
  makeRebaseRun(c15, { n: 1, agoMs: 9 * HOUR, status: 'failed' }),
  makeRepaveRun(c15, { n: 1, agoMs: 4 * DAY, environments: ['nonprod'] }),

  // treaty-manager (app-8 / comp-16)
  makeRebaseRun(c16, { n: 1, agoMs: 16 * HOUR }),
  makeRepaveRun(c16, { n: 1, agoMs: 9 * DAY, environments: ['production'] }),

  // reg-report-generator (app-9 / comp-17)
  makeRebaseRun(c17, { n: 1, agoMs: 10 * HOUR, status: 'failed' }),
  makeRepaveRun(c17, { n: 1, agoMs: 6 * DAY, environments: ['nonprod'] }),

  // reg-data-pipeline (app-9 / comp-18)
  makeRebaseRun(c18, { n: 1, agoMs: 4 * HOUR, status: 'failed' }),
  makeRepaveRun(c18, { n: 1, agoMs: 3 * DAY, environments: ['nonprod', 'preprod'] }),

  // reg-audit-trail (app-9 / comp-19)
  makeRebaseRun(c19, { n: 1, agoMs: 12 * HOUR }),
  makeRepaveRun(c19, { n: 1, agoMs: 7 * DAY, environments: ['nonprod'] }),

  // employee-portal-ui (app-10 / comp-20)
  makeRebaseRun(c20, { n: 1, agoMs: 13 * HOUR }),
  makeRepaveRun(c20, { n: 1, agoMs: 5 * DAY, environments: ['nonprod'], status: 'failed' }),

  // employee-portal-api (app-10 / comp-21)
  makeRebaseRun(c21, { n: 1, agoMs: 9 * HOUR }),
  makeRepaveRun(c21, { n: 1, agoMs: 1 * DAY, environments: ['preprod'], status: 'failed', triggeredBy: 'persona-ops' }),
];

export function listApplications(): Application[] {
  return applications;
}

export function getApplicationById(id: string): Application | undefined {
  return applications.find((a) => a.id === id);
}

export function listComponents(): Component[] {
  return components;
}

export function getComponentById(id: string): Component | undefined {
  return components.find((c) => c.id === id);
}

export function listComponentsByApplication(applicationId: string): Component[] {
  return components.filter((c) => c.applicationId === applicationId);
}

export function getApplicationBySlug(slug: string): Application | undefined {
  return applications.find((a) => slugify(a.name) === slug);
}

export function getComponentBySlug(applicationSlug: string, componentSlug: string): Component | undefined {
  const app = getApplicationBySlug(applicationSlug);
  if (!app) return undefined;
  return components.find((c) => c.applicationId === app.id && slugify(c.name) === componentSlug);
}

/** `/applications/:slug` path for a given application id, e.g. app-1 -> /applications/customer-portal. */
export function applicationUrl(applicationId: string): string {
  const app = getApplicationById(applicationId);
  return `/applications/${app ? slugify(app.name) : applicationId}`;
}

/** `/components/:appSlug/:componentSlug` path for a given component id. */
export function componentUrl(componentId: string): string {
  const component = getComponentById(componentId);
  if (!component) return `/components/${componentId}`;
  const app = getApplicationById(component.applicationId);
  const appSlug = app ? slugify(app.name) : component.applicationId;
  return `/components/${appSlug}/${slugify(component.name)}`;
}

/** `/rebases/:id` or `/repaves/:id` depending on run type. */
export function runUrl(run: Pick<PipelineRun, 'id' | 'type'>): string {
  return run.type === 'ci' ? `/rebases/${run.id}` : `/repaves/${run.id}`;
}

export interface RunFilter {
  type?: RunType;
  status?: RunStatus;
  componentId?: string;
  applicationId?: string;
  environment?: Environment;
  limit?: number;
}

/**
 * Pure filter over a runs array. Schedules and runs are mutable at runtime
 * (schedule edits, pause/resume, Rebase/Repave), so the live data lives in
 * ../lib/store.tsx; this is reused there instead of duplicating the filter logic.
 */
export function filterRuns(source: PipelineRun[], filter: RunFilter = {}): PipelineRun[] {
  let result = [...source].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  if (filter.type) result = result.filter((r) => r.type === filter.type);
  if (filter.status) result = result.filter((r) => r.status === filter.status);
  if (filter.componentId) result = result.filter((r) => r.componentId === filter.componentId);
  if (filter.applicationId) result = result.filter((r) => r.applicationId === filter.applicationId);
  if (filter.environment) result = result.filter((r) => r.environments?.includes(filter.environment!));
  if (filter.limit) result = result.slice(0, filter.limit);
  return result;
}
