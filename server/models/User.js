import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },

    /**
     * super_admin - can create/deactivate other admins, sees all markets.
     * admin        - manages only the markets they created.
     * editor       - read-only.
     *
     * The FIRST user created at bootstrap always becomes super_admin, and
     * the last remaining active super_admin can never be deactivated or
     * demoted (see server/routes/adminUsers.js) so the system can never be
     * left without an owner.
     */
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'editor'],
      default: 'admin',
    },

    active: { type: Boolean, default: true },

    // Super admins can set this to lock an admin out of everything.
    disabledAt: { type: Date, default: null },
    disabledReason: { type: String, default: '', maxlength: 200 },

    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 12);
};

export const User = mongoose.model('User', userSchema);
