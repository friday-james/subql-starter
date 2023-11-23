import { Codec } from "@polkadot/types/types";
import { Vec } from "@polkadot/types-codec";
import { SubstrateEvent } from "@subql/types";
import { BioauthNewAuthentication, ImOnlineSomeOffline, Transfer } from "../types";
import { Balance } from "@polkadot/types/interfaces";

export async function handleBioauthNewAuthenticationEvent(
  substrateEvent: SubstrateEvent
): Promise<void> {
  const { event, block, idx } = substrateEvent;

  const {
    data: [validatorPublicKey],
  } = event;

  const record = BioauthNewAuthentication.create({
    id: `${block.block.header.number}-${idx}`,
    blockNumber: block.block.header.number.toNumber(),
    timestamp: block.timestamp,
    validatorPublicKey: validatorPublicKey.toString(),
  });
  await record.save();
}

export async function handleImonlineSomeOfflineEvent(
  substrateEvent: SubstrateEvent<[]>
): Promise<void> {
  const { event, block, idx } = substrateEvent;

  const {
    data: [offline],
  } = event;

  const record = ImOnlineSomeOffline.create({
    id: `${block.block.header.number}-${idx}`,
    blockNumber: block.block.header.number.toNumber(),
    timestamp: block.timestamp,
    accountIds: [],
  });

  for (const identification of offline as Vec<Codec>) {
    const [accountId, _fullIdentification] = identification as any as [
      Codec,
      Codec
    ];
    record.accountIds.push(accountId.toString());
  }
  await record.save();
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  // Get data from the event
  // The balances.transfer event has the following payload \[from, to, value\]
  // logger.info(JSON.stringify(event));
  const from = event.event.data[0];
  const to = event.event.data[1];
  const amount = event.event.data[2];

  // Create the new transfer entity
  const transfer = new Transfer(
    `${event.block.block.header.number.toNumber()}-${event.idx}`,
    from.toString(),
    to.toString(),
  );
  transfer.blockNumber = event.block.block.header.number.toBigInt();
  transfer.from = from.toString();
  transfer.to = to.toString();
  transfer.amount = (amount as Balance).toBigInt();
  await transfer.save();
}