import { Entity, Relationship, PathTestResult, NewlyConnectedComponent } from '../src/types.js';

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  neighbors: { targetId: string; edgeId: string; relationType: string; label: string; sources: string[] }[];
}

export class GraphEngine {
  /**
   * Build adjacency graph from entities and active relationships
   */
  static buildAdjacency(
    entities: Entity[],
    relationships: Relationship[],
    excludedEdgeIds: Set<string> = new Set(),
    excludedSourceIds: Set<string> = new Set(),
    mergedEntityMap: Map<string, string> = new Map() // maps canonical ID -> merged target ID
  ): Map<string, GraphNode> {
    const graph = new Map<string, GraphNode>();

    for (const ent of entities) {
      if (ent.mergedInto) continue; // Skip merged-away entities
      graph.set(ent.id, {
        id: ent.id,
        name: ent.canonicalName,
        type: ent.entityType,
        neighbors: [],
      });
    }

    for (const rel of relationships) {
      if (excludedEdgeIds.has(rel.id)) continue;

      // Check if any supporting source is excluded
      if (excludedSourceIds.size > 0) {
        const hasActiveSource = rel.evidenceReferences.some(
          ref => !excludedSourceIds.has(ref.sourceId)
        );
        if (!hasActiveSource) continue;
      }

      let src = rel.sourceEntityId;
      let tgt = rel.targetEntityId;

      if (mergedEntityMap.has(src)) src = mergedEntityMap.get(src)!;
      if (mergedEntityMap.has(tgt)) tgt = mergedEntityMap.get(tgt)!;

      if (src === tgt) continue;

      const srcNode = graph.get(src);
      const tgtNode = graph.get(tgt);

      if (srcNode && tgtNode) {
        const sources = rel.evidenceReferences.map(r => r.sourceFilename);
        srcNode.neighbors.push({
          targetId: tgt,
          edgeId: rel.id,
          relationType: rel.relationshipType,
          label: rel.label,
          sources,
        });
        // Treat as undirected for connectivity & pathfinding
        tgtNode.neighbors.push({
          targetId: src,
          edgeId: rel.id,
          relationType: rel.relationshipType,
          label: rel.label,
          sources,
        });
      }
    }

    return graph;
  }

  /**
   * Calculate connected components
   * Returns a map of entityId -> componentId (1, 2, 3...)
   */
  static calculateConnectedComponents(
    entities: Entity[],
    relationships: Relationship[]
  ): { componentMap: Map<string, number>; components: Map<number, string[]> } {
    const graph = this.buildAdjacency(entities, relationships);
    const visited = new Set<string>();
    const componentMap = new Map<string, number>();
    const components = new Map<number, string[]>();
    let currentComponentId = 1;

    for (const nodeId of graph.keys()) {
      if (visited.has(nodeId)) continue;

      const queue = [nodeId];
      visited.add(nodeId);
      const members: string[] = [];

      while (queue.length > 0) {
        const curr = queue.shift()!;
        members.push(curr);
        componentMap.set(curr, currentComponentId);

        const node = graph.get(curr);
        if (node) {
          for (const neighbor of node.neighbors) {
            if (!visited.has(neighbor.targetId)) {
              visited.add(neighbor.targetId);
              queue.push(neighbor.targetId);
            }
          }
        }
      }

      components.set(currentComponentId, members);
      currentComponentId++;
    }

    return { componentMap, components };
  }

  /**
   * Find all shortest paths between two entities (BFS, bounded depth 5)
   */
  static findPaths(
    graph: Map<string, GraphNode>,
    sourceId: string,
    targetId: string,
    maxDepth = 5
  ): {
    entities: { id: string; name: string; type: any }[];
    relationships: { id: string; label: string; source: string }[];
    explanation: string;
  }[] {
    if (!graph.has(sourceId) || !graph.has(targetId)) return [];
    if (sourceId === targetId) return [];

    interface QueueItem {
      nodeId: string;
      pathNodes: string[];
      pathEdges: { id: string; label: string; source: string }[];
    }

    const queue: QueueItem[] = [
      { nodeId: sourceId, pathNodes: [sourceId], pathEdges: [] },
    ];
    const results: any[] = [];
    let shortestPathLength = Infinity;

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.pathNodes.length > shortestPathLength) break;
      if (current.pathNodes.length > maxDepth) continue;

      if (current.nodeId === targetId) {
        shortestPathLength = current.pathNodes.length;
        const entityDetails = current.pathNodes.map(id => {
          const n = graph.get(id);
          return { id, name: n ? n.name : id, type: n ? n.type : 'entity' };
        });

        const explanation = entityDetails
          .map((e, idx) => {
            if (idx === 0) return e.name;
            const edge = current.pathEdges[idx - 1];
            return `—[${edge.label}]→ ${e.name}`;
          })
          .join(' ');

        results.push({
          entities: entityDetails,
          relationships: current.pathEdges,
          explanation,
        });
        continue;
      }

