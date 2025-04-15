/**
 * Represents basic information about a Concourse team.
 */
export interface Team {
  /** The unique identifier for the team. */
  id: number;
  /** The name of the team. */
  name: string;
  /** Authentication settings for the team. */
  auth?: { [provider: string]: { [key: string]: any } }; // Structure varies by provider
} 