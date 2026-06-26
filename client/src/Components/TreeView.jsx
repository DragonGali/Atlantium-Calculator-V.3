import React, { useState, useEffect, useRef } from 'react';
import '../Styles/TreeView.css';

const TreeView = ({ data, className = '', appState, updateState }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);
  const isFirstRender = useRef(true);

  /**
   * Sync selectedItem with appState.Pathogen
   */
  useEffect(() => {
    if (appState?.Pathogen && !appState?.manualInput) {
      setSelectedItem(appState.Pathogen);
    }
  }, [appState?.Pathogen, appState?.manualInput]);

  /**
   * Only clear tree when explicitly entering manualInput mode (not just when it's true)
   */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (appState?.manualInput === true) {
      setExpandedItems(new Set());
      setSelectedItem(null);
    }
  }, [appState?.manualInput]);

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const selectItem = (id) => {
    setSelectedItem(id);
  };

  const TreeItem = ({ item, level = 0, parentId = '', isLast = false, parentIsLast = [] }) => {
    const itemId = `${parentId}${item.label}`;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(itemId);
    const isSelected = selectedItem === itemId;
    const isLeafNode = !hasChildren;

    return (
      <div className="tree-item">
        <div 
          className={`tree-item-content ${isSelected ? 'selected' : ''} ${hasChildren && isExpanded ? 'expanded' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(itemId);
            }
            selectItem(itemId);
            
            if (isLeafNode && updateState) {
              updateState({ Pathogen: item.label });
              updateState({"D-1Log" : item.dose});
              updateState({ manualInput: false });
            }
          }}
        >
          <div className="tree-item-line-container">
            {level > 0 && (
              <>
                {Array.from({ length: level }, (_, i) => (
                  <div
                    key={i}
                    className={`vertical-line ${parentIsLast[i] ? 'hidden' : ''}`}
                    style={{ left: `${i * 24 + 12}px` }}
                  />
                ))}
                <div
                  className={`horizontal-line ${isLast ? 'last-child' : ''}`}
                  style={{ left: `${(level - 1) * 24 + 12}px` }}
                />
              </>
            )}
          </div>
          
          <div className="tree-item-wrapper" style={{ marginLeft: `${level * 24}px` }}>
            {hasChildren && (
              <span className={`expand-indicator ${isExpanded ? 'expanded' : ''}`}>
                ▶
              </span>
            )}
            <span className="tree-label">{item.label}</span>
            {isLeafNode && item.dose !== undefined && (
              <span className="tree-dose">{item.dose}</span>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="tree-children">
            {item.children.map((child, index) => (
              <TreeItem 
                key={`${itemId}-${index}`} 
                item={child} 
                level={level + 1} 
                parentId={`${itemId}-`}
                isLast={index === item.children.length - 1}
                parentIsLast={[...parentIsLast, isLast]}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`tree-view connected ${className}`}>
      {data.map((item, index) => (
        <TreeItem 
          key={index} 
          item={item} 
          isLast={index === data.length - 1}
          parentIsLast={[]}
        />
      ))}
    </div>
  );
};

export default TreeView;