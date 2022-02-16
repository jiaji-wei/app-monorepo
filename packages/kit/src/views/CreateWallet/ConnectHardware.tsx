/* eslint-disable @typescript-eslint/no-unsafe-member-access, global-require, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires */
import React, { FC, useCallback, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';

import {
  Box,
  Center,
  Image,
  Modal,
  Typography,
  VStack,
} from '@onekeyhq/components';
import KeepDeviceAroundSource from '@onekeyhq/kit/assets/wallet/keep_device_close.png';
import {
  CreateWalletModalRoutes,
  CreateWalletRoutesParams,
} from '@onekeyhq/kit/src/routes/Modal/CreateWallet';
import Platform from '@onekeyhq/shared/src/platformEnv';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// A hack for document unfound on native error
// import LottieView from 'lottie-react';
let LottieViewNative: typeof import('lottie-react-native').default;
let LottieViewWeb: typeof import('lottie-react').default;
try {
  LottieViewNative = require('lottie-react-native');
} catch (e) {
  // Ignore
  console.debug('Error on require `lottie-react-native` module', e);
}
try {
  LottieViewWeb = require('lottie-react').default;
} catch (e) {
  // Ignore
  console.debug('Error on require `lottie-react` module', e);
}

type NavigationProps = NativeStackNavigationProp<
  CreateWalletRoutesParams,
  CreateWalletModalRoutes.CreateWalletModal
>;

/* TODO: use i18n keys when available */
const ConnectHardwareModal: FC = () => {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProps>();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectDevice = useCallback(() => {
    // TODO: await to ask bluetooth permission
    setIsConnecting(true);
    // Then start searching devices
    // Show device options when available
  }, []);

  // TODO: Move mobile and desktop screens into separate files
  // Mobile Connect Screen
  const renderConnectScreen = () => {
    if (!isConnecting) {
      return (
        <VStack space={8} w="full" alignItems="center">
          {/* FIXME: Web no `url-loader` error */}
          <Box size="358px">
            <Image size="358px" source={KeepDeviceAroundSource} />
          </Box>
          {/* <Box size="358px" /> */}

          <VStack space={2} alignItems="center">
            <Typography.DisplayLarge>Keep Device Close</Typography.DisplayLarge>
            <Typography.Body1 color="text-subdued" textAlign="center">
              Ensure device is powered on and in range, hold it still and click
              the button below to start the connection.
            </Typography.Body1>
          </VStack>
        </VStack>
      );
    }
    return (
      <VStack space={12} w="full" alignItems="center">
        <Box w="358px" h="220px">
          <LottieViewNative
            source={require('@onekeyhq/kit/assets/wallet/lottie_connect_onekey_by_bluetooth.json')}
            autoPlay
            loop
          />
        </Box>

        <VStack space={2} alignItems="center">
          <Typography.DisplayLarge>Looking for Devices</Typography.DisplayLarge>
          <Typography.Body1 color="text-subdued" textAlign="center">
            Please make sure your Bluetooth is enabled.
          </Typography.Body1>
        </VStack>
      </VStack>
    );
  };

  const content = Platform.isNative ? (
    <Center>{renderConnectScreen()}</Center>
  ) : (
    <VStack space={8} alignItems="center">
      <Box borderRadius="12px" bg="surface-neutral-subdued">
        {!!LottieViewWeb && (
          <LottieViewWeb
            // eslint-disable-next-line global-require
            animationData={require('@onekeyhq/kit/assets/wallet/lottie_connect_onekey_by_usb.json')}
            autoPlay
            loop
          />
        )}
      </Box>

      <Typography.DisplayMedium>
        Connect and unlock your device
      </Typography.DisplayMedium>
    </VStack>
  );

  // const footer = <Center pt={4} pb={8}></Center>;
  return (
    <Modal
      scrollViewProps={{
        pt: 4,
        children: content,
      }}
      hidePrimaryAction={!Platform.isNative}
      footer={!Platform.isNative || isConnecting ? null : undefined}
      primaryActionTranslationId="Connect Device"
      onPrimaryActionPress={handleConnectDevice}
      hideSecondaryAction
    />
  );
};

export default ConnectHardwareModal;
