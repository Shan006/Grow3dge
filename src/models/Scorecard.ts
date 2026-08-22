import { Schema, model, models } from 'mongoose';

export interface IScorecard {
  clickupTaskId: string;
  recordTitle: string;
  recordUrl: string;
  projectName: string;
  teamName: string;
  ecosystemName?: string;
  founderEmail: string;
  okrAchievementScore: number;
  pcfProgressionScore: number;
  executionSystemsScore: number;
  learningReflectionScore: number;
  nextPhaseReadinessScore: number;
  overallSummaryScore?: number | null;
  overallFinishLabel: 'strong_finish' | 'solid_finish' | 'needs_support_next_phase';
  biggestStrength?: string | null;
  biggestRisk?: string | null;
  topNextPhasePriority?: string | null;
  syncedAt: Date;
}

const ScorecardSchema = new Schema<IScorecard>(
  {
    clickupTaskId: { type: String, required: true, unique: true, index: true },
    recordTitle: { type: String, required: true },
    recordUrl: { type: String, required: true },

    projectName: { type: String, required: true, unique: true, index: true },
    teamName: { type: String, required: true },
    ecosystemName: { type: String },
    founderEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    okrAchievementScore: { type: Number, required: true, min: 1, max: 5 },
    pcfProgressionScore: { type: Number, required: true, min: 1, max: 5 },
    executionSystemsScore: { type: Number, required: true, min: 1, max: 5 },
    learningReflectionScore: { type: Number, required: true, min: 1, max: 5 },
    nextPhaseReadinessScore: { type: Number, required: true, min: 1, max: 5 },
    overallSummaryScore: { type: Number, default: null },

    overallFinishLabel: {
      type: String,
      required: true,
      enum: ['strong_finish', 'solid_finish', 'needs_support_next_phase'],
    },

    biggestStrength: { type: String, default: null },
    biggestRisk: { type: String, default: null },
    topNextPhasePriority: { type: String, default: null },

    syncedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const Scorecard =
  models.Scorecard || model<IScorecard>('Scorecard', ScorecardSchema);
