import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Filter,
  Info,
  ExternalLink,
  BookOpen,
  Shield,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'criterion' | 'requirement' | 'document' | 'process' | 'endorser' | 'regulation';
  description: string;
  connections: string[];
  importance: 'critical' | 'important' | 'helpful';
  source?: string;
  sourceUrl?: string;
}

interface KnowledgeEdge {
  from: string;
  to: string;
  relationship: string;
}

const KNOWLEDGE_NODES: KnowledgeNode[] = [
  {
    id: 'innovation',
    label: 'Innovation Criteria',
    type: 'criterion',
    description: 'Your business idea must be new and innovative. It should offer something different from what is already available in the market.',
    connections: ['usp', 'technology', 'endorser-check', 'business-plan'],
    importance: 'critical',
    source: 'Home Office',
    sourceUrl: 'https://www.gov.uk/innovator-founder-visa'
  },
  {
    id: 'viability',
    label: 'Viability Criteria',
    type: 'criterion',
    description: 'You must have, or be actively developing, the necessary skills, knowledge, and experience to run the business.',
    connections: ['financial-projections', 'market-research', 'founder-experience', 'endorser-check'],
    importance: 'critical',
    source: 'Home Office'
  },
  {
    id: 'scalability',
    label: 'Scalability Criteria',
    type: 'criterion',
    description: 'Your business must have the potential for growth and creating jobs in the UK.',
    connections: ['job-creation', 'market-expansion', 'funding-strategy', 'endorser-check'],
    importance: 'critical',
    source: 'Home Office'
  },
  {
    id: 'endorser-check',
    label: 'Endorsement',
    type: 'process',
    description: 'You must get your business endorsed by an approved endorsing body before applying for the visa.',
    connections: ['innovation', 'viability', 'scalability', 'endorser-letter', 'endorser-bodies'],
    importance: 'critical',
    source: 'Home Office'
  },
  {
    id: 'endorser-bodies',
    label: 'Approved Endorsing Bodies',
    type: 'endorser',
    description: 'Organizations approved by the Home Office to assess and endorse business ideas.',
    connections: ['endorser-check', 'endorser-letter'],
    importance: 'critical',
    source: 'GOV.UK'
  },
  {
    id: 'business-plan',
    label: 'Business Plan',
    type: 'document',
    description: 'A comprehensive document outlining your business strategy, market analysis, and financial projections.',
    connections: ['innovation', 'viability', 'scalability', 'financial-projections', 'market-research'],
    importance: 'critical'
  },
  {
    id: 'financial-projections',
    label: 'Financial Projections',
    type: 'document',
    description: '3-5 year financial forecasts showing revenue, costs, and profitability.',
    connections: ['viability', 'business-plan', 'funding-strategy'],
    importance: 'critical'
  },
  {
    id: 'market-research',
    label: 'Market Research',
    type: 'document',
    description: 'Analysis of TAM, SAM, SOM and competitive landscape.',
    connections: ['viability', 'scalability', 'business-plan'],
    importance: 'important'
  },
  {
    id: 'usp',
    label: 'Unique Selling Proposition',
    type: 'requirement',
    description: 'What makes your product/service different and better than alternatives.',
    connections: ['innovation', 'business-plan'],
    importance: 'critical'
  },
  {
    id: 'technology',
    label: 'Technology Innovation',
    type: 'requirement',
    description: 'Novel technology, processes, or methods that differentiate your business.',
    connections: ['innovation', 'ip-protection'],
    importance: 'important'
  },
  {
    id: 'ip-protection',
    label: 'IP Protection',
    type: 'requirement',
    description: 'Patents, trademarks, copyrights protecting your innovations.',
    connections: ['technology', 'innovation'],
    importance: 'helpful'
  },
  {
    id: 'job-creation',
    label: 'Job Creation Plan',
    type: 'requirement',
    description: 'Plan to create jobs for UK workers. ILR requires 5 jobs at £25K+ or 10 jobs at any salary.',
    connections: ['scalability', 'hiring-plan', 'ilr-requirements'],
    importance: 'critical'
  },
  {
    id: 'ilr-requirements',
    label: 'ILR Requirements',
    type: 'regulation',
    description: 'Requirements for Indefinite Leave to Remain after 3 years.',
    connections: ['job-creation', 'scalability'],
    importance: 'important'
  },
  {
    id: 'funding-strategy',
    label: 'Funding Strategy',
    type: 'document',
    description: 'How you will fund your business - investment, grants, revenue.',
    connections: ['viability', 'scalability', 'financial-projections', 'investment-requirements'],
    importance: 'important'
  },
  {
    id: 'investment-requirements',
    label: 'Investment (£50,000+)',
    type: 'requirement',
    description: 'Minimum investment of £50,000 from approved sources if not self-funding.',
    connections: ['funding-strategy', 'viability'],
    importance: 'important'
  },
  {
    id: 'founder-experience',
    label: 'Founder Experience',
    type: 'requirement',
    description: 'Relevant skills and experience to successfully run the business.',
    connections: ['viability', 'team-structure'],
    importance: 'important'
  },
  {
    id: 'team-structure',
    label: 'Team Structure',
    type: 'document',
    description: 'Organization chart and roles of founding team.',
    connections: ['founder-experience', 'hiring-plan'],
    importance: 'helpful'
  },
  {
    id: 'hiring-plan',
    label: 'Hiring Plan',
    type: 'document',
    description: 'Timeline and roles for hiring UK employees.',
    connections: ['job-creation', 'team-structure', 'scalability'],
    importance: 'important'
  },
  {
    id: 'market-expansion',
    label: 'Market Expansion',
    type: 'requirement',
    description: 'Plans for geographic expansion and market growth.',
    connections: ['scalability', 'business-plan'],
    importance: 'helpful'
  },
  {
    id: 'endorser-letter',
    label: 'Endorsement Letter',
    type: 'document',
    description: 'Official letter from endorsing body confirming your business meets criteria.',
    connections: ['endorser-check', 'endorser-bodies', 'visa-application'],
    importance: 'critical'
  },
  {
    id: 'visa-application',
    label: 'Visa Application',
    type: 'process',
    description: 'The formal application to the Home Office for the Innovator Founder visa.',
    connections: ['endorser-letter', 'maintenance-funds', 'english-requirement', 'tb-test'],
    importance: 'critical'
  },
  {
    id: 'maintenance-funds',
    label: 'Maintenance Funds (£1,270)',
    type: 'requirement',
    description: 'Must hold £1,270 in bank account for 28 consecutive days.',
    connections: ['visa-application'],
    importance: 'critical'
  },
  {
    id: 'english-requirement',
    label: 'English Language (B2)',
    type: 'requirement',
    description: 'IELTS 5.5 in each component or approved equivalent.',
    connections: ['visa-application'],
    importance: 'critical'
  },
  {
    id: 'tb-test',
    label: 'TB Test',
    type: 'requirement',
    description: 'Tuberculosis test certificate if applying from certain countries.',
    connections: ['visa-application'],
    importance: 'important'
  }
];

