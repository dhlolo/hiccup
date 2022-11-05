#!/usr/bin/env ts-node
/**
 * 【hiccup】
 * How to inject request params and response type info in a intensive service case as below:
 * 【use case】
 *   const config = ServiceHelper.defineConfig({
 *     getSomething: { url: '/demo/get' },
 *     submitSomething: { url: '/demo/post', method: 'post' },
 *   });
 *
 *   const service = new ServiceHelper({ http }).create(config);
 *
 *   service.getSomething({ keyword: '', { timeout: 3000 } }).then(res => {});
 */

type TConfig = {
  [requestName: string]: any;
};

type TService = any;

type TRequestParams = any;
type TRequestResponse = any;

type TRequestConfig = any;
type TDefineConfig = { [requestName: string]: TRequestConfig };

type TRequestParamsMap = {
  [requestName: string]: TRequestParams;
};

type TRequestResponseMap = {
  [requestName: string]: TRequestResponse;
};

// Plan A: inject with a type mapping in create method
type TInJect<T, P = TRequestParamsMap, R = TRequestResponseMap> = {
  [K in keyof T]?: K extends keyof P
    ? (params: P[K]) => Promise<K extends keyof R ? R[K] : any>
    : (params: any) => Promise<K extends keyof R ? R[K] : any>;
};

class ServiceHelperA {
  constructor(injectObj: { http: any }) {}
  defineConfig(requestInfo: TDefineConfig): TConfig {
    return {};
  }
  create<TConfig, P = {}, R = {}>(config: TConfig): TInJect<TConfig, P, R> {
    return Object.keys(config).reduce(
      (res, item) => ({
        ...res,
        [item]: () => Promise.resolve(),
      }),
      {}
    );
  }
}

// Plan B: add define function property in config to transfer type info
type TTypeInfo = {
  define?(
    requestParams: TRequestParams): TRequestResponse;
};
type TRequestInfo = {
  [key in keyof TDefineConfig]: TDefineConfig[key] & TTypeInfo;
};
type TConfigB = { [key in keyof TConfig]: TConfig[key] & TTypeInfo };
class ServiceHelperB {
  constructor(injectObj: { http: any }) {}
  defineConfig(requestInfo: TRequestInfo): TConfigB {
    return {};
  }
  create<TConfig, P = {}, R = {}>(config: TConfigB) {
    return Object.entries(config).reduce(
      (res, [key, item]) => ({
        ...res,
        [key]: (
          params: Parameters<typeof item.define>
        ): Promise<ReturnType<typeof item.define>> =>
          Promise.resolve() as unknown as Promise<
            Parameters<typeof item.define>
          >,
      }),
      {}
    );
  }
}
