import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ListFilter,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Entity, Relationship, EntityType } from '../types';

interface GraphCanvasProps {
  entities: Entity[];
  relationships: Relationship[];
  selectedEntityId?: string | null;
  selectedRelationshipId?: string | null;
  onSelectEntity: (entity: Entity | null) => void;
  onSelectRelationship: (relationship: Relationship | null) => void;
  highlightedIds?: string[];
  newlyAddedIds?: string[];
}

const ENTITY_COLOR_MAP: Record<EntityType, { bg: string; border: string; shape: string }> = {
  person: { bg: '#E2E8F0', border: '#475569', shape: 'ellipse' },
  organisation: { bg: '#E7EEE9', border: '#355B4C', shape: 'round-rectangle' },
  phone: { bg: '#EDE9FE', border: '#6D28D9', shape: 'hexagon' },
  vehicle: { bg: '#FEF3C7', border: '#B45309', shape: 'diamond' },
  location: { bg: '#FEE2E2', border: '#B91C1C', shape: 'tag' },
  account: { bg: '#E0F2FE', border: '#0369A1', shape: 'barrel' },
  event: { bg: '#F3E8FF', border: '#7E22CE', shape: 'star' },
};

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  entities,
  relationships,
  selectedEntityId,
  selectedRelationshipId,
  onSelectEntity,
  onSelectRelationship,
  highlightedIds = [],
  newlyAddedIds = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<EntityType>>(
    new Set(['person', 'organisation', 'phone', 'vehicle', 'location', 'account', 'event'])
  );
  const [showUnresolved, setShowUnresolved] = useState(true);
  const [showListView, setShowListView] = useState(false);
  const [activeComponentFilter, setActiveComponentFilter] = useState<number | 'all'>('all');

  // Filter entities
  const filteredEntities = entities.filter(e => {
    if (e.mergedInto) return false;
    if (!selectedTypes.has(e.entityType)) return false;
    if (activeComponentFilter !== 'all' && e.componentId !== activeComponentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.canonicalName.toLowerCase().includes(q) ||
        Object.values(e.identifiers).some(v => String(v).toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredEntityIds = new Set(filteredEntities.map(e => e.id));

  // Filter relationships
  const filteredRelationships = relationships.filter(r => {
    if (!filteredEntityIds.has(r.sourceEntityId) || !filteredEntityIds.has(r.targetEntityId)) {
      return false;
    }
    if (!showUnresolved && r.assertionStatus === 'uncertain') {
      return false;
    }
    return true;
  });

  // Distinct component IDs for component filtering
  const componentIds = Array.from(
    new Set(entities.map(e => e.componentId || 1))
  ).sort((a, b) => a - b);

  // Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current || showListView) return;

    const elements: any[] = [];

    // Add nodes
    for (const ent of filteredEntities) {
      const config = ENTITY_COLOR_MAP[ent.entityType] || {
        bg: '#EFEDE7',
        border: '#626B65',
        shape: 'ellipse',
      };
      const isSelected = selectedEntityId === ent.id;
      const isHighlighted = highlightedIds.includes(ent.id);
      const isNew = ent.isNew || newlyAddedIds.includes(ent.id);

      elements.push({
        group: 'nodes',
        data: {
          id: ent.id,
          label: ent.canonicalName,
          type: ent.entityType,
          componentId: ent.componentId,
          isNew,
          isSelected,
          isHighlighted,
          bg: isSelected ? '#355B4C' : isHighlighted ? '#F8F0DE' : isNew ? '#E7EEE9' : config.bg,
          textColor: isSelected ? '#FFFFFF' : '#222824',
          borderColor: isSelected ? '#29483C' : isNew ? '#355B4C' : config.border,
          borderWidth: isSelected ? 3 : isNew ? 2.5 : 1.5,
          shape: config.shape,
        },
      });
    }

    // Add edges
    for (const rel of filteredRelationships) {
      const isSelected = selectedRelationshipId === rel.id;
      const isHighlighted = highlightedIds.includes(rel.id);
      const isNew = rel.isNew || newlyAddedIds.includes(rel.id);
      const isDashed = rel.assertionStatus === 'uncertain' || rel.assertionStatus === 'reported_allegation';

      elements.push({
        group: 'edges',
        data: {
          id: rel.id,
          source: rel.sourceEntityId,
          target: rel.targetEntityId,
          label: rel.label,
          isSelected,
          isHighlighted,
          isNew,
          lineColor: isSelected ? '#355B4C' : isHighlighted ? '#865817' : isNew ? '#29483C' : '#B6BCB4',
          lineWidth: isSelected ? 3 : isNew ? 2.5 : 1.5,
          lineStyle: isDashed ? 'dashed' : 'solid',
        },
      });
    }

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(bg)',
            'label': 'data(label)',
            'color': 'data(textColor)',
            'font-family': 'Inter, sans-serif',
            'font-size': '11px',
            'font-weight': 500,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '90px',
            'border-width': 'data(borderWidth)',
            'border-color': 'data(borderColor)',
            'shape': 'data(shape)' as any,
            'width': '105px',
            'height': '46px',
            'padding': '6px',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': '0.18s' as any,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 'data(lineWidth)',
            'line-color': 'data(lineColor)',
            'target-arrow-color': 'data(lineColor)',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.8,
            'curve-style': 'bezier',
            'line-style': 'data(lineStyle)' as any,
            'label': 'data(label)',
            'font-family': 'Inter, sans-serif',
            'font-size': '9px',
            'font-weight': 400,
            'color': '#626B65',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.9,
            'text-background-color': '#FFFFFF',
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 50,
        nodeOverlap: 20,
        idealEdgeLength: 120,
        nodeRepulsion: 6000,
      },
      minZoom: 0.3,
      maxZoom: 2.5,
    });

    cy.on('tap', 'node', evt => {
      const node = evt.target;
      const entity = entities.find(e => e.id === node.id()) || null;
      onSelectEntity(entity);
      onSelectRelationship(null);
    });

    cy.on('tap', 'edge', evt => {
      const edge = evt.target;
      const rel = relationships.find(r => r.id === edge.id()) || null;
      onSelectRelationship(rel);
      onSelectEntity(null);
    });

    cy.on('tap', evt => {
      if (evt.target === cy) {
        onSelectEntity(null);
        onSelectRelationship(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [
    filteredEntities.length,
    filteredRelationships.length,
    selectedEntityId,
    selectedRelationshipId,
    highlightedIds,
    newlyAddedIds,
    showListView,
  ]);

  const handleZoomIn = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    if (cyRef.current) cyRef.current.fit(undefined, 40);
  };

  const toggleType = (type: EntityType) => {
    const next = new Set(selectedTypes);
    if (next.has(type)) {
      if (next.size > 1) next.delete(type);
    } else {
      next.add(type);
    }
    setSelectedTypes(next);
  };

  return (
    <div className="relative flex-1 h-full bg-[#F6F5F1] flex flex-col overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="h-12 bg-[#FFFFFF] border-b border-[#DDDFD7] px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#626B65] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entities or attributes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded-md w-56 focus:bg-white focus:outline-none focus:border-[#355B4C] transition-colors"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center space-x-1 pl-2 border-l border-[#DDDFD7]">
            {(['person', 'organisation', 'vehicle', 'phone', 'location'] as EntityType[]).map(type => {
              const active = selectedTypes.has(type);
              const cfg = ENTITY_COLOR_MAP[type];
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors flex items-center space-x-1 border ${
                    active
                      ? 'bg-[#EFEDE7] text-[#222824] border-[#DDDFD7]'
                      : 'bg-transparent text-[#9DA39E] border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.border }} />
                  <span>{type}</span>
                </button>
              );
            })}
          </div>

          {/* Component Isolator */}
          {componentIds.length > 1 && (
            <div className="flex items-center space-x-1 pl-2 border-l border-[#DDDFD7] text-xs">
              <Layers className="w-3.5 h-3.5 text-[#626B65]" />
              <select
                value={activeComponentFilter}
                onChange={e => setActiveComponentFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="text-[11px] bg-[#F6F5F1] border border-[#DDDFD7] rounded px-1.5 py-0.5 text-[#222824] focus:outline-none"
              >
                <option value="all">All Groups ({componentIds.length})</option>
                {componentIds.map(cId => (
                  <option key={cId} value={cId}>Group {cId}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* View Options */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowUnresolved(!showUnresolved)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs border transition-colors ${
              showUnresolved
                ? 'bg-[#EFEDE7] border-[#DDDFD7] text-[#222824]'
                : 'bg-transparent border-transparent text-[#626B65]'
            }`}
            title="Toggle display of candidate/unresolved relationships"
          >
            {showUnresolved ? <Eye className="w-3.5 h-3.5 text-[#355B4C]" /> : <EyeOff className="w-3.5 h-3.5 text-[#626B65]" />}
            <span className="text-[11px]">Unresolved</span>
          </button>

          <button
            onClick={() => setShowListView(!showListView)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs border transition-colors ${
              showListView
                ? 'bg-[#E7EEE9] border-[#355B4C] text-[#29483C] font-medium'
                : 'bg-[#FFFFFF] border-[#DDDFD7] text-[#222824] hover:bg-[#EFEDE7]'
            }`}
            title="Switch between visual Cytoscape graph and accessible structured list view"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="text-[11px]">{showListView ? 'Graph Canvas' : 'Accessible List'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {showListView ? (
          /* Accessible Text-Alternative Relationship List */
          <div className="w-full h-full p-6 overflow-y-auto bg-white">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[#222824]">Accessible Investigation Graph Index</h3>
                <p className="text-xs text-[#626B65] mt-0.5">
                  Showing {filteredEntities.length} entities and {filteredRelationships.length} relationships.
                </p>
              </div>

              <div className="border border-[#DDDFD7] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#EFEDE7] text-[#222824] border-b border-[#DDDFD7]">
                    <tr>
                      <th className="p-2.5 font-semibold">Source Entity</th>
                      <th className="p-2.5 font-semibold">Relationship</th>
                      <th className="p-2.5 font-semibold">Target Entity</th>
                      <th className="p-2.5 font-semibold">Assertion Status</th>
                      <th className="p-2.5 font-semibold">Supporting Records</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDDFD7]">
                    {filteredRelationships.map(rel => {
                      const src = entities.find(e => e.id === rel.sourceEntityId);
                      const tgt = entities.find(e => e.id === rel.targetEntityId);
                      return (
                        <tr
                          key={rel.id}
                          onClick={() => onSelectRelationship(rel)}
                          className="hover:bg-[#F6F5F1] cursor-pointer transition-colors"
                        >
                          <td className="p-2.5 font-medium text-[#222824]">
                            {src?.canonicalName || rel.sourceEntityId}
                            <span className="ml-1 text-[10px] text-[#626B65] capitalize">({src?.entityType})</span>
                          </td>
                          <td className="p-2.5 text-[#355B4C] font-semibold">{rel.label}</td>
                          <td className="p-2.5 font-medium text-[#222824]">
                            {tgt?.canonicalName || rel.targetEntityId}
                            <span className="ml-1 text-[10px] text-[#626B65] capitalize">({tgt?.entityType})</span>
                          </td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#EFEDE7] text-[#626B65]">
                              {rel.assertionStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-[#626B65]">
                            {rel.evidenceReferences.map(r => r.sourceFilename).join(', ')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Visual Cytoscape Canvas */
          <div ref={containerRef} className="w-full h-full bg-[#F6F5F1]" />
        )}

        {/* Floating Zoom Controls (only on graph view) */}
        {!showListView && (
          <div className="absolute left-4 bottom-4 flex flex-col bg-white border border-[#DDDFD7] rounded-md shadow-xs overflow-hidden z-10">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-[#EFEDE7] text-[#626B65] hover:text-[#222824] border-b border-[#DDDFD7] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-[#EFEDE7] text-[#626B65] hover:text-[#222824] border-b border-[#DDDFD7] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFit}
              className="p-2 hover:bg-[#EFEDE7] text-[#626B65] hover:text-[#222824] transition-colors"
              title="Fit to Screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Graph Legend & Entity Count */}
        {!showListView && (
          <div className="absolute right-4 bottom-4 bg-white/90 backdrop-blur-xs border border-[#DDDFD7] rounded-md px-3 py-2 text-[11px] text-[#626B65] shadow-xs z-10 space-y-1">
            <div className="flex items-center justify-between space-x-3 pb-1 border-b border-[#DDDFD7]/80">
              <span className="font-semibold text-[#222824]">Current Scope</span>
              <span className="font-mono text-[10px]">
                {filteredEntities.length} entities • {filteredRelationships.length} links
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5 text-[10px]">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#475569]" />
                <span>Person</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-xs bg-[#355B4C]" />
                <span>Organisation</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-[#B45309] rotate-45" />
                <span>Vehicle</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6D28D9]" />
                <span>Phone</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-[#B6BCB4]" />
                <span>Confirmed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 border-b border-dashed border-[#B6BCB4]" />
                <span>Unresolved</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
