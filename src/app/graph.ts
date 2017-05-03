
export type AdjacencyList = Array<Array<number>>;

// Kahn's topological sort algorithm
function topologicalSort(graph : AdjacencyList) : Array<number> {
    let result : Array<number>;

    // counted graph is a tuple [# of incoming edges, children nodes]
    let countedGraph : Array<[number, Array<number>]>;
    countedGraph.fill([0, Array<number>()], 0, graph.length);

    graph.forEach(list => {
        list.forEach(node => {
            countedGraph[node][0] += 1;
        });
    });


    let queue : Array<number>;
    countedGraph.forEach(
        function(value, index) {
            if(value[0] === 0) {
                queue.push(index);
            }
        }
    );

    while(queue.length > 0)
    {
        let node : number = queue.pop();
        result.push(node);
        
        countedGraph[node][1].forEach(otherNode => {
            countedGraph[otherNode][0] -= 1; // if subtracting 1 causes the result to be < 0 then there's a cycle
            if(countedGraph[otherNode][0] == 0) {
                queue.push(otherNode);
            }
        });

        // countedGraph.splice(node, 1); I don't think I need this call - 
        // node already has zero incoming edges so no other edge in the
        // countedGraph will lead to node
    }

    return result;
}
