import { Schema, model, models } from 'mongoose';
import { MODULE_NAMES, ModuleName } from './Deliverable';

export interface IBadgeAward {
  projectName: string;
  founderEmail: string;
  awardType: 'module_badge' | 'certificate';
  module?: ModuleName | null;
  firstEarnedAt: Date;
}

const BadgeAwardSchema = new Schema<IBadgeAward>(
  {
    projectName: { type: String, required: true, index: true },
    founderEmail: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    awardType: {
      type: String,
      required: true,
      enum: ['module_badge', 'certificate'],
    },
    module: {
      type: String,
      enum: [...MODULE_NAMES, null],
      default: null, // null when awardType === 'certificate'
    },

    firstEarnedAt: { type: Date, required: true, default: Date.now },
    // No txHash, tokenId, walletAddress, or lock address — nothing on-chain.
  },
  { timestamps: true }
);

BadgeAwardSchema.index(
  { projectName: 1, awardType: 1, module: 1 },
  { unique: true }
);

export const BadgeAward =
  models.BadgeAward || model<IBadgeAward>('BadgeAward', BadgeAwardSchema);
