import { defineConfig } from 'openapi-ts-request'

interface OpenApiDocument {
  paths?: Record<string, unknown>
}

export default defineConfig([
  {
    describe: 'zai-chat-mp-api',
    schemaPath: './docs/api/openapi.yaml',
    serversPath: './src/generated/openapi',
    requestLibPath: `import request from '@/shared/api/openapi-request';\nimport type { CustomRequestOptions } from '@/shared/api/openapi-request';`,
    requestOptionsType: 'CustomRequestOptions',
    isGenReactQuery: false,
    isGenJavaScript: false,
    isCamelCase: true,
    hook: {
      afterOpenApiDataInited(openApiData: OpenApiDocument): OpenApiDocument {
        const { ['/api/v1/runs/{runId}/events']: _ignoredPath, ...paths } = openApiData.paths ?? {}
        return {
          ...openApiData,
          paths,
        }
      },
    },
  },
])
