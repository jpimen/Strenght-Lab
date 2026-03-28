import type { ProgramData, IProgramRepository } from '../../domain/entities/ProgramData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const TOKEN_KEY = 'ironlog.auth.token';

function getStoredToken() {
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  if (sessionToken) return sessionToken;
  const localToken = localStorage.getItem(TOKEN_KEY);
  if (localToken) return localToken;
  return null;
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.code || 'SERVER_ERROR');
  }

  return response.json();
}

export class ApiProgramRepository implements IProgramRepository {
  async getProgramData(): Promise<ProgramData> {
    // For now, this might still return a mock or call a specific endpoint
    // if we had a "get individual program" API. 
    // Since we're mostly building new programs, let's keep it simple.
    throw new Error('NOT_IMPLEMENTED');
  }

  async publishProgram(input: ProgramData, builderData: any): Promise<{ shareCode: string }> {
    return request<{ shareCode: string }>('/programs/create', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        athleteName: input.athleteName,
        goal: input.goal,
        durationWeeks: input.durationWeeks,
        status: 'published',
        builderData: builderData,
      }),
    });
  }
}

export const programRepository = new ApiProgramRepository();
