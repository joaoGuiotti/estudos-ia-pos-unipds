import type { Runtime } from '@langchain/langgraph';
import { PreferencesService } from '../../services/preferencesService.ts';
import type { GraphState } from '../graph.ts';
import { getUserId } from '../utils/getUserId.ts';

export function createSavePreferencesNode(preferencesService: PreferencesService) {
  return async (state: GraphState, runtime?: Runtime): Promise<Partial<GraphState>> => {
    if (!state.extractedPreferences) {
      return {
        ...state
      }
    }

    const userId = getUserId(state, runtime);
    await preferencesService.mergePreferences(userId, state.extractedPreferences);

    return {
      extractedPreferences: null,
    };
  };
}