const NODE_COLORS: Record<string, string> = {
  criterion: '#005EB8',
  requirement: '#41B6E6',
  document: '#22c55e',
  process: '#8b5cf6',
  endorser: '#ec4899',
  regulation: '#ef4444'
};

const NODE_ICONS: Record<string, typeof Shield> = {
  criterion: Shield,
  requirement: CheckCircle2,
  document: FileText,
  process: TrendingUp,
  endorser: Users,
  regulation: AlertCircle
};

export function KnowledgeGraph() {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredNodes = KNOWLEDGE_NODES.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterType || node.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node);
    setHighlightedNodes([node.id, ...node.connections]);
  };

  const nodeTypes = ['criterion', 'requirement', 'document', 'process', 'endorser', 'regulation'];

  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 200;
    return {
      x: 300 + radius * Math.cos(angle),
      y: 250 + radius * Math.sin(angle)
    };
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Network className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Immigration Knowledge Graph</h2>
            <p className="text-muted-foreground">
              Visual map of UK Innovator Founder visa requirements and connections
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requirements, documents, criteria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-knowledge"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
                  data-testid="button-zoom-in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                  data-testid="button-zoom-out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => { setZoom(1); setFilterType(null); setSearchQuery(""); }}
                  data-testid="button-reset-view"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {nodeTypes.map(type => (
                <Badge
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  style={filterType === type ? { backgroundColor: NODE_COLORS[type] } : {}}
                  onClick={() => setFilterType(filterType === type ? null : type)}
                  data-testid={`badge-filter-${type}`}
                >
                  {type}
                </Badge>
              ))}
            </div>

            <div 
              ref={containerRef}
              className="relative bg-muted/30 rounded-lg overflow-hidden"
              style={{ height: '500px' }}
            >
              <svg 
                width="100%" 
                height="100%" 
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              >
                {filteredNodes.map((node, i) => {
                  const pos = getNodePosition(i, filteredNodes.length);
                  return node.connections.map(connId => {
                    const targetNode = filteredNodes.find(n => n.id === connId);
                    if (!targetNode) return null;
                    const targetIdx = filteredNodes.findIndex(n => n.id === connId);
                    if (targetIdx === -1) return null;
                    const targetPos = getNodePosition(targetIdx, filteredNodes.length);
                    
                    return (
                      <line
                        key={`${node.id}-${connId}`}
                        x1={pos.x}
                        y1={pos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke={highlightedNodes.includes(node.id) && highlightedNodes.includes(connId) 
                          ? NODE_COLORS[node.type] 
                          : '#e5e7eb'}
                        strokeWidth={highlightedNodes.includes(node.id) && highlightedNodes.includes(connId) ? 2 : 1}
                        opacity={highlightedNodes.length === 0 || (highlightedNodes.includes(node.id) && highlightedNodes.includes(connId)) ? 0.6 : 0.1}
                      />
                    );
                  });
                })}
                
                {filteredNodes.map((node, i) => {
                  const pos = getNodePosition(i, filteredNodes.length);
                  const isHighlighted = highlightedNodes.length === 0 || highlightedNodes.includes(node.id);
                  const Icon = NODE_ICONS[node.type];
                  
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onClick={() => handleNodeClick(node)}
                      className="cursor-pointer"
                      opacity={isHighlighted ? 1 : 0.3}
                    >
                      <circle
                        r={node.importance === 'critical' ? 35 : node.importance === 'important' ? 28 : 22}
                        fill={NODE_COLORS[node.type]}
                        className="transition-all hover:opacity-80"
                      />
                      <circle
                        r={node.importance === 'critical' ? 40 : node.importance === 'important' ? 33 : 27}
                        fill="none"
                        stroke={NODE_COLORS[node.type]}
                        strokeWidth="2"
                        opacity={selectedNode?.id === node.id ? 1 : 0}
                        className="animate-pulse"
                      />
                      <text
                        y={node.importance === 'critical' ? 50 : 45}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="10"
                        className="font-medium"
                      >
                        {node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Legend
            </h3>
            
            <div className="space-y-2">
              {nodeTypes.map(type => {
                const Icon = NODE_ICONS[type];
                return (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: NODE_COLORS[type] }}
                    />
                    <Icon className="h-4 w-4" style={{ color: NODE_COLORS[type] }} />
                    <span className="capitalize">{type}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">L</div>
                Large = Critical
              </p>
              <p className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">M</div>
                Medium = Important
              </p>
              <p className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs">S</div>
                Small = Helpful
              </p>
            </div>
          </Card>

          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-4" style={{ borderColor: NODE_COLORS[selectedNode.type] }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: NODE_COLORS[selectedNode.type] }}
                    >
                      {(() => {
                        const Icon = NODE_ICONS[selectedNode.type];
                        return <Icon className="h-5 w-5 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedNode.label}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className="capitalize text-xs"
                          style={{ borderColor: NODE_COLORS[selectedNode.type], color: NODE_COLORS[selectedNode.type] }}
                        >
                          {selectedNode.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            selectedNode.importance === 'critical' ? 'border-red-500 text-red-500' :
                            selectedNode.importance === 'important' ? 'border-yellow-500 text-yellow-500' :
                            'border-green-500 text-green-500'
                          }`}
                        >
                          {selectedNode.importance}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedNode.description}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Connected to:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.connections.map(connId => {
                        const connNode = KNOWLEDGE_NODES.find(n => n.id === connId);
                        if (!connNode) return null;
                        return (
                          <Badge 
                            key={connId}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-muted"
                            onClick={() => handleNodeClick(connNode)}
                          >
                            {connNode.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  
                  {selectedNode.source && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Source: {selectedNode.source}
                        {selectedNode.sourceUrl && (
                          <a 
                            href={selectedNode.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline ml-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedNode && (
            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground text-center">
                Click on any node to see details and connections
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default KnowledgeGraph;
