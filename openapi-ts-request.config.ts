import { defineConfig } from 'openapi-ts-request'

export default defineConfig([
  {
    describe: 'zai-chat-mp-api',
    schemaPath: './docs/api/openapi.yaml',
    serversPath: './src/service',
    requestLibPath: `import request from '@/services/openapi-request';\nimport type { CustomRequestOptions_ } from '@/services/openapi-request';`,
    requestOptionsType: 'CustomRequestOptions_',
    isGenReactQuery: false,
    isGenJavaScript: false,
    isCamelCase: true,
    hook: {
      // @ts-ignore openapi-ts-request does not export its complete hook type
      afterOpenApiDataInited(openAPIData) {
        delete openAPIData.paths?.['/api/v1/runs/{runId}/events']
        return openAPIData
      },
    },
  },
])
