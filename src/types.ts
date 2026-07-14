import { Node, Edge as ReactFlowEdge } from 'reactflow';

export type Edge = ReactFlowEdge;
export type NodeType = 'person' | 'location' | 'event' | 'evidence';

export interface Case {
  id?: string;
  title: string;
  nodes: DetectiveNode[];
  edges: Edge[];
  userId: string;
  createdAt: any;
  updatedAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export interface DetectiveNodeData {
  label: string;
  type: NodeType;
  time?: string;
  location?: string;
  description: string;
  isContradicted?: boolean;
}

export type DetectiveNode = Node<DetectiveNodeData>;

export interface AnalysisResult {
  contradictions: Array<{
    sourceId: string;
    targetId: string;
    reason: string;
    severity: 'high' | 'medium';
  }>;
  theories: Array<{
    title: string;
    explanation: string;
    supportingEvidence: string[];
    confidence: number;
  }>;
}
