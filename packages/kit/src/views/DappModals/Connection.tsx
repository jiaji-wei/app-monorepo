import React, { useState } from 'react';

import { useNavigation } from '@react-navigation/core';
import { Column } from 'native-base';
import { useIntl } from 'react-intl';

import {
  Box,
  Center,
  CheckBox,
  Modal,
  Token,
  Typography,
} from '@onekeyhq/components';
import { Text } from '@onekeyhq/components/src/Typography';

import { DescriptionList, DescriptionListItem } from './DescriptionList';
import RugConfirmDialog from './RugConfirmDialog';

type PermissionType = 'view-addresses';
type Permission = {
  type: PermissionType;
  required: boolean;
};

const MockData = {
  account: {
    address: '0x4d16878c270x4d16878c270x4',
    name: 'ETH #1',
  },
  // target: {
  //   avatar:
  //     'https://raw.githubusercontent.com/Uniswap/interface/main/public/images/512x512_App_Icon.png',
  //   name: 'Uniswap',
  //   link: 'app.uniswap.org',
  // },
  target: {
    avatar:
      'https://raw.githubusercontent.com/pancakeswap/pancake-frontend/develop/public/logo.png',
    name: 'Pancakeswap',
    link: 'pancakeswap.finance',
  },
  permissions: [
    {
      type: 'view-addresses',
      required: true,
    },
    {
      type: 'A fake permission',
      required: false,
    },
  ] as Permission[],
};

const getPermissionTransId = (type: PermissionType) => {
  switch (type) {
    case 'view-addresses':
      return 'content__view_the_address_of_your_permitted_accounts_required';
    default:
      return type;
  }
};

const isRug = (target: string) => {
  const RUG_LIST = ['app.uniswap.org'];
  return RUG_LIST.some((item) => item.includes(target.toLowerCase()));
};

/* Connection Modal are use to accept user with permission to dapp */
const Connection = () => {
  const [rugConfirmDialogVisible, setRugConfirmDialogVisible] = useState(false);
  const intl = useIntl();
  const navigation = useNavigation();

  const computedIsRug = isRug(MockData.target.link);

  const [permissionValues, setPermissionValues] = React.useState(
    MockData.permissions.map(({ type }) => type),
  );

  return (
    <>
      {/* Rug warning Confirm Dialog */}
      <RugConfirmDialog
        visible={rugConfirmDialogVisible}
        onCancel={() => setRugConfirmDialogVisible(false)}
        onConfirm={() => {
          // Do something
        }}
      />
      {/* Main Modal */}
      <Modal
        primaryActionTranslationId="action__confirm"
        secondaryActionTranslationId="action__reject"
        header={intl.formatMessage({ id: 'title__approve' })}
        headerDescription={MockData.target.link}
        onPrimaryActionPress={({ onClose }) => {
          if (!computedIsRug) {
            // Do approve operation
            return onClose?.();
          }
          // Do confirm before approve
          setRugConfirmDialogVisible(true);
        }}
        onSecondaryActionPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
        scrollViewProps={{
          children: (
            // Add padding to escape the footer
            <Column flex="1" pb="20" space={6}>
              <Center>
                <Token src={MockData.target.avatar} size="56px" />
                <Typography.Heading mt="8px">
                  {MockData.target.name}
                </Typography.Heading>
              </Center>
              <DescriptionList>
                {/* Account */}
                <DescriptionListItem
                  title={intl.formatMessage({
                    id: 'content__account_lowercase',
                  })}
                  detail={
                    <Column alignItems="flex-end" w="auto" flex={1}>
                      <Text
                        typography={{ sm: 'Body1Strong', md: 'Body2Strong' }}
                      >
                        {MockData.account.name}
                      </Text>
                      <Typography.Body2 textAlign="right" color="text-subdued">
                        {MockData.account.address}
                      </Typography.Body2>
                    </Column>
                  }
                />
                {/* Interact target */}
                <DescriptionListItem
                  title={intl.formatMessage({
                    id: 'content__interact_with',
                  })}
                  detail={MockData.target.link}
                  isRug={computedIsRug}
                />
              </DescriptionList>

              {/* Permissions */}
              <Column space={2}>
                <Box>
                  <Typography.Subheading mt="24px" color="text-subdued">
                    {intl.formatMessage({
                      id: 'form__allow_this_site_to_uppercase',
                    })}
                  </Typography.Subheading>
                </Box>
                <CheckBox.Group
                  onChange={setPermissionValues}
                  value={permissionValues}
                  accessibilityLabel="choose numbers"
                >
                  {MockData.permissions.map((permission) => (
                    <CheckBox
                      value={permission.type}
                      isChecked={permission.required}
                      isDisabled={permission.required}
                      defaultIsChecked={permission.required}
                      my={2}
                      title={intl.formatMessage({
                        id: getPermissionTransId(permission.type),
                      })}
                    />
                  ))}
                </CheckBox.Group>
              </Column>
            </Column>
          ),
        }}
      />
    </>
  );
};

export default Connection;
