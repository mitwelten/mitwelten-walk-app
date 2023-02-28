/* istanbul ignore file */

/**
 * A device deployed in the field, commondly collecting and/or processing data
 */
export type Node = {
    node_id?: number | null;
    /** Identifyer, a.k.a _Node ID_, _Node Label_, or _Label_ */
    node_label: string;
    /** Desription of function */
    type: string;
    serial_number?: string | null;
    description?: string | null;
    deployment_count: number;
    /** Hardware platform */
    platform?: string | null;
    connectivity?: string | null;
    power?: string | null;
    hardware_version?: string | null;
    software_version?: string | null;
    firmware_version?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

/**
 * Node Type Guard
 * @param node Object to check if is of Node type
 * @returns boolean
 */
export function isNode(node: any): node is Node {
  if (node === null || node === undefined) return false;
  return (node as Node).node_label !== undefined
      && (node as Node).type !== undefined;
}
