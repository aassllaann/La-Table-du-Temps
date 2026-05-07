'use client';

import { useEffect, useRef } from 'react';
import { getEraColor, getNodeRadius } from '@/lib/utils';
import type { Dish, Edge, EraId, GraphNode, GraphLink, SelectedEdge } from '@/lib/types';

const ERA_ORDER: EraId[] = [
  'medieval',
  'careme',
  'escoffier',
  'nouvelle',
  'contemporary',
];

const ERA_LABELS: Record<EraId, [string, string]> = {
  medieval:     ['中世纪宫廷菜', '1300–1600'],
  careme:       ['古典法餐', '1780–1855'],
  escoffier:    ['大饭店时代', '1880–1935'],
  nouvelle:     ['Nouvelle Cuisine', '1960–1985'],
  contemporary: ['当代法餐', '2000–今'],
};

interface Options {
  dishes: Dish[];
  edges: Edge[];
  selectedEra: EraId | null;
  selectedDish: Dish | null;
  onDishClick: (dish: Dish) => void;
  onEdgeClick: (info: SelectedEdge) => void;
}

export function useDishGraph(
  svgRef: React.RefObject<SVGSVGElement | null>,
  options: Options
) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // ── Layout effect: runs once on mount ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const svgEl = svgRef.current;
    if (!svgEl) return;

    import('d3').then((d3) => {
      const { dishes, edges } = optionsRef.current;

      d3.select(svgEl).selectAll('*').remove();

      const totalW = svgEl.clientWidth || 900;
      const totalH = svgEl.clientHeight || 700;

      // Layout constants
      const LABEL_W = 96;    // left margin for era labels
      const PAD_TOP = 24;
      const PAD_BOT = 24;
      const PAD_RIGHT = 24;
      const ERA_H = (totalH - PAD_TOP - PAD_BOT) / ERA_ORDER.length;
      const GRAPH_W = totalW - LABEL_W - PAD_RIGHT;

      // ── Group dishes by era ───────────────────────────────────────────────
      const dishesByEra: Record<EraId, Dish[]> = {} as Record<EraId, Dish[]>;
      ERA_ORDER.forEach((id) => {
        dishesByEra[id] = dishes.filter((d) => d.era === id);
      });

      // ── Position nodes ────────────────────────────────────────────────────
      const nodeMap = new Map<string, GraphNode>();
      const nodes: GraphNode[] = dishes.map((d) => {
        const eraIndex = ERA_ORDER.indexOf(d.era);
        const eraNodes = dishesByEra[d.era];
        const nodeIndex = eraNodes.indexOf(d);
        const count = eraNodes.length;
        const x = LABEL_W + (nodeIndex + 1) * (GRAPH_W / (count + 1));
        const y = PAD_TOP + eraIndex * ERA_H + ERA_H / 2;
        const node: GraphNode = { ...d, x, y };
        nodeMap.set(d.id, node);
        return node;
      });

      // ── Build links ───────────────────────────────────────────────────────
      const links: GraphLink[] = edges
        .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
        .map((e) => ({
          source: nodeMap.get(e.source)!,
          target: nodeMap.get(e.target)!,
          type: e.type,
          reason: e.reason,
        }));

      // ── SVG setup ─────────────────────────────────────────────────────────
      const svg = d3.select(svgEl);

      // Arrow marker for evolved_from
      svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrow-evolved')
        .attr('viewBox', '0 -4 8 8')
        .attr('refX', 7)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L8,0L0,4')
        .attr('fill', '#C8A84B')
        .attr('fill-opacity', 0.9);

      // Zoom container
      const g = svg.append('g').attr('class', 'zoom-container');

      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform.toString());
        });
      svg.call(zoom);

      // ── Era bands ─────────────────────────────────────────────────────────
      const bandsG = g.append('g').attr('class', 'era-bands');

      bandsG
        .selectAll<SVGRectElement, EraId>('rect.era-band')
        .data(ERA_ORDER)
        .join('rect')
        .attr('class', 'era-band')
        .attr('x', 0)
        .attr('y', (_, i) => PAD_TOP + i * ERA_H)
        .attr('width', totalW)
        .attr('height', ERA_H)
        .attr('fill', (d) => getEraColor(d))
        .attr('fill-opacity', 0.07)
        .attr('stroke', 'none');

      // Era divider lines
      bandsG
        .selectAll<SVGLineElement, EraId>('line.era-divider')
        .data(ERA_ORDER)
        .join('line')
        .attr('class', 'era-divider')
        .attr('x1', 0)
        .attr('x2', totalW)
        .attr('y1', (_, i) => PAD_TOP + i * ERA_H)
        .attr('y2', (_, i) => PAD_TOP + i * ERA_H)
        .attr('stroke', (d) => getEraColor(d))
        .attr('stroke-opacity', 0.25)
        .attr('stroke-width', 1);

      // Era labels (left margin)
      const labelsG = g.append('g').attr('class', 'era-labels');

      ERA_ORDER.forEach((eraId, i) => {
        const [name, period] = ERA_LABELS[eraId];
        const midY = PAD_TOP + i * ERA_H + ERA_H / 2;
        const color = getEraColor(eraId);

        labelsG
          .append('text')
          .attr('x', LABEL_W - 14)
          .attr('y', midY - 7)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '11px')
          .style('font-family', 'Georgia, serif')
          .style('fill', color)
          .style('fill-opacity', 0.9)
          .style('font-weight', '500')
          .text(name);

        labelsG
          .append('text')
          .attr('x', LABEL_W - 14)
          .attr('y', midY + 9)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '9px')
          .style('font-family', 'Georgia, serif')
          .style('fill', 'rgba(240,232,208,0.32)')
          .text(period);

        // Vertical tick on divider
        labelsG
          .append('line')
          .attr('x1', LABEL_W - 6)
          .attr('x2', LABEL_W)
          .attr('y1', PAD_TOP + i * ERA_H)
          .attr('y2', PAD_TOP + i * ERA_H)
          .attr('stroke', color)
          .attr('stroke-opacity', 0.4)
          .attr('stroke-width', 1);
      });

      // ── Edges ─────────────────────────────────────────────────────────────
      const edgesG = g.append('g').attr('class', 'edges');

      // Helper: path for evolved_from (bezier across era bands, going downward)
      function evolvedPath(s: GraphNode, t: GraphNode): string {
        const sx = s.x ?? 0;
        const sy = s.y ?? 0;
        const tx = t.x ?? 0;
        const ty = t.y ?? 0;
        const r = getNodeRadius(t.chef !== null);
        const midY = (sy + ty) / 2;
        // cubic bezier: depart downward from source, arrive downward at target
        return `M${sx},${sy + getNodeRadius(s.chef !== null)} C${sx},${midY} ${tx},${midY} ${tx},${ty - r}`;
      }

      // Helper: arc for era_sibling (within same band, arc below the node row)
      function siblingArc(s: GraphNode, t: GraphNode): string {
        const sx = s.x ?? 0;
        const sy = s.y ?? 0;
        const tx = t.x ?? 0;
        const ty = t.y ?? 0;
        const midX = (sx + tx) / 2;
        // Sagitta proportional to horizontal distance, capped to 40% of era height
        const sagitta = Math.min(Math.abs(tx - sx) * 0.28, ERA_H * 0.38);
        // Alternate above/below based on index parity to reduce clutter
        const dir = sx < tx ? 1 : -1;
        return `M${sx},${sy} Q${midX},${sy + sagitta * dir * 0.6 + sagitta * 0.4} ${tx},${ty}`;
      }

      edgesG
        .selectAll<SVGPathElement, GraphLink>('path.dish-edge')
        .data(links)
        .join('path')
        .attr('class', 'dish-edge')
        .attr('d', (d) => {
          const s = d.source as GraphNode;
          const t = d.target as GraphNode;
          return d.type === 'evolved_from'
            ? evolvedPath(s, t)
            : siblingArc(s, t);
        })
        .attr('fill', 'none')
        .attr('stroke', (d) =>
          d.type === 'evolved_from' ? '#C8A84B' : '#7A6040'
        )
        .attr('stroke-opacity', (d) =>
          d.type === 'evolved_from' ? 0.65 : 0.28
        )
        .attr('stroke-width', (d) =>
          d.type === 'evolved_from' ? 1.5 : 1
        )
        .attr('stroke-dasharray', (d) =>
          d.type === 'evolved_from' ? 'none' : '5,4'
        )
        .attr('marker-end', (d) =>
          d.type === 'evolved_from' ? 'url(#arrow-evolved)' : null
        )
        .style('cursor', 'pointer')
        // Thicken on hover
        .on('mouseover', function (_, d) {
          d3.select(this)
            .attr('stroke-width', d.type === 'evolved_from' ? 3 : 2)
            .attr('stroke-opacity', d.type === 'evolved_from' ? 0.95 : 0.7);
        })
        .on('mouseout', function (_, d) {
          d3.select(this)
            .attr('stroke-width', d.type === 'evolved_from' ? 1.5 : 1)
            .attr('stroke-opacity', d.type === 'evolved_from' ? 0.65 : 0.28);
        })
        .on('click', function (event: MouseEvent, d) {
          event.stopPropagation();
          const s = d.source as GraphNode;
          const t = d.target as GraphNode;
          optionsRef.current.onEdgeClick({
            sourceId: s.id,
            targetId: t.id,
            type: d.type,
            reason: d.reason,
            x: event.clientX,
            y: event.clientY,
          });
        });

      // ── Nodes ─────────────────────────────────────────────────────────────
      const nodesG = g.append('g').attr('class', 'nodes');

      const nodeGroup = nodesG
        .selectAll<SVGGElement, GraphNode>('g.dish-node')
        .data(nodes, (d) => d.id)
        .join('g')
        .attr('class', (d) => `dish-node dish-node-era-${d.era}`)
        .attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
        .style('cursor', 'pointer');

      // Glow ring (shown on select)
      nodeGroup
        .append('circle')
        .attr('class', 'node-glow')
        .attr('r', (d) => getNodeRadius(d.chef !== null) + 5)
        .attr('fill', 'none')
        .attr('stroke', (d) => getEraColor(d.era))
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0);

      // Main circle
      nodeGroup
        .append('circle')
        .attr('class', 'node-circle')
        .attr('r', (d) => getNodeRadius(d.chef !== null))
        .attr('fill', (d) => getEraColor(d.era))
        .attr('fill-opacity', 0.9)
        .attr('stroke', 'rgba(240,232,208,0.2)')
        .attr('stroke-width', 1.5);

      // French name label
      nodeGroup
        .append('text')
        .attr('class', 'node-label')
        .attr('dy', (d) => getNodeRadius(d.chef !== null) + 12)
        .attr('text-anchor', 'middle')
        .style('font-size', '9.5px')
        .style('font-family', 'Georgia, serif')
        .style('fill', 'rgba(240,232,208,0.65)')
        .style('pointer-events', 'none')
        .style('user-select', 'none')
        .text((d) => d.name_fr);

      // Native tooltip
      nodeGroup.append('title').text((d) => `${d.name_fr} · ${d.name_zh}`);

      // ── Hover interactions ─────────────────────────────────────────────────
      const allEdgePaths = edgesG.selectAll<SVGPathElement, GraphLink>('path.dish-edge');

      nodeGroup
        .on('mouseover', (_, hovered) => {
          const connectedIds = new Set<string>([hovered.id]);
          links.forEach((l) => {
            const s = (l.source as GraphNode).id;
            const t = (l.target as GraphNode).id;
            if (s === hovered.id || t === hovered.id) {
              connectedIds.add(s);
              connectedIds.add(t);
            }
          });

          nodeGroup
            .attr('opacity', (n) => (connectedIds.has(n.id) ? 1 : 0.15))
            .select('text.node-label')
            .style('fill', (n) =>
              connectedIds.has(n.id)
                ? 'rgba(240,232,208,0.92)'
                : 'rgba(240,232,208,0.12)'
            );

          allEdgePaths.attr('stroke-opacity', (l) => {
            const s = (l.source as GraphNode).id;
            const t = (l.target as GraphNode).id;
            const active = s === hovered.id || t === hovered.id;
            return active ? (l.type === 'evolved_from' ? 0.95 : 0.7) : 0.04;
          });
        })
        .on('mouseout', () => {
          const { selectedEra } = optionsRef.current;
          nodeGroup.attr('opacity', (n) =>
            !selectedEra || n.era === selectedEra ? 1 : 0.18
          );
          nodeGroup
            .select<SVGTextElement>('text.node-label')
            .style('fill', 'rgba(240,232,208,0.65)');
          allEdgePaths.attr('stroke-opacity', (l) => {
            if (!selectedEra) return l.type === 'evolved_from' ? 0.65 : 0.28;
            const s = (l.source as GraphNode).era;
            const t = (l.target as GraphNode).era;
            const active = s === selectedEra || t === selectedEra;
            return active
              ? l.type === 'evolved_from' ? 0.8 : 0.45
              : 0.04;
          });
        })
        .on('click', (_, d) => {
          optionsRef.current.onDishClick(d);
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // layout built once on mount

  // ── Era highlight effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const svgEl = svgRef.current;
    if (!svgEl) return;

    import('d3').then((d3) => {
      const { selectedEra } = optionsRef.current;

      // Era bands
      d3.select(svgEl)
        .selectAll<SVGRectElement, EraId>('rect.era-band')
        .attr('fill-opacity', (d) =>
          !selectedEra || d === selectedEra ? 0.09 : 0.025
        );

      // Node groups
      d3.select(svgEl)
        .selectAll<SVGGElement, GraphNode>('g.dish-node')
        .attr('opacity', (d) =>
          !selectedEra || d.era === selectedEra ? 1 : 0.18
        );

      // Edges
      d3.select(svgEl)
        .selectAll<SVGPathElement, GraphLink>('path.dish-edge')
        .attr('stroke-opacity', (d) => {
          if (!selectedEra) {
            return d.type === 'evolved_from' ? 0.65 : 0.28;
          }
          const s = (d.source as GraphNode).era;
          const t = (d.target as GraphNode).era;
          const active = s === selectedEra || t === selectedEra;
          return active
            ? d.type === 'evolved_from' ? 0.8 : 0.45
            : 0.04;
        });

      // Era labels
      d3.select(svgEl)
        .selectAll<SVGTextElement, unknown>('text')
        .filter(function () {
          return (
            (this as SVGTextElement).closest('.era-labels') !== null
          );
        })
        .style('fill-opacity', function () {
          const eraG = (this as SVGTextElement).closest('g.era-labels');
          if (!eraG || !selectedEra) return null;
          // We can't easily map text → eraId here; leave labels unchanged
          return null;
        });
    });
  }, [options.selectedEra, svgRef]);

  // ── Selected dish highlight ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const svgEl = svgRef.current;
    if (!svgEl) return;

    import('d3').then((d3) => {
      const { selectedDish } = optionsRef.current;
      const selectedId = selectedDish?.id ?? null;

      d3.select(svgEl)
        .selectAll<SVGGElement, GraphNode>('g.dish-node')
        .select('circle.node-circle')
        .attr('stroke', (d) =>
          d.id === selectedId
            ? 'rgba(240,232,208,0.95)'
            : 'rgba(240,232,208,0.2)'
        )
        .attr('stroke-width', (d) => (d.id === selectedId ? 2.5 : 1.5));

      d3.select(svgEl)
        .selectAll<SVGGElement, GraphNode>('g.dish-node')
        .select('circle.node-glow')
        .attr('stroke-opacity', (d) => (d.id === selectedId ? 0.5 : 0));
    });
  }, [options.selectedDish, svgRef]);
}
