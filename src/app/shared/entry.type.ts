import { CoordinatePoint } from "./coordinate-point.type";
import { Tag } from "./tag.type";

export interface Note {
  note_id?: number;
  date?: string;
  title: string;
  description?: string;
  location?: CoordinatePoint;
  type?: string;
  public: boolean;
  author: string;
  tags?: Tag[];
  files?: string[];
}
