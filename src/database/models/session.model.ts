import { Schema, model, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { config } from "@config";
import { toJSON, paginate } from "@database/plugins";

export interface ISession {
  user: Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: Date;
  refreshTokenDate: Date;
}

const sessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    accessToken: {
      type: String,
      required: true,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    accessTokenExpires: {
      type: Date,
      required: true,
      default: () =>
        new Date(
          +new Date() + config.TOKEN.ACCESS_EXPIRATION_MINUTES * 60 * 1000
        ), // 1 hour
    },
    refreshTokenDate: {
      type: Date,
      required: true,
      default: Date.now,
      expires: config.TOKEN.REFRESH_EXPIRATION_DAYS * 24 * 60 * 60,
    },
  },
  {
    timestamps: false, // mongoose option to auto-assign "createdAt" and "updatedAt" fields on document
  }
);

// schema plugin to convert mongoose to JSON
sessionSchema.plugin(toJSON, {
  private: ["id", "user", "accessTokenExpires", "refreshTokenDate"],
});
// pagination feature on requests
sessionSchema.plugin(paginate);

export const Session = model<ISession>("sessions", sessionSchema);
