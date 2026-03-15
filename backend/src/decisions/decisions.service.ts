import { Injectable, NotFoundException } from '@nestjs/common';
import { ZenEngine } from '@gorules/zen-engine';
import { v4 as uuidv4 } from 'uuid';

export interface SavedRequest {
  id: string;
  name: string;
  context: any;
  createdAt: string;
}

export interface Decision {
  id: string;
  name: string;
  graph: any; // JDM DecisionGraphType
  savedRequests: SavedRequest[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class DecisionsService {
  private decisions: Map<string, Decision> = new Map();

  constructor() {
    // Seed with a sample decision
    const sampleId = uuidv4();
    const sampleGraph = {
      nodes: [
        {
          id: '1',
          type: 'inputNode',
          position: { x: 100, y: 200 },
          name: 'Request',
        },
        {
          id: '2',
          type: 'outputNode',
          position: { x: 700, y: 200 },
          name: 'Response',
        },
        {
          id: '3',
          type: 'decisionTableNode',
          position: { x: 400, y: 200 },
          name: 'Customer Discount',
          content: {
            hitPolicy: 'first',
            rules: [
              {
                _id: 'rule-1',
                _description: '',
                'input_1': '"gold"',
                'output_1': '15',
              },
              {
                _id: 'rule-2',
                '_description': '',
                'input_1': '"silver"',
                'output_1': '10',
              },
              {
                _id: 'rule-3',
                '_description': '',
                'input_1': '',
                'output_1': '5',
              },
            ],
            inputs: [
              {
                id: 'input_1',
                name: 'Customer Tier',
                type: 'expression',
                field: 'customer.tier',
              },
            ],
            outputs: [
              {
                id: 'output_1',
                name: 'Discount',
                type: 'expression',
                field: 'discount',
              },
            ],
          },
        },
      ],
      edges: [
        { id: 'e1', sourceId: '1', targetId: '3', type: 'edge' },
        { id: 'e2', sourceId: '3', targetId: '2', type: 'edge' },
      ],
    };
    this.decisions.set(sampleId, {
      id: sampleId,
      name: 'Customer Discount Rules',
      graph: sampleGraph,
      savedRequests: [
        {
          id: uuidv4(),
          name: 'Gold Customer',
          context: { customer: { tier: 'gold' }, cart: { total: 500 } },
          createdAt: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          name: 'Silver Customer',
          context: { customer: { tier: 'silver' }, cart: { total: 200 } },
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  findAll(): Decision[] {
    return Array.from(this.decisions.values());
  }

  findOne(id: string): Decision {
    const decision = this.decisions.get(id);
    if (!decision) {
      throw new NotFoundException(`Decision ${id} not found`);
    }
    return decision;
  }

  create(name: string, graph?: any): Decision {
    const id = uuidv4();
    const defaultGraph = graph || {
      nodes: [
        {
          id: '1',
          type: 'inputNode',
          position: { x: 100, y: 200 },
          name: 'Request',
        },
        {
          id: '2',
          type: 'outputNode',
          position: { x: 700, y: 200 },
          name: 'Response',
        },
      ],
      edges: [],
    };
    const decision: Decision = {
      id,
      name,
      graph: defaultGraph,
      savedRequests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.decisions.set(id, decision);
    return decision;
  }

  update(id: string, data: { name?: string; graph?: any }): Decision {
    const decision = this.findOne(id);
    if (data.name !== undefined) decision.name = data.name;
    if (data.graph !== undefined) decision.graph = data.graph;
    decision.updatedAt = new Date().toISOString();
    this.decisions.set(id, decision);
    return decision;
  }

  delete(id: string): void {
    if (!this.decisions.has(id)) {
      throw new NotFoundException(`Decision ${id} not found`);
    }
    this.decisions.delete(id);
  }

  // Saved requests CRUD
  getSavedRequests(decisionId: string): SavedRequest[] {
    const decision = this.findOne(decisionId);
    return decision.savedRequests;
  }

  createSavedRequest(decisionId: string, name: string, context: any): SavedRequest {
    const decision = this.findOne(decisionId);
    const req: SavedRequest = {
      id: uuidv4(),
      name,
      context,
      createdAt: new Date().toISOString(),
    };
    decision.savedRequests.push(req);
    return req;
  }

  updateSavedRequest(decisionId: string, requestId: string, data: { name?: string; context?: any }): SavedRequest {
    const decision = this.findOne(decisionId);
    const req = decision.savedRequests.find((r) => r.id === requestId);
    if (!req) throw new NotFoundException(`Saved request ${requestId} not found`);
    if (data.name !== undefined) req.name = data.name;
    if (data.context !== undefined) req.context = data.context;
    return req;
  }

  deleteSavedRequest(decisionId: string, requestId: string): void {
    const decision = this.findOne(decisionId);
    const idx = decision.savedRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new NotFoundException(`Saved request ${requestId} not found`);
    decision.savedRequests.splice(idx, 1);
  }

  async simulate(id: string, context: any): Promise<any> {
    const decision = this.findOne(id);
    const engine = new ZenEngine();
    try {
      const content = Buffer.from(JSON.stringify(decision.graph));
      const dec = engine.createDecision(content);
      const response = await dec.evaluate(context, { trace: true });
      return {
        result: response.result,
        performance: response.performance,
        trace: response.trace,
      };
    } finally {
      engine.dispose();
    }
  }
}
