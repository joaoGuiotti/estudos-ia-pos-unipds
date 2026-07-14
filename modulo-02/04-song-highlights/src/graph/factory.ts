import { config } from '../config.ts';
import { MemorySumarizationService } from '../services/memorySumarization.ts';
import { OpenRouterService } from '../services/openrouterService.ts';
import { PreferencesService } from '../services/preferencesService.ts';
import { buildChatGraph } from './graph.ts';

export async function buildGraph(dbPath: string = './data/preferences.db') {
  const llmClient = OpenRouterService.create(config);
  const memoryService = await MemorySumarizationService.create();
  const preferencesService = PreferencesService.create(dbPath);

  const graph = buildChatGraph(
    llmClient,
    preferencesService,
    memoryService
  );

  return {
    graph,
    preferencesService,
    memoryService
  };
}

export const graph = async () => buildGraph();
export default graph;
