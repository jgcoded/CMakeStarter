
export type AdjacencyList = Map<number, Array<number>>;

// Kahn's topological sort algorithm
export function topologicalSort(graph: AdjacencyList): Array<number> {

  let result: Array<number> = [];
  let incomingEdgesCount: Map<number, number> = new Map();

  // Get a count of the incoming edges for each node
  graph.forEach((list, id) => {
    if (!incomingEdgesCount.has(id)) {
      incomingEdgesCount.set(id, 0);
    }
    list.forEach(dep => {
      if (!incomingEdgesCount.has(dep)) {
        incomingEdgesCount.set(dep, 0);
      }

      incomingEdgesCount.set(dep, incomingEdgesCount.get(dep) + 1);
    });
  });

  // Append all nodes with 0 incoming edges to a queue
  let queue: Array<number> = [];
  incomingEdgesCount.forEach(
    (value: number, key: number) => {
      if (value === 0) {
        queue.push(key);
      }
    });

  // continuously pop and decrease node counts
  while (queue.length > 0) {
    let node: number = queue.pop();
    result.push(node);

    graph.get(node).forEach((otherNode: number) => {

      incomingEdgesCount.set(otherNode, incomingEdgesCount.get(otherNode) - 1);

      // Note: if subtracting causes the result to be < 0 then there's a cycle
      if (incomingEdgesCount.get(otherNode) === 0) {
        queue.push(otherNode);
      }
    });

    graph.delete(node);
  }

  return result;
}
