/**
 * Represents a Concourse resource type.
 */
export interface ResourceType {
  /** The name of the resource type. */
  name: string;
  /** The underlying type (e.g., 'docker-image', 'git'). */
  type: string;
  /** The source configuration for the resource type. */
  source: { [key: string]: any };
  /** The version of the resource type (if applicable). */
  version?: { [key: string]: string };
  /** Whether the resource type is privileged. */
  privileged?: boolean;
  /** Parameters for the resource type. */
  params?: { [key: string]: any };
  /** Tags associated with the resource type. */
  tags?: string[];
  /** Team name the resource type belongs to (if team-specific). */
  team_name?: string;
} 