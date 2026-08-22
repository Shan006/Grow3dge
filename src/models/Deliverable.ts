import mongoose, { Schema, model, models } from 'mongoose';

export const MODULE_NAMES = [
  'Incubator Guidelines',
  'Marketing Foundations',
  'Know Your Customers',
  'Go To Market',
  'Activate Your Community',
  'Media & Partnerships',
] as const;

export type ModuleName = (typeof MODULE_NAMES)[number];

export interface IDeliverable {
  clickupTaskId: string;
  recordTitle: string;
  recordUrl: string;
  sourceTaskUrl?: string;
  projectName: string;
  teamName: string;
  ecosystemName?: string;
  founderEmail: string;
  module: ModuleName;
  deliverableNumber: number;
  deliverableName: string;
  qualitativeRating: 'strong' | 'solid' | 'needs_attention';
  submissionState: 'on_time' | 'late' | 'no_due_date' | 'empty_submission';
  daysLate?: number | null;
  templateCompleteness?: 'complete' | 'partial' | 'missing' | 'inaccessible' | null;
  contentAccess?: 'full' | 'partial' | 'none' | null;
  deliverableLinkUrl?: string | null;
  whatSubmittedSummary?: string | null;
  strengthsSummary?: string | null;
  gapsRisksSummary?: string | null;
  nextStepsQuestions?: string | null;
  reviewer?: { clickupUserId?: string | null; name?: string | null };
  reviewedAt?: Date | null;
  syncedAt: Date;
}

const DeliverableSchema = new Schema<IDeliverable>(
  {
    clickupTaskId: { type: String, required: true, unique: true, index: true },
    recordTitle: { type: String, required: true },
    recordUrl: { type: String, required: true },
    sourceTaskUrl: { type: String },

    projectName: { type: String, required: true, index: true },
    teamName: { type: String, required: true },
    ecosystemName: { type: String },
    founderEmail: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    module: {
      type: String,
      required: true,
      enum: MODULE_NAMES,
    },
    deliverableNumber: { type: Number, required: true, min: 1, max: 24 },
    deliverableName: { type: String, required: true },

    qualitativeRating: {
      type: String,
      required: true,
      enum: ['strong', 'solid', 'needs_attention'],
    },
    submissionState: {
      type: String,
      required: true,
      enum: ['on_time', 'late', 'no_due_date', 'empty_submission'],
    },
    daysLate: { type: Number, default: null },
    templateCompleteness: {
      type: String,
      enum: ['complete', 'partial', 'missing', 'inaccessible', null],
      default: null,
    },
    contentAccess: {
      type: String,
      enum: ['full', 'partial', 'none', null],
      default: null,
    },
    deliverableLinkUrl: { type: String, default: null },

    whatSubmittedSummary: { type: String, default: null },
    strengthsSummary: { type: String, default: null },
    gapsRisksSummary: { type: String, default: null },
    nextStepsQuestions: { type: String, default: null },

    reviewer: {
      clickupUserId: { type: String, default: null },
      name: { type: String, default: null },
    },
    reviewedAt: { type: Date, default: null },
    syncedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

DeliverableSchema.index({ projectName: 1, module: 1 });
DeliverableSchema.index({ founderEmail: 1, projectName: 1 });

export const Deliverable =
  models.Deliverable || model<IDeliverable>('Deliverable', DeliverableSchema);
