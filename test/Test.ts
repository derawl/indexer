import assert from "assert";
import {
  TestHelpers,
  EventsSummaryEntity,
  DAI_TransferEntity,
} from "generated";
const { MockDb, DAI, Addresses } = TestHelpers;

import { GLOBAL_EVENTS_SUMMARY_KEY } from "../src/EventHandlers";

const MOCK_EVENTS_SUMMARY_ENTITY: EventsSummaryEntity = {
  id: GLOBAL_EVENTS_SUMMARY_KEY,
  dAI_TransferCount: BigInt(0),
  uSDC_TransferCount: BigInt(0),
  uSDT_TransferCount: BigInt(0),
};

describe("DAI contract Transfer event tests", () => {
  // Create mock db
  const mockDbInitial = MockDb.createMockDb();

  // Add mock EventsSummaryEntity to mock db
  const mockDbFinal = mockDbInitial.entities.EventsSummary.set(
    MOCK_EVENTS_SUMMARY_ENTITY
  );

  // Creating mock DAI contract Transfer event
  const mockDAITransferEvent = DAI.Transfer.createMockEvent({
    src: Addresses.defaultAddress,
    dst: Addresses.defaultAddress,
    wad: 0n,
    mockEventData: {
      chainId: 1,
      blockNumber: 0,
      blockTimestamp: 0,
      blockHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      srcAddress: Addresses.defaultAddress,
      transactionHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      transactionIndex: 0,
      logIndex: 0,
    },
  });

  // Processing the event
  const mockDbUpdated = DAI.Transfer.processEvent({
    event: mockDAITransferEvent,
    mockDb: mockDbFinal,
  });

  it("DAI_TransferEntity is created correctly", () => {
    // Getting the actual entity from the mock database
    let actualDAITransferEntity = mockDbUpdated.entities.DAI_Transfer.get(
      mockDAITransferEvent.transactionHash +
        mockDAITransferEvent.logIndex.toString()
    );

    // Creating the expected entity
    const expectedDAITransferEntity: DAI_TransferEntity = {
      id:
        mockDAITransferEvent.transactionHash +
        mockDAITransferEvent.logIndex.toString(),
      src: mockDAITransferEvent.params.src,
      dst: mockDAITransferEvent.params.dst,
      wad: mockDAITransferEvent.params.wad,
      eventsSummary: "GlobalEventsSummary",
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(
      actualDAITransferEntity,
      expectedDAITransferEntity,
      "Actual DAITransferEntity should be the same as the expectedDAITransferEntity"
    );
  });

  it("EventsSummaryEntity is updated correctly", async () => {
    // Getting the actual entity from the mock database
    let actualEventsSummaryEntity =
      await mockDbUpdated.entities.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

    // Creating the expected entity
    const expectedEventsSummaryEntity: EventsSummaryEntity = {
      ...MOCK_EVENTS_SUMMARY_ENTITY,
      dAI_TransferCount::
        MOCK_EVENTS_SUMMARY_ENTITY.DAI_TransferCount + BigInt(1),
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(
      actualEventsSummaryEntity,
      expectedEventsSummaryEntity,
      "Actual DAITransferEntity should be the same as the expectedDAITransferEntity"
    );
  });
});
