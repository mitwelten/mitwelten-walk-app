import { StackImage } from "./stack-image.type";

export interface ImageStack {
  stack_id?: number;
  title?: string;
  description?: string;
  path?: string;
  images?: StackImage[];
  created_at?: string;
  updated_at?: string;
};
