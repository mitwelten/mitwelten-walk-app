import { CoordinatePoint } from "./coordinate-point.type";
import { Tag } from "./tag.type";

export interface Entry {
  entry_id?: number;
  date?: string;
  name: string;
  description?: string;
  location: CoordinatePoint;
  type?: string;
  tags?: Tag[];
}
