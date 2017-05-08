
export type AdjacencyList = Map<number, Array<number>>;

// Kahn's topological sort algorithm
export function topologicalSort(graph: AdjacencyList): Array<number> {

  let result: Array<number> = [];
  let incomingEdgesCount: Map<number, number> = new Map();

  let isMalformedGraph: boolean = false;

  // Get a count of the incoming edges for each node
  graph.forEach((list, id) => {
    if (!incomingEdgesCount.has(id)) {
      incomingEdgesCount.set(id, 0);
    }
    list.forEach(dep => {

      // If a node b is in the dependency list for another node,
      // but b's dependency list is not set, then this algorithm
      // will fail
      if(!graph.has(dep)) { // this is a malformed graph
        isMalformedGraph = true;
      }
      if(isMalformedGraph) { return; }

      if (!incomingEdgesCount.has(dep)) {
        incomingEdgesCount.set(dep, 0);
      }

      incomingEdgesCount.set(dep, incomingEdgesCount.get(dep) + 1);
    });
  });

  if(isMalformedGraph) { return null; }

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
