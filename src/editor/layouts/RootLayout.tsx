import type { PropsWithChildren } from 'react';
import { HStack, Flex } from '@chakra-ui/react';

interface RootLayoutProps {}

export function RootLayout(props: PropsWithChildren<RootLayoutProps>) {
  return (
    <HStack w="100vw" h="100vh">
      <Flex grow={1}>{props.children}</Flex>
    </HStack>
  );
}
