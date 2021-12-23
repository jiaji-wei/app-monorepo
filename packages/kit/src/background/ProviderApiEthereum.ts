/* eslint-disable camelcase */
import { Alert } from 'react-native';

import { permissionRequired } from '@onekeyhq/inpage-provider/src/provider/decorators';
import {
  IInjectedProviderNames,
  IInpageProviderRequestData,
  IJsBridgeMessagePayload,
} from '@onekeyhq/inpage-provider/src/types';
import platformEnv from '@onekeyhq/shared/src/platformEnv';

import ProviderApiBase, {
  IProviderBaseBackgroundNotifyInfo,
} from './ProviderApiBase';

class ProviderApiEthereum extends ProviderApiBase {
  protected providerName = IInjectedProviderNames.ethereum;

  // @ts-expect-error
  @permissionRequired()
  eth_sendTransaction() {
    if (platformEnv.isExtension) {
      return new Promise(() => {
        chrome.windows.create({
          focused: true,
          type: 'popup',
          // init size same to ext ui-popup.html
          height: 600 + 50, // height including title bar, so should add 50 more
          width: 375,
          url: '/ui-popup.html?router=Approval#approval-window',
        });
      });
    }
    return Promise.resolve(this.rpcResult({ txid: '111110000' }));
  }

  async eth_requestAccounts(payload: IJsBridgeMessagePayload) {
    console.log('=============== confirm check');
    if (!this.walletApi.isConnected) {
      const title = `Confirm connect site: ${payload.origin as string}`;
      if (platformEnv.isNative) {
        await new Promise((resolve) => {
          Alert.alert('Confirm', title, [
            {
              text: 'NO',
              onPress: () => {
                console.log('Cancel Pressed');
                this.walletApi.isConnected = false;
                resolve(true);
              },
              style: 'cancel',
            },
            {
              text: 'YES',
              onPress: () => {
                console.log('OK Pressed');
                this.walletApi.isConnected = true;
                resolve(false);
              },
            },
          ]);
        });
      } else if (platformEnv.isExtension) {
        this.walletApi.isConnected = true;
      } else if (window.confirm(title)) {
        this.walletApi.isConnected = true;
      }
    }

    return this.eth_accounts();
  }

  eth_accounts() {
    return this.rpcResult(
      this.walletApi.isConnected ? [this.walletApi.selectedAddress] : [],
    );
  }

  eth_chainId() {
    return this.rpcResult(this.walletApi.chainId);
  }

  eth_blockNumber() {
    return this.rpcResult('0xd29f1a');
  }

  protected rpcCall(request: IInpageProviderRequestData): any {
    console.log('RPC CALL:', request);
  }

  notifyDappAccountsChanged(info: IProviderBaseBackgroundNotifyInfo): void {
    const data = {
      method: 'metamask_accountsChanged',
      params: [info.address],
    };
    info.send(data);
  }

  notifyDappChainChanged(info: IProviderBaseBackgroundNotifyInfo): void {
    const data = {
      method: 'metamask_chainChanged',
      params: { chainId: info.chainId },
    };
    info.send(data);
  }

  // TODO throwMethodNotFound
}

export default ProviderApiEthereum;