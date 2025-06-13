import React, { useState } from 'react';
import { ClassInfo, ClassAttribute } from "../types/diagram";

interface ClassTreeProps {
  classes: ClassInfo[];
}

export const ClassTree: React.FC<ClassTreeProps> = ({ classes }) => {
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [showLegend, setShowLegend] = useState<boolean>(false);

  const toggleExpand = (className: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(className)) {
      newExpanded.delete(className);
    } else {
      newExpanded.add(className);
    }
    setExpandedClasses(newExpanded);
  };

  const expandAll = () => {
    const allClassNames = new Set(classes.map(cls => cls.name));
    setExpandedClasses(allClassNames);
  };

  const collapseAll = () => {
    setExpandedClasses(new Set());
  };

  const getVisibilitySymbol = (visibility?: 'public' | 'private' | 'protected' | 'default') => {
    // Use default visibility if visibility is undefined
    const visibilityValue = visibility || 'default';

    switch (visibilityValue) {
      case 'public':
        return { symbol: '+', className: 'visibility-public' };
      case 'private':
        return { symbol: '-', className: 'visibility-private' };
      case 'protected':
        return { symbol: '#', className: 'visibility-protected' };
      default:
        return { symbol: '~', className: 'visibility-default' };
    }
  };

  // Sort attributes by visibility order: public, protected, default, private
  const sortAttributes = (attributes: ClassAttribute[]): ClassAttribute[] => {
    const visibilityOrder = {
      'public': 0,
      'protected': 1,
      'default': 2,
      'private': 3
    };

    return [...attributes].sort((a, b) => {
      const visA = a.visibility || 'default';
      const visB = b.visibility || 'default';

      return visibilityOrder[visA] - visibilityOrder[visB];
    });
  };

  // Count total attributes across all classes
  const totalAttributes = classes.reduce((sum, cls) => sum + cls.attributes.length, 0);

  // Get summary of visibility types
  const attributeVisibilityCounts = () => {
    const counts = {
      public: 0,
      private: 0,
      protected: 0,
      default: 0
    };

    classes.forEach(cls => {
      cls.attributes.forEach(attr => {
        const vis = attr.visibility || 'default';
        counts[vis]++;
      });
    });

    return counts;
  };

  const visibilityCounts = attributeVisibilityCounts();

  return (
    <div className="class-tree-container">
      <div className="class-tree-header-container">
        <h2 className="class-tree-title">UML Class Diagram</h2>
        <button
          className="legend-toggle-button"
          onClick={() => setShowLegend(!showLegend)}
        >
          {showLegend ? 'Hide Legend' : 'Show Legend'}
        </button>
      </div>

      {showLegend && (
        <div className="visibility-legend">
          <h3>Visibility Legend</h3>
          <div className="legend-items">
            <div className="legend-item">
              <div className="visibility-symbol visibility-public">+</div>
              <span>Public</span>
            </div>
            <div className="legend-item">
              <div className="visibility-symbol visibility-private">-</div>
              <span>Private</span>
            </div>
            <div className="legend-item">
              <div className="visibility-symbol visibility-protected">#</div>
              <span>Protected</span>
            </div>
            <div className="legend-item">
              <div className="visibility-symbol visibility-default">~</div>
              <span>Default</span>
            </div>
          </div>
        </div>
      )}

      <div className="class-count">
        {classes.length} {classes.length === 1 ? 'class' : 'classes'} found with
        {totalAttributes > 0 && ` ${totalAttributes} attributes total`}
      </div>

      {totalAttributes > 0 && (
        <div className="attribute-summary">
          <div className="visibility-count">
            <div className="visibility-symbol visibility-public">+</div>
            <span>{visibilityCounts.public} public</span>
          </div>
          <div className="visibility-count">
            <div className="visibility-symbol visibility-private">-</div>
            <span>{visibilityCounts.private} private</span>
          </div>
          <div className="visibility-count">
            <div className="visibility-symbol visibility-protected">#</div>
            <span>{visibilityCounts.protected} protected</span>
          </div>
          <div className="visibility-count">
            <div className="visibility-symbol visibility-default">~</div>
            <span>{visibilityCounts.default} default</span>
          </div>
        </div>
      )}

      {classes.length > 0 && (
        <div className="expand-collapse-buttons">
          <button className="expand-all-button" onClick={expandAll}>Expand All</button>
          <button className="collapse-all-button" onClick={collapseAll}>Collapse All</button>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="no-classes-message">No classes found in the diagram.</div>
      ) : (
        <div className="class-tree-list">
          {classes.map((cls) => (
            <div key={cls.name} className="class-tree-item">
              <div
                className="class-tree-header"
                onClick={() => toggleExpand(cls.name)}
              >
                <div className="class-tree-toggle">
                  {expandedClasses.has(cls.name) ? '-' : '+'}
                </div>
                <div className="class-tree-name">{cls.name}</div>
                <div className="class-attribute-count">
                  ({cls.attributes.length} {cls.attributes.length === 1 ? 'attribute' : 'attributes'})
                </div>
              </div>

              <div className={`class-tree-attributes ${expandedClasses.has(cls.name) ? 'expanded' : ''}`}>
                {cls.attributes && cls.attributes.length > 0 ? (
                  sortAttributes(cls.attributes).map((attr, index) => {
                    const { symbol, className } = getVisibilitySymbol(attr.visibility);
                    const attributeName = attr.name ? attr.name.trim() : '';
                    const attributeType = attr.type || 'string';

                    return (
                      <div key={index} className="class-tree-attribute">
                        <div className={`visibility-symbol ${className}`}>{symbol}</div>
                        <span className="attribute-name">{attributeName}</span>
                        <span className="type-separator">: </span>
                        <span className="attribute-type">{attributeType}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="class-tree-attribute no-attributes">No attributes defined</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
