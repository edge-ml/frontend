import React from "react";
import { Group, Button } from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";

const PageSelection = ({ currentPage, setPage, totalPages }) => {
  return (
    <Group gap="xs">
      <Button
        variant="default"
        size="compact-sm"
        onClick={() => setPage(1)}
        disabled={currentPage <= 1}
      >
        <IconChevronsLeft size={14} />
      </Button>
      <Button
        variant="default"
        size="compact-sm"
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <IconChevronLeft size={14} />
      </Button>
      <Button variant="outline" size="compact-sm" disabled>
        {currentPage}/{totalPages}
      </Button>
      <Button
        variant="default"
        size="compact-sm"
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <IconChevronRight size={14} />
      </Button>
      <Button
        variant="default"
        size="compact-sm"
        onClick={() => setPage(Number.MAX_SAFE_INTEGER)}
        disabled={currentPage >= totalPages}
      >
        <IconChevronsRight size={14} />
      </Button>
    </Group>
  );
};

export default PageSelection;
