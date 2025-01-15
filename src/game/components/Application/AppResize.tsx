import { Box } from '@chakra-ui/react';
import { PropsWithChildren, useEffect, useRef } from 'react';

interface AppResizeProps {
  referenceWidth: number;
  referenceHeight: number;
}

export function AppResize({
  referenceWidth,
  referenceHeight,
  children,
}: PropsWithChildren<AppResizeProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flexRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = containerRef.current;
    const flex = flexRef.current;
    if (!box || !flex) return;

    const resizeObserver = new ResizeObserver(() => {
      // set the transform/scale of the <Flex> to fit into the box
      const boxRect = box.getBoundingClientRect();
      const scale = Math.min(
        boxRect.width / referenceWidth,
        boxRect.height / referenceHeight,
      );
      const actualWidth = referenceWidth * scale;
      const actualHeight = referenceHeight * scale;
      const translateX = (boxRect.width - actualWidth) / 2;
      const translateY = (boxRect.height - actualHeight) / 2;
      flex.style.transform = `scale(${scale}) translateX(${translateX}px) translateY(${translateY / scale}px)`;
    });
    resizeObserver.observe(box);

    return () => {
      resizeObserver.disconnect();
    };
  }, [referenceWidth, referenceHeight]);

  return (
    <Box
      data-label="Outer frame"
      ref={containerRef}
      w="full"
      h="full"
      overflow="hidden"
      bg="gray.600"
    >
      <Box
        bg="black"
        opacity={0.75}
        data-label="Reference Resolution Container"
        w={referenceWidth}
        h={referenceHeight}
        ref={flexRef}
        position="relative"
        transformOrigin="top left"
      >
        {children}
      </Box>
    </Box>
  );
}
