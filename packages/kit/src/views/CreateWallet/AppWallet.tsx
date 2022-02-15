import React, { FC } from 'react';

import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';

import {
  Center,
  HStack,
  Icon,
  Modal,
  Typography,
  VStack,
} from '@onekeyhq/components';
import PressableItem from '@onekeyhq/components/src/Pressable/PressableItem';
import {
  CreateWalletModalRoutes,
  CreateWalletRoutesParams,
} from '@onekeyhq/kit/src/routes/Modal/CreateWallet';

import { TabRoutes, TabRoutesParams } from '../../routes';
import {
  SettingsModalRoutes,
  SettingsRoutesParams,
} from '../Settings/Password/types';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProps = NativeStackNavigationProp<
  CreateWalletRoutesParams,
  CreateWalletModalRoutes.CreateWalletModal
> &
  NativeStackNavigationProp<TabRoutesParams, TabRoutes.Home> &
  NativeStackNavigationProp<
    SettingsRoutesParams,
    SettingsModalRoutes.SetPasswordModal
  >;

const AppWallet: FC = () => {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProps>();
  // const hasMasterPassword = true;
  const hasMasterPassword = false;

  const content = (
    <Center>
      <VStack space={4} w="full">
        {/* Create new wallet */}
        <PressableItem
          p="4"
          bg="surface-default"
          borderRadius="12px"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          onPress={() =>
            hasMasterPassword
              ? navigation.navigate(TabRoutes.Home)
              : navigation.navigate(SettingsModalRoutes.SetPasswordModal)
          }
        >
          <HStack space="4" alignItems="center">
            <Icon name="PlusCircleOutline" />
            <Typography.Body1>
              {intl.formatMessage({
                id: 'action__create_new_wallet',
              })}
            </Typography.Body1>
          </HStack>
          <Icon name="ChevronRightOutline" />
        </PressableItem>
        {/* Restore wallet */}
        <PressableItem
          p="4"
          bg="surface-default"
          borderRadius="12px"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          onPress={() =>
            // TODO: Restore wallet option page
            navigation.navigate(CreateWalletModalRoutes.CreateWalletModal)
          }
        >
          <HStack space="4" alignItems="center">
            <Icon name="RestoreOutline" />
            <Typography.Body1>
              {intl.formatMessage({
                id: 'action__restore_wallet',
              })}
            </Typography.Body1>
          </HStack>
          <Icon name="ChevronRightOutline" />
        </PressableItem>
      </VStack>
    </Center>
  );

  return (
    <Modal
      footer={null}
      header={intl.formatMessage({ id: 'wallet__app_wallet' })}
      scrollViewProps={{
        pt: 4,
        children: content,
      }}
    />
  );
};

export default AppWallet;
