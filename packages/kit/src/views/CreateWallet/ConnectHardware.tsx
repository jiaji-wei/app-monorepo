import React, { FC } from 'react';

import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';

import { Center, Modal, Typography, VStack } from '@onekeyhq/components';
import PressableItem from '@onekeyhq/components/src/Pressable/PressableItem';
import {
  CreateWalletModalRoutes,
  CreateWalletRoutesParams,
} from '@onekeyhq/kit/src/routes/Modal/CreateWallet';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProps = NativeStackNavigationProp<
  CreateWalletRoutesParams,
  CreateWalletModalRoutes.CreateWalletModal
>;

const ConnectHardwareModal: FC = () => {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProps>();

  const content = (
    <Center>
      <VStack space={8} w="full">
        <VStack space={2} alignItems="center">
          <Typography.DisplayLarge>Keep Device Close</Typography.DisplayLarge>
          <Typography.Body1 color="text-subdued">
            Ensure device is powered on and in range, hold it still and click
            the button below to start the connection.
          </Typography.Body1>
        </VStack>
      </VStack>
    </Center>
  );

  // const footer = <Center pt={4} pb={8}></Center>;

  return (
    <Modal
      // footer={footer}
      scrollViewProps={{
        pt: 4,
        children: content,
      }}
    />
  );
};

export default ConnectHardwareModal;
