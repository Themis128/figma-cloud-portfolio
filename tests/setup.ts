import { vi } from "vitest";

// Mock React hooks using a different approach
vi.mock("react", async () => {
  const originalModule = await vi.importActual("react");
  return {
    ...originalModule,
    useState: vi.fn().mockImplementation(() => [null, () => {}]),
    useMemo: vi.fn().mockImplementation((fn) => fn()),
    useEffect: vi.fn(),
    useContext: vi.fn(),
  };
});
