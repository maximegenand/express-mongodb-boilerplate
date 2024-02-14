/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, createdAt, updatedAt, and any path that has private: true
 *  - replaces _id with id
 */

import type { Document, SchemaOptions } from "mongoose";

const deleteAtPath = (
  obj: Record<string, any>,
  path: string[],
  index: number
): void => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  if (obj[path[index]] && typeof obj[path[index]] === "object") {
    deleteAtPath(obj[path[index]], path, index + 1);
  }
};

export const toJSON = (
  schema: any,
  options: { private?: string[] } = {}
): void => {
  let transform: any;
  const { private: remove } = options;
  if (schema.options.toJSON?.transform)
    transform = schema.options.toJSON.transform;

  schema.options.toJSON = {
    ...schema.options.toJSON,
    transform(doc: Document, ret: Record<string, any>, options: SchemaOptions) {
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path]?.options?.private)
          deleteAtPath(ret, path.split("."), 0);
      });

      if (!remove || !remove.includes("id")) ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      if (ret.createdAt) delete ret.createdAt;
      if (ret.updatedAt) delete ret.updatedAt;
      if (remove) remove.forEach((value) => delete ret[value]);
      if (transform) {
        return transform(doc, ret, options);
      }
    },
  };
};
