/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */
import {
  DAIContract,
  DAI_TransferEntity,
  USDCContract,
  USDC_TransferEntity,
  USDTContract,
  USDT_TransferEntity,
  EventsSummaryEntity,
} from "generated";

export const GLOBAL_EVENTS_SUMMARY_KEY = "GlobalEventsSummary";

const INITIAL_EVENTS_SUMMARY: EventsSummaryEntity = {
  id: GLOBAL_EVENTS_SUMMARY_KEY,
  dAI_TransferCount: BigInt(0),
  uSDC_TransferCount: BigInt(0),
  uSDT_TransferCount: BigInt(0),
};

DAIContract.Transfer.loader(({ event, context }) => {
  context.EventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

DAIContract.Transfer.handler(({ event, context }) => {
  const summary = context.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

  const currentSummaryEntity: EventsSummaryEntity =
    summary ?? INITIAL_EVENTS_SUMMARY;

  const nextSummaryEntity = {
    ...currentSummaryEntity,
    dAI_TransferCount: currentSummaryEntity.dAI_TransferCount + BigInt(1),
  };

  const DAI_TransferEntity: DAI_TransferEntity = {
    id: event.transactionHash + event.logIndex.toString(),
    from: event.params.src,
    to: event.params.dst,
    value: event.params.wad,
    eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
  };

  context.EventsSummary.set(nextSummaryEntity);
  context.DAI_Transfer.set(DAI_TransferEntity);
});
USDCContract.Transfer.loader(({ event, context }) => {
  context.EventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

USDCContract.Transfer.handler(({ event, context }) => {
  const summary = context.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

  const currentSummaryEntity: EventsSummaryEntity =
    summary ?? INITIAL_EVENTS_SUMMARY;

  const nextSummaryEntity = {
    ...currentSummaryEntity,
    uSDC_TransferCount: currentSummaryEntity.uSDC_TransferCount + BigInt(1),
  };

  const USDC_TransferEntity: USDC_TransferEntity = {
    id: event.transactionHash + event.logIndex.toString(),
    from: event.params.from,
    to: event.params.to,
    value: event.params.value,
    eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
  };

  context.EventsSummary.set(nextSummaryEntity);
  context.USDC_Transfer.set(USDC_TransferEntity);
});

USDTContract.Transfer.loader(({ event, context }) => {
  context.EventsSummary.load(GLOBAL_EVENTS_SUMMARY_KEY);
});

USDTContract.Transfer.handler(({ event, context }) => {
  const summary = context.EventsSummary.get(GLOBAL_EVENTS_SUMMARY_KEY);

  const currentSummaryEntity: EventsSummaryEntity =
    summary ?? INITIAL_EVENTS_SUMMARY;

  const nextSummaryEntity = {
    ...currentSummaryEntity,
    uSDT_TransferCount: currentSummaryEntity.uSDT_TransferCount + BigInt(1),
  };

  const USDT_TransferEntity: USDT_TransferEntity = {
    id: event.transactionHash + event.logIndex.toString(),
    from: event.params.from,
    to: event.params.to,
    value: event.params.value,
    eventsSummary: GLOBAL_EVENTS_SUMMARY_KEY,
  };

  context.EventsSummary.set(nextSummaryEntity);
  context.USDT_Transfer.set(USDT_TransferEntity);
});
