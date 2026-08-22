import { Schema, model, models } from 'mongoose';

export interface IFounder {
  email: string;
  projectName?: string | null;
  displayName?: string | null;
  emailVerifiedAt?: Date | null;
}

const FounderSchema = new Schema<IFounder>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    projectName: { type: String, default: null },
    displayName: { type: String, default: null },
    emailVerifiedAt: { type: Date, default: null },
    // walletAddress intentionally omitted — not part of the identity model.
    // Confirmed with client: this project will not go on-chain.
  },
  { timestamps: true }
);

export const Founder =
  models.Founder || model<IFounder>('Founder', FounderSchema);
