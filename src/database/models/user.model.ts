import { Model, Schema, model, Types, HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import validator from "validator";

import { toJSON, paginate } from "@database/plugins";
import { ROLES } from "@config";

import type { PaginateOptions, PaginateResult } from "@database/plugins";
import type { Role } from "@config";

export interface IUser {
  email: string;
  isEmailVerified: boolean;
  uid: string;
  name: string;
  password: string;
  role: Role;
}

interface IUserMethods {
  isPasswordMatch(password: string): Promise<boolean>;
}
interface UserModel extends Model<IUser, {}, IUserMethods> {
  isEmailTaken(
    email: string,
    excludeUserId?: Types.ObjectId
  ): Promise<HydratedDocument<IUser, IUserMethods>>;
  paginate: (
    filter: object,
    options: PaginateOptions
  ) => Promise<PaginateResult<IUser>>;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      trim: true,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    role: {
      type: String,
      enum: ROLES,
      default: "user",
    },
    uid: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
  },
  {
    timestamps: true, // mongoose option to auto-assign "createdAt" and "updatedAt" fields on document
  }
);

// schema plugin to convert mongoose to JSON
userSchema.plugin(toJSON, {
  private: ["id", "password", "isEmailVerified", "role"],
});
// pagination feature on requests
userSchema.plugin(paginate);

// statics are for actions pertaining to multiple docs
userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: Types.ObjectId
) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

// methods are for actions pertaining to a single doc
userSchema.methods.isPasswordMatch = async function (password: string) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

// pre-save function to be executed before every user save
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 12);
  }
  next();
});

export const User = model<IUser, UserModel>("users", userSchema);
