/**
 * TreeView.jsx
 *
 * Renders hierarchical data as a tree with expandable/collapsible nodes.
 * Each node can be selected and shows connecting lines for clarity.
 *
 * Props:
 * - data: array of objects { label, children? } representing the tree structure
 *
 * State:
 * - expandedItems: Set of expanded node IDs
 * - selectedItem: currently selected node ID
 *
 * Features:
 * - Recursive rendering via TreeItem component
 * - Expand/collapse indicator for nodes with children
 * - Lines connecting parent and child nodes
 */

import React, { useState } from 'react';
import '../Styles/TreeView.css';

const TreeView = ({ data, className = '', appState, updateState }) => {
  // State to track which items are expanded
  const [expandedItems, setExpandedItems] = useState(new Set());
  // State to track the currently selected item
  const [selectedItem, setSelectedItem] = useState(null);

  /**
   * Toggle the expanded state of a tree item
   * id - Unique identifier for the tree item
   */
  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  //Set the selected item
  const selectItem = (id) => {
    setSelectedItem(id);
  };

  /**
   * TreeItem Component - Recursive component for rendering individual tree items
   * 
   * item - Tree item object with label and optional children
   * level - Current nesting level (0 for root items)
   * parentId - ID prefix from parent items
   * isLast - Whether this is the last child at current level
   * parentIsLast - Array tracking which parent levels are last children
   */
  const TreeItem = ({ item, level = 0, parentId = '', isLast = false, parentIsLast = [] }) => {
    const itemId = `${parentId}${item.label}`; // Generate unique ID for this item
    const hasChildren = item.children && item.children.length > 0; // Check if item has children
    const isExpanded = expandedItems.has(itemId); // Check if item is currently expanded
    const isSelected = selectedItem === itemId; // Check if item is currently selected

    return (
      <div className="tree-item">
        {/* Main clickable content area */}
        <div 
          className={`tree-item-content ${isSelected ? 'selected' : ''} ${hasChildren && isExpanded ? 'expanded' : ''}`}
          onClick={() => {
            // Toggle expansion if item has children
            if (hasChildren) {
              toggleExpanded(itemId);
            }
            // Always select the clicked item
            selectItem(itemId);
            
            // If this is a leaf node (no children), update appState
            if (!hasChildren && updateState) {
              updateState({ Pathogen: item.label });
            }
          }}
        >
          {/* Container for connecting lines */}
          <div className="tree-item-line-container">
            {level > 0 && (
              <>
                {/* Vertical lines for each parent level */}
                {Array.from({ length: level }, (_, i) => (
                  <div
                    key={i}
                    className={`vertical-line ${parentIsLast[i] ? 'hidden' : ''}`}
                    style={{ left: `${i * 24 + 12}px` }}
                  />
                ))}
                {/* Horizontal connector line to parent */}
                <div
                  className={`horizontal-line ${isLast ? 'last-child' : ''}`}
                  style={{ left: `${(level - 1) * 24 + 12}px` }}
                />
              </>
            )}
          </div>
          
          {/* Content wrapper with proper indentation */}
          <div className="tree-item-wrapper" style={{ marginLeft: `${level * 24}px` }}>
            {/* Expand/collapse indicator for items with children */}
            {hasChildren && (
              <span className={`expand-indicator ${isExpanded ? 'expanded' : ''}`}>
                ▶
              </span>
            )}
            {/* Item label */}
            <span className="tree-label">{item.label}</span>
          </div>
        </div>
        
        {/* Render children if item is expanded */}
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

  // Render the root level items
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