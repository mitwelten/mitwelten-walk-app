export interface StackImage {
  file_id: number;
  object_name: string;
  sha256: string;
  time: string;
  deployment_id: number;
  file_size: number;
  resolution: [ number, number ];
  created_at: string;
  updated_at: string;
}
