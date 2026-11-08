import type { StreamConnection } from '../api/chat-api'

export class RunConnectionRegistry {
  private readonly connections = new Map<string, StreamConnection>()

  add(runId: string, connection: StreamConnection): void {
    this.connections.get(runId)?.abort()
    this.connections.set(runId, connection)
  }

  get(runId: string): StreamConnection | undefined {
    return this.connections.get(runId)
  }

  abort(runId: string): void {
    this.connections.get(runId)?.abort()
    this.connections.delete(runId)
  }

  remove(runId: string): void {
    this.connections.delete(runId)
  }
}