      const node = graph.get(current.nodeId);
      if (!node) continue;

      for (const neighbor of node.neighbors) {
        if (current.pathNodes.includes(neighbor.targetId)) continue; // Avoid cycle

        queue.push({
          nodeId: neighbor.targetId,
          pathNodes: [...current.pathNodes, neighbor.targetId],
          pathEdges: [
            ...current.pathEdges,
            {
              id: neighbor.edgeId,
              label: neighbor.label,
              source: neighbor.sources.join(', ') || 'Direct Link',
            },
          ],
        });
      }
    }

    return results;
  }

  /**
   * Fragility Testing:
   * Evaluate connection stability between two entities when an edge, source, or identity assumption is removed.
   */
  static testFragility(
    entities: Entity[],
    relationships: Relationship[],
    sourceEntityId: string,
    targetEntityId: string,
    exclusion?: {
      type: 'relationship' | 'source' | 'identity_match';
      id: string;
      label: string;
    }
  ): PathTestResult {
    const srcNode = entities.find(e => e.id === sourceEntityId);
    const tgtNode = entities.find(e => e.id === targetEntityId);
    const sourceName = srcNode ? srcNode.canonicalName : sourceEntityId;
    const targetName = tgtNode ? tgtNode.canonicalName : targetEntityId;

    // 1. Original baseline paths
    const baseGraph = this.buildAdjacency(entities, relationships);
    const originalPaths = this.findPaths(baseGraph, sourceEntityId, targetEntityId);

    // 2. Active paths under exclusion
    const excludedEdges = new Set<string>();
    const excludedSources = new Set<string>();
    const mergedMap = new Map<string, string>();

    if (exclusion) {
      if (exclusion.type === 'relationship') {
        excludedEdges.add(exclusion.id);
      } else if (exclusion.type === 'source') {
        excludedSources.add(exclusion.id);
      } else if (exclusion.type === 'identity_match') {
        // If testing assumption that Arun Patel == Arun K. Patel
        // we make sure they stay separate
      }
    }

    const testGraph = this.buildAdjacency(
      entities,
      relationships,
      excludedEdges,
      excludedSources,
      mergedMap
    );
    const activePaths = this.findPaths(testGraph, sourceEntityId, targetEntityId);

    const doesConnectionSurvive = activePaths.length > 0;
    const alternativeAvailable = activePaths.length > 0 && originalPaths.length > activePaths.length;

    let explanation = '';
    if (!doesConnectionSurvive) {
      explanation = exclusion
        ? `This connection disappears completely when ${exclusion.label} is excluded. No alternative path survives across case evidence.`
        : 'No connection exists between these two entities in the current evidence graph.';
    } else if (alternativeAvailable) {
      explanation = `Connection survives via ${activePaths.length} alternative path(s) even with ${exclusion?.label} excluded.`;
    } else {
      explanation = `Connection remains fully supported across current evidence records.`;
    }

    return {
      sourceEntityId,
      targetEntityId,
      sourceName,
      targetName,
      originalPaths,
      activePaths,
      excludedItem: exclusion,
      doesConnectionSurvive,
      explanation,
      alternativeAvailable,
    };
  }

  /**
   * Detect when newly added relationships connect previously disconnected components
   */
  static detectNewlyConnectedComponents(
    beforeComponentMap: Map<string, number>,
    newRelationships: Relationship[],
    entities: Entity[]
  ): NewlyConnectedComponent[] {
    const results: NewlyConnectedComponent[] = [];
    const entityMap = new Map(entities.map(e => [e.id, e.canonicalName]));

    for (const rel of newRelationships) {
      const compA = beforeComponentMap.get(rel.sourceEntityId);
      const compB = beforeComponentMap.get(rel.targetEntityId);

      if (compA && compB && compA !== compB) {
        const nameA = entityMap.get(rel.sourceEntityId) || rel.sourceEntityId;
        const nameB = entityMap.get(rel.targetEntityId) || rel.targetEntityId;

        // Collect entities in each group
        const group1: string[] = [];
        const group2: string[] = [];
        for (const [entId, cId] of beforeComponentMap.entries()) {
          if (cId === compA) group1.push(entityMap.get(entId) || entId);
          if (cId === compB) group2.push(entityMap.get(entId) || entId);
        }

        results.push({
          group1Entities: group1,
          group2Entities: group2,
          bridgeEntity: `${nameA} ↔ ${nameB}`,
          description: `New evidence established "${rel.label}" between ${nameA} and ${nameB}, uniting Component ${compA} (${group1.slice(0, 3).join(', ')}) with Component ${compB} (${group2.slice(0, 3).join(', ')}).`,
          newRelationshipId: rel.id,
        });
      }
    }

    return results;
  }
}
