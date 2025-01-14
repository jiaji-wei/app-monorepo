import React, { FC } from 'react';

import { useIntl } from 'react-intl';

import {
  Box,
  HStack,
  Icon,
  Select,
  Typography,
  VStack,
  useIsVerticalLayout,
} from '@onekeyhq/components';
import { useAppSelector } from '@onekeyhq/kit/src/hooks/redux';

import type { AccountType } from './index';

type RightHeaderProps = {
  activeAccountType: AccountType;
};

type CustomSelectTriggerProps = {
  isSelectVisible?: boolean;
  isTriggerHovered?: boolean;
};

const CustomSelectTrigger: FC<CustomSelectTriggerProps> = ({
  isSelectVisible,
  isTriggerHovered,
}) => (
  <Box
    p={2}
    borderRadius="xl"
    bg={
      // eslint-disable-next-line no-nested-ternary
      isSelectVisible
        ? 'surface-selected'
        : isTriggerHovered
        ? 'surface-hovered'
        : 'transparent'
    }
  >
    <Icon size={20} name="DotsHorizontalSolid" />
  </Box>
);

const HeaderTitle: FC<RightHeaderProps> = ({ activeAccountType }) => {
  const intl = useIntl();
  let title = '';
  if (activeAccountType === 'imported') {
    title = intl.formatMessage({ id: 'wallet__imported_accounts' });
  } else if (activeAccountType === 'watching') {
    title = intl.formatMessage({ id: 'wallet__watched_accounts' });
  }
  return <Typography.Body1Strong>{title}</Typography.Body1Strong>;
};

const RightHeader: FC<RightHeaderProps> = ({ activeAccountType }) => {
  const intl = useIntl();
  const isVerticalLayout = useIsVerticalLayout();
  const activeNetwork = useAppSelector((s) => s.general.activeNetwork);
  return (
    <HStack zIndex={99} py={3} px={4} space={4} alignItems="center">
      <VStack flex={1}>
        <HeaderTitle activeAccountType={activeAccountType} />
        <Typography.Caption color="text-subdued">
          {intl.formatMessage({ id: 'network__network' })}:{' '}
          {activeNetwork?.network?.name ?? '-'}
        </Typography.Caption>
      </VStack>
      {['hd', 'normal'].includes(activeAccountType) ? (
        <Select
          dropdownPosition="left"
          asAction
          options={[
            {
              label: intl.formatMessage({ id: 'action__edit' }),
              value: 'rename',
              iconProps: {
                name: isVerticalLayout ? 'PencilOutline' : 'PencilSolid',
              },
            },
            {
              label: intl.formatMessage({ id: 'action__backup' }),
              value: 'detail',
              iconProps: {
                name: isVerticalLayout
                  ? 'ShieldCheckOutline'
                  : 'ShieldCheckSolid',
              },
            },
            {
              label: intl.formatMessage({ id: 'action__delete_wallet' }),
              value: 'remove',
              iconProps: {
                name: isVerticalLayout ? 'TrashOutline' : 'TrashSolid',
              },
              destructive: true,
            },
          ]}
          headerShown={false}
          footer={null}
          containerProps={{ width: 'auto' }}
          dropdownProps={{
            width: 248,
          }}
          renderTrigger={(activeOption, isHovered, visible) => (
            <CustomSelectTrigger
              isTriggerHovered={isHovered}
              isSelectVisible={visible}
            />
          )}
        />
      ) : null}
    </HStack>
  );
};

export default RightHeader;
