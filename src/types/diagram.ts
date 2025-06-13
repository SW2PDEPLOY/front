// Type definitions for diagram related entities

/**
 * Represents a class attribute in a UML class diagram
 */
export interface ClassAttribute {
  /**
   * The name of the attribute
   */
  name: string;
  
  /**
   * The data type of the attribute
   * Defaults to 'string' if not specified
   */
  type: string;
  
  /**
   * The visibility of the attribute
   * - public: (+) symbol
   * - private: (-) symbol
   * - protected: (#) symbol
   * - default: (~) symbol
   */
  visibility?: 'public' | 'private' | 'protected' | 'default';
}

/**
 * Represents a class in a UML class diagram
 */
export interface ClassInfo {
  /**
   * The name of the class
   */
  name: string;
  
  /**
   * The attributes of the class
   */
  attributes: ClassAttribute[];
} 