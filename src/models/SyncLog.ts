import { Schema, model, models } from 'mongoose';

export interface ISyncLog {
  startedAt: Date;
  finishedAt?: Date | null;
  status: 'running' | 'success' | 'partial_failure' | 'failure';
  tasksProcessed: number;
  tasksRejected: number;
  rejectedTaskIds: Array<{ taskId: string; reason: string }>;
  errorMessage?: string | null;
}

const SyncLogSchema = new Schema<ISyncLog>(
  {
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['running', 'success', 'partial_failure', 'failure'],
      required: true,
    },
    tasksProcessed: { type: Number, default: 0 },
    tasksRejected: { type: Number, default: 0 },
    rejectedTaskIds: [
      {
        taskId: String,
        reason: String,
      },
    ],
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

export const SyncLog =
  models.SyncLog || model<ISyncLog>('SyncLog', SyncLogSchema);
