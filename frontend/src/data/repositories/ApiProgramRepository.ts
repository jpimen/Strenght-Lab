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
  async getProgramData(programId: string): Promise<ProgramData> {
    return request<ProgramData>(`/programs/${programId}`);
  }

  async createProgram(input: ProgramData, builderData: unknown): Promise<{ shareCode: string; id: string }> {
    return request<{ shareCode: string; id: string }>('/programs/create', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        athleteName: input.athleteName,
        goal: input.goal,
        durationWeeks: input.durationWeeks,
        status: 'PUBLISHED',
        builderData: builderData,
      }),
    });
  }

  async updateProgram(programId: string, input: ProgramData, builderData: unknown): Promise<{ shareCode: string; id: string }> {
    return request<{ shareCode: string; id: string }>(`/programs/${programId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: input.name,
        athleteName: input.athleteName,
        goal: input.goal,
        durationWeeks: input.durationWeeks,
        status: input.status === 'PUBLISHED' ? 'PUBLISHED' : 'CREATED',
        builderData: builderData,
      }),
    });
  }

  async publishProgram(input: ProgramData, builderData: unknown): Promise<{ shareCode: string; id: string }> {
    if (input.id && input.id !== 'new') {
      return this.updateProgram(input.id, input, builderData);
    }
    return this.createProgram(input, builderData);
  }
}

export const programRepository = new ApiProgramRepository();
