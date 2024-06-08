import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, useReactFlow } from 'reactflow';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import TextBox from '../components/graph/TextBox';
import classes from './Home.module.css';

const nodeWidth = 150;
const nodeHeight = 50;
const horizontalSpacing = 200;
const verticalSpacing = 100;

const buildNodesAndEdges = (messages, onClick) => {
  
  const nodes = [];
  const edges = [];
  let initId = 0;
  let flag = false;

  const messageMap = {};

  messages.forEach(message => {
    if (!flag) {
      initId = message.id
      flag = true
    }
    
    return messageMap[message.id] = { ...message, children: [] };
  });

  messages.forEach(message => {
    if (message.parent_id !== message.id) {
      messageMap[message.parent_id]?.children.push(messageMap[message.id]);
    }
  });

  const positionNodes = (node, x = 0, y = 0) => {
    // console.log("node:", node)
    nodes.push({
      id: `${node.id}`,
      data: { label: <TextBox text={node.text} type={node.role} id={node.id} onClick={onClick} /> },
      position: { x, y },
      type: 'default',
    });

    let childX = x - ((node.children.length - 1) * (nodeWidth + horizontalSpacing)) / 2;
    let childY = y + nodeHeight + verticalSpacing;
    // console.log('children: ', node.children)
    node.children.forEach((child) => {
      edges.push({
        id: `e${node.id}-${child.id}`,
        source: `${node.id}`,
        target: `${child.id}`,
        type: 'smoothstep'
      });
      positionNodes(child, childX, childY);
      childX += nodeWidth + horizontalSpacing;
    });
  };

  positionNodes(messageMap[initId]);
  // console.log("final nodes: ", nodes)
  // console.log("final edges: ", edges)
  return { nodes, edges };
};

const Maze = ({ onClick, allMessages }) => {
  // console.log("allmessages:", allMessages.length)
  const [messages, setMessages] = useState([
    {
      id: '-1',
      parent_id: '-1',
      role: 'user',
      text: 'Start typing on the right to begin!'
    }
  ]);

  useEffect(() => {
    if (allMessages.length !== 0) {
      setMessages(allMessages);
    }
  }, [allMessages]);
  // console.log("messages in maze: ", messages)

  // console.log("BUILDING:", buildNodesAndEdges(messages, onClick))

  const { nodes: initialNodes, edges: initialEdges } = buildNodesAndEdges(messages, onClick);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildNodesAndEdges(messages, onClick);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [messages, onClick, setNodes, setEdges]);

  const { fitView } = useReactFlow();

  // useEffect(() => {
  //   if (addNode) {
  //     setMessages(prevMessages => {
  //       const updatedMessages = [...prevMessages, addNode];
  //       const { nodes, edges } = buildNodesAndEdges(updatedMessages, onClick);
  //       setNodes(nodes);
  //       setEdges(edges);
  //       return updatedMessages;
  //     });
  //   }
  // }, [addNode, setNodes, setEdges]);

  useEffect(() => {
    fitView();
  }, [nodes, edges, fitView]);

  // console.log("nodes outside: ", nodes)
  // console.log("edges outside: ", edges)

  return (
    <ReactFlowProvider>
      <div style={{ height: '95vh', width: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default Maze;
