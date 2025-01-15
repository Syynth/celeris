import { Box, BoxProps } from '@chakra-ui/react';

interface LayerProps extends Omit<BoxProps, 'zIndex'> {
  zIndex: number;
}

export function Layer(props: LayerProps) {
  return (
    <Box
      w="full"
      h="full"
      top={0}
      left={0}
      right={0}
      bottom={0}
      position="absolute"
      {...props}
    />
  );
}
