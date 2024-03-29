import protobuf from "protobufjs";
import {
  createLightNode,
  waitForRemotePeer,
  createEncoder,
  createDecoder,
  LightNode,
  Protocols,
} from "@waku/sdk";

const ContentTopic = "test2-whis-up-3/user/";

const SimpleMessage = new protobuf.Type("SimpleMessage").add(
  new protobuf.Field("text", 2, "string")
);

interface MessagePair {
  timestamp?: Date;
  message?: string;
}

const initWaku = async () => {
  const waku = await createLightNode({ defaultBootstrap: true });
  await waku.start();
  await waitForRemotePeer(waku, [
    Protocols.Filter,
    Protocols.LightPush,
    Protocols.Store,
  ]);

  if (waku.isConnected()) return waku;
  return null;
};

async function sendMessage(waku: LightNode, to: string, msg: string) {
  console.log("You're in Waku.");

  const timestamp = new Date().getTime();
  const protoMsg = SimpleMessage.create({
    timestamp: timestamp,
    text: msg,
  });
  const payload = SimpleMessage.encode(protoMsg).finish();
  const encoder = createEncoder({ contentTopic: ContentTopic + to });
  const x = await waku.lightPush.send(encoder, { payload });

  if (x && x.errors && x.errors.length > 0) {
    console.log("Error sending message");
    console.log(x.errors);
    return false;
  }
  // console.log(x.recipients);

  console.log("Message Sent:\n" + to + "\n" + msg);
  return true;
}

async function subscribeToContent(waku: LightNode, user: string) {
  const printMsg = (msg: any) => {
    console.log(decodeSimpleMessage(msg));
  };
  const decoder = createDecoder(ContentTopic + user);
  waku.filter.subscribe(decoder, printMsg);
}

async function getStoredMessage(waku: LightNode, user: string) {
  const decoder = createDecoder(ContentTopic + user);
  const storeQuery = waku.store.queryGenerator([decoder]);

  const messagePairs: MessagePair[] = [];

  for await (const messagesPromises of storeQuery) {
    const messages = await Promise.all(
      messagesPromises.map(async (p) => {
        const msg = await p;
        const timestamp = msg?.timestamp;
        const decodedMessage = decodeSimpleMessage(msg);

        const messagePair: MessagePair = {};
        if (timestamp && decodedMessage) {
          messagePair.timestamp = timestamp;
          messagePair.message = decodedMessage;

          messagePairs.push(messagePair);
        }
      })
    );
  }

  return messagePairs;
}

function decodeSimpleMessage(msg: any) {
  if (msg && msg.payload) {
    return SimpleMessage.decode(msg.payload).toJSON().text;
  }
  return null;
}

export { initWaku, sendMessage, subscribeToContent, getStoredMessage };

export type { MessagePair };
