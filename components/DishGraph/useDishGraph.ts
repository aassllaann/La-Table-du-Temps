'use client';

import { useEffect, useRef } from 'react';
import { getEraColor, getNodeRadius, getEdgeDash } from '@/lib/utils';
import type { Dish, Edge, GraphNode, GraphLink } from '@/lib/types';

interface Options {
  dishes: Dish[];
  edges: Edge[];
  selectedDish: Dish | null;
  onDishClick: (dish: Dish) => void;
}

export function useDishGraph(
  svgRef: React.RefObject<SVGSVGElement | null>,
  options: Options
) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const svgEl = svgRef.current;
    if (!svgEl) return;

    let simulation: { stop: () => void } | null = null;

    import('d3').then((d3) => {
      const { dishes, edges } = optionsRef.current;

      // Clear previous render
      d3.select(svgEl).selectAll('*').remove();

      const width = svgEl.clientWidth || 800;
      const height = svgEl.clientHeight || 600;

      const svg = d3.select(svgEl);

      // Arrow marker for evolved_from edges
      svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrow-evolved')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 18)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#C8A84B')
        .attr('fill-opacity', 0.8);

      // Zoom container
      const g = svg.append('g');

      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.25, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform.toString());
        });

      svg.call(zoom);

      // Build simulation data
      const nodes: GraphNode[] = dishes.map((d) => ({ ...d }));
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      const links: GraphLink[] = edges
        .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
        .map((e) => ({
          source: e.source,
          target: e.target,
          type: e.type,
        }));

      // Force simulation
      const sim = d3
        .forceSimulation<GraphNode>(nodes)
        .force(
          'link',
          d3
            .forceLink<GraphNode, GraphLink>(links)
            .id((d) => d.id)
            .distance((d) => (d.type === 'evolved_from' ? 130 : 85))
            .strength((d) => (d.type === 'evolved_from' ? 0.7 : 0.25))
        )
        .force('charge', d3.forceManyBody<GraphNode>().strength(-280))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide<GraphNode>().radius(32))
        .force('x', d3.forceX<GraphNode>(width / 2).strength(0.04))
        .force('y', d3.forceY<GraphNode>(height / 2).strength(0.04))
        .alphaDecay(0.028)
        .velocityDecay(0.38);

      simulation = sim;

      // Render edges
      const link = g
        .append('g')
        .attr('class', 'links')
        .selectAll<SVGLineElement, GraphLink>('line')
        .data(links)
        .join('line')
        .attr('stroke', (d) =>
          d.type === 'evolved_from' ? '#C8A84B' : '#7A6040'
        )
        .attr('stroke-opacity', (d) =>
          d.type === 'evolved_from' ? 0.75 : 0.38
        )
        .attr('stroke-width', (d) =>
          d.type === 'evolved_from' ? 1.6 : 1
        )
        .attr('stroke-dasharray', (d) => getEdgeDash(d.type))
        .attr('marker-end', (d) =>
          d.type === 'evolved_from' ? 'url(#arrow-evolved)' : null
        );

      // Render nodes
      const nodeGroup = g
        .append('g')
        .attr('class', 'nodes')
        .selectAll<SVGGElement, GraphNode>('g.dish-node')
        .data(nodes, (d) => d.id)
        .join('g')
        .attr('class', 'dish-node')
        .style('cursor', 'pointer')
        .call(
          d3
            .drag<SVGGElement, GraphNode>()
            .on('start', (event, d) => {
              if (!event.active) sim.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on('drag', (event, d) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on('end', (event, d) => {
              if (!event.active) sim.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            })
        );

      // Node circle
      nodeGroup
        .append('circle')
        .attr('r', (d) => getNodeRadius(d.chef !== null))
        .attr('fill', (d) => getEraColor(d.era))
        .attr('fill-opacity', 0.88)
        .attr('stroke', 'rgba(240,232,208,0.25)')
        .attr('stroke-width', 1.5);

      // Node label (French name)
      nodeGroup
        .append('text')
        .attr('dy', (d) => getNodeRadius(d.chef !== null) + 13)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('font-family', 'Georgia, serif')
        .style('fill', 'rgba(240,232,208,0.72)')
        .style('pointer-events', 'none')
        .style('user-select', 'none')
        .text((d) => d.name_fr);

      // Hover behavior
      nodeGroup
        .on('mouseover', (event, hovered) => {
          const connectedIds = new Set<string>([hovered.id]);
          links.forEach((l) => {
            const s =
              typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
            const t =
              typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
            if (s === hovered.id || t === hovered.id) {
              connectedIds.add(s);
              connectedIds.add(t);
            }
          });

          nodeGroup.attr('opacity', (n) =>
            connectedIds.has(n.id) ? 1 : 0.18
          );
          link.attr('opacity', (l) => {
            const s =
              typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
            const t =
              typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
            return s === hovered.id || t === hovered.id ? 1 : 0.06;
          });
        })
        .on('mouseout', () => {
          nodeGroup.attr('opacity', 1);
          link.attr('opacity', null);
        })
        .on('click', (_event, d) => {
          optionsRef.current.onDishClick(d);
        });

      // Tooltip title
      nodeGroup.append('title').text((d) => `${d.name_fr} · ${d.name_zh}`);

      // Tick
      sim.on('tick', () => {
        link
          .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
          .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
          .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
          .attr('y2', (d) => (d.target as GraphNode).y ?? 0);

        nodeGroup.attr(
          'transform',
          (d) => `translate(${d.x ?? 0},${d.y ?? 0})`
        );
      });
    });

    return () => {
      simulation?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.dishes, options.edges]);

  // Highlight selected dish node separately (without re-running simulation)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const svgEl = svgRef.current;
    if (!svgEl) return;

    import('d3').then((d3) => {
      const selectedId = optionsRef.current.selectedDish?.id ?? null;
      d3.select(svgEl)
        .selectAll<SVGGElement, GraphNode>('g.dish-node')
        .select('circle')
        .attr('stroke', (d) =>
          d.id === selectedId
            ? 'rgba(240,232,208,0.9)'
            : 'rgba(240,232,208,0.25)'
        )
        .attr('stroke-width', (d) => (d.id === selectedId ? 2.5 : 1.5));
    });
  }, [options.selectedDish, svgRef]);
}
