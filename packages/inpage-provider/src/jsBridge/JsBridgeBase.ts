// FIX: Uncaught ReferenceError: global is not defined
import 'core-js/es7/global';
import EventEmitter from 'eventemitter3';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';

import debugLogger from '@onekeyhq/shared/src/logger/debugLogger';

import {
  IInjectedProviderNamesStrings,
  IJsBridgeCallback,
  IJsBridgeConfig,
  IJsBridgeMessagePayload,
  IJsBridgeMessageTypes,
  IJsonRpcResponse,
} from '../types';

abstract class JsBridgeBase extends EventEmitter {
  constructor(config: IJsBridgeConfig = { debug: false }) {
    super();
    this.config = config;
    this.sendAsString = config.sendAsString ?? this.sendAsString;
    this.version = (process.env.VERSION as string) || '';
    if (this.config.receiveHandler) {
      this.on('message', this.globalOnMessage);
    }
    this.on('error', (error) =>
      console.error('OneKey JsBridge ERROR: ', error),
    );
  }

  protected isInjected = false;

  protected sendAsString = true;

  public globalOnMessageEnabled = true;

  private globalOnMessage = async (message: IJsBridgeMessagePayload) => {
    try {
      if (this.config.receiveHandler && this.globalOnMessageEnabled) {
        const returnValue: unknown = await this.config.receiveHandler(message);
        if (message.id) {
          this.response({
            id: message.id,
            scope: message.scope,
            remoteId: message.remoteId,
            data: returnValue,
          });
        }
      }
    } catch (error) {
      if (message.id && message.type === IJsBridgeMessageTypes.REQUEST) {
        this.responseError({
          id: message.id,
          remoteId: message.remoteId,
          error,
        });
      }
      // TODO custom Error class
      this.emit('error', error);
    } finally {
      // noop
    }
  };

  public version: string;

  public remoteInfo: {
    origin?: string;
    remoteId?: string | number | null;
  } = {
    origin: '',
    remoteId: '',
  };

  private config: IJsBridgeConfig;

  private callbacks: Array<IJsBridgeCallback> = [];

  private callbackId = 1;

  private createCallbackId(): number {
    this.callbackId += 1;
    return this.callbackId;
  }

