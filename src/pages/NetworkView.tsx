import React, { useState } from 'react';
import { Entity, Relationship, ChangeReport } from '../types';
import { GraphCanvas } from '../components/GraphCanvas';
import { EvidenceInspector } from '../components/EvidenceInspector';
import { IncrementalChangeBanner } from '../components/IncrementalChangeBanner';

interface NetworkViewProps {
  caseId: string;
  entities: Entity[];
  relationships: Relationship[];
  latestChangeReport: ChangeReport | null;
  onDismissChangeReport: () => void;
  onUpdateReviewStatus?: (relId: string, status: 'confirmed' | 'pending_review' | 'disputed') => void;
}

export const NetworkView: React.FC<NetworkViewProps> = ({
  caseId,
  entities,
  relationships,
  latestChangeReport,
  onDismissChangeReport,
  onUpdateReviewStatus,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [newlyAddedIds, setNewlyAddedIds] = useState<string[]>([]);

  const handleSelectEntity = (ent: Entity | null) => {
    setSelectedEntity(ent);
    if (ent) setSelectedRelationship(null);
  };

  const handleSelectRelationship = (rel: Relationship | null) => {
    setSelectedRelationship(rel);
    if (rel) setSelectedEntity(null);
  };

  const handleHighlightNew = (entIds: string[], relIds: string[]) => {
    setHighlightedIds([...entIds, ...relIds]);
    setNewlyAddedIds([...entIds, ...relIds]);
    if (entIds[0]) {
      const ent = entities.find(e => e.id === entIds[0]);
      if (ent) setSelectedEntity(ent);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Incremental Change Banner if new evidence added */}
      <IncrementalChangeBanner
        changeReport={latestChangeReport}
        onDismiss={onDismissChangeReport}
        onHighlightNew={handleHighlightNew}
      />

      {/* Main Graph & Inspector Container */}
      <div className="flex-1 flex overflow-hidden relative">
        <GraphCanvas
          entities={entities}
          relationships={relationships}
          selectedEntityId={selectedEntity?.id}
          selectedRelationshipId={selectedRelationship?.id}
          onSelectEntity={handleSelectEntity}
          onSelectRelationship={handleSelectRelationship}
          highlightedIds={highlightedIds}
          newlyAddedIds={newlyAddedIds}
        />

        {/* Evidence Inspector Drawer */}
        {(selectedEntity || selectedRelationship) && (
          <EvidenceInspector
            entity={selectedEntity}
            relationship={selectedRelationship}
            entities={entities}
            onClose={() => {
              setSelectedEntity(null);
              setSelectedRelationship(null);
            }}
            onUpdateReviewStatus={onUpdateReviewStatus}
          />
        )}
      </div>
    </div>
  );
};
