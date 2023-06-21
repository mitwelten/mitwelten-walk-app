import { CoordinatePoint } from "./coordinate-point.type";

export interface WalkPath {
  walk_id: number;
  title?: string;
  description?: string;
  path?: CoordinatePoint[];
  created_at?: string;
  updated_at?: string;
}