  private createPayload(
    payload: IJsBridgeMessagePayload,
    {
      resolve,
      reject,
    }: {
      resolve?: (value: unknown) => void;
      reject?: (value: unknown) => void;
    },
  ) {
    const { id, type } = payload;
    if (resolve && reject && id && type === IJsBridgeMessageTypes.REQUEST) {
      if (this.callbacks[id]) {
        throw new Error(`JsBridgeError: callback exists, id=${id}`);
      }
      this.callbacks[id] = { id, resolve, reject, created: Date.now() };
    }

    // convert to plain error object which can be stringify
    if (payload.error) {
      // TODO use custom Error object
      payload.error = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        code: payload.error.code,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: payload.error.message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        stack: payload.error.stack,
      };
    }
    // TODO delete resolve, reject function can not be send
    return payload;
  }

  // TODO sendSync without Promise cache
  private send({
    type,
    data,
    error,
    id,
    remoteId,
    sync = false,
    scope,
  }: IJsBridgeMessagePayload) {
    const executor = (
      resolve?: (value: unknown) => void,
      reject?: (value: unknown) => void,
    ) => {
      // TODO check resolve when calling without await
      // eslint-disable-next-line @typescript-eslint/naming-convention
      let _id = id;
      if (!sync && type === IJsBridgeMessageTypes.REQUEST) {
        _id = this.createCallbackId();
      }
      const payload = this.createPayload(
        {
          id: _id,
          data,
          error,
          type,
          origin: global?.location?.origin || '',
          remoteId,
          scope,
        },
        { resolve, reject },
      );
      let payloadToSend: unknown = payload;
      if (this.sendAsString) {
        payloadToSend = JSON.stringify(payload);
      }
      debugLogger.jsBridge('send', payload.data, payload);
      // TODO sendPayload with function field and stringify?
      // TODO rename sendMessage
      this.sendPayload(payloadToSend as string);
      // TODO try catch and reject
    };
    if (sync) {
      executor();
    } else {
      return new Promise(executor) as Promise<IJsonRpcResponse<unknown>>;
    }
  }

  public receive(
    payloadReceived: string | IJsBridgeMessagePayload = '',
    sender?: {
      origin?: string;
      internal?: boolean;
    },
  ) {
    let payload: IJsBridgeMessagePayload = {
      data: null,
    };

    if (isPlainObject(payloadReceived)) {
      payload = payloadReceived as IJsBridgeMessagePayload;
    }
    if (isString(payloadReceived)) {
      // TODO try catch
      payload = JSON.parse(payloadReceived) as IJsBridgeMessagePayload;
    }

    // !IMPORTANT: force overwrite origin and internal field
    //    DO NOT trust dapp params
    payload.origin = sender?.origin;
    payload.internal = Boolean(sender?.internal);

    if (!payload.origin && !this.isInjected) {
      throw new Error('JsBridge receive message [payload.origin] is required.');
    }

    if (!payload.internal && !payload.scope) {
      throw new Error(
        'JsBridge receive message [payload.scope] is required for non-internal method call.',
      );
    }

    debugLogger.jsBridge('receive', payload.data, payload, sender);

    const { type, id, data, error, origin, remoteId } = payload;
    this.remoteInfo = {
      origin,
      remoteId,
    };

    // TODO origin validation check

    if (type === IJsBridgeMessageTypes.RESPONSE) {
      if (id === undefined || id === null) {
        throw new Error(
          'id is required in JsBridge receive() REQUEST type message',
        );
      }
      // TODO resolveCallback() rejectCallback() finallyCallback(resolve,reject)
      const callbackInfo = this.callbacks[id];
      if (callbackInfo) {
        try {
          if (error) {
            if (callbackInfo.reject) {
              callbackInfo.reject(error);
            }
            this.emit('error', error);
          } else if (callbackInfo.resolve) {
            callbackInfo.resolve(data);
          }
        } catch (error0) {
          this.emit('error', error0);
        } finally {
          // TODO timeout reject
          // TODO auto clean callbacks
          delete this.callbacks[id];
        }
      }
    } else if (type === IJsBridgeMessageTypes.REQUEST) {
      const eventMessagePayload = {
        ...payload,
        created: Date.now(),
      };
      // TODO onReceive/responseMessage -> auto response resolve, catch error reject
      // TODO add an internal try catch on('message')
      // https://nodejs.org/api/events.html#capture-rejections-of-promises
      this.emit('message', eventMessagePayload);
    } else {
      throw new Error(
        `JsBridge payload type not support yet (type=${type || 'undefined'})`,
      );
    }
  }

  public requestSync({
    data,
    scope,
    remoteId,
  }: {
    data: unknown;
    scope?: IInjectedProviderNamesStrings;
    remoteId?: number | string | null;
  }): void {
    this.send({
      type: IJsBridgeMessageTypes.REQUEST,
      scope,
      data,
      remoteId,
      sync: true,
    });
  }

  // TODO requestTo(remoteId, data)
  public request(info: {
    data: unknown;
    remoteId?: number | string | null;
    scope?: IInjectedProviderNamesStrings;
  }): Promise<IJsonRpcResponse<unknown>> {
    const { data, remoteId, scope } = info;
    // @ts-ignore
    return this.send({
      type: IJsBridgeMessageTypes.REQUEST,
      data,
      remoteId,
      sync: false,
      scope,
    });
  }

  // send response message to remote
  public response({
    id,
    data,
    remoteId,
    scope,
  }: {
    id: number;
    data: unknown;
    scope?: IInjectedProviderNamesStrings;
    remoteId?: number | string | null;
  }): void {
    // if (error) {
    //   console.error(error);
    // }
    // TODO error reject
    this.send({
      type: IJsBridgeMessageTypes.RESPONSE,
      data,
      id,
      remoteId,
      scope,
      sync: true,
    });
  }

  // send response ERROR to remote
  public responseError({
    id,
    error,
    remoteId,
  }: {
    id: number;
    error: unknown;
    remoteId?: number | string | null;
  }): void {
    // if (error) {
    //   console.error(error);
    // }
    // TODO error reject
    this.send({
      type: IJsBridgeMessageTypes.RESPONSE,
      error,
      id,
      remoteId,
      sync: true,
    });
  }

  abstract sendPayload(payload: IJsBridgeMessagePayload | string): void;
}

export default JsBridgeBase;
