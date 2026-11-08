/* eslint-disable */
// @ts-ignore
import * as API from './types';

export function displayRoleEnum(field: API.RoleEnum) {
  return { user: 'user' }[field];
}

export function displayRoleEnum2(field: API.RoleEnum2) {
  return {
    user: 'user',
    assistant: 'assistant',
    system: 'system',
    tool: 'tool',
  }[field];
}

export function displayStatusEnum(field: API.StatusEnum) {
  return { active: 'active', disabled: 'disabled' }[field];
}

export function displayStatusEnum2(field: API.StatusEnum2) {
  return { completed: 'completed' }[field];
}

export function displayStatusEnum3(field: API.StatusEnum3) {
  return {
    pending: 'pending',
    streaming: 'streaming',
    completed: 'completed',
    cancelled: 'cancelled',
    failed: 'failed',
  }[field];
}

export function displayStatusEnum4(field: API.StatusEnum4) {
  return {
    queued: 'queued',
    streaming: 'streaming',
    completed: 'completed',
    cancelled: 'cancelled',
    failed: 'failed',
  }[field];
}

export function displayTypeEnum(field: API.TypeEnum) {
  return { text: 'text' }[field];
}
