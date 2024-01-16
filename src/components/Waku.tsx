import protobuf from "protobufjs";
import {
  createLightNode,
  waitForRemotePeer,
  createEncoder,
  createDecoder,
  bytesToUtf8,
  LightNode,
  Protocols,
  PageDirection,
} from "@waku/sdk";

const ContentTopic = "test-whis-up-3/user/";
const SimpleMessage = new protobuf.Type("SimpleMessage")
  .add(new protobuf.Field("timestamp", 1, "uint32"))
  .add(new protobuf.Field("text", 2, "string"));

const initWaku = async (user: string) => {
  const waku = await createLightNode({ defaultBootstrap: true });
  await waku.start();
  await waitForRemotePeer(waku, [
    Protocols.Filter,
    Protocols.LightPush,
    Protocols.Store,
  ]);
  console.log("Waku Connected");

  return waku;
};

async function SendMessage(waku: LightNode, to: string, msg: string) {
  console.log("You're in Waku.");
  console.log(to + "\n" + msg);

  const timestamp = new Date().getTime();
  const protoMsg = SimpleMessage.create({
    timestamp: timestamp,
    text: msg,
  });
  const payload = SimpleMessage.encode(protoMsg).finish();
  const encoder = createEncoder({ contentTopic: ContentTopic + to });
  const x = await waku.lightPush.send(encoder, { payload });
  console.log(x.errors);
  console.log(x.recipients[0].toString());
  const decoder = createDecoder(ContentTopic + to);
  // Create the store query
  const storeQuery = waku.store.queryGenerator([decoder]);

  // Process the messages
  for await (const messagesPromises of storeQuery) {
    // Fulfil the messages promises
    const messages = await Promise.all(
      messagesPromises.map(async (p) => {
        const msg = await p;
        // Render the message/payload in your application
        // console.log(msg);
        if (msg && msg.payload) {
            const payload = SimpleMessage.decode(msg.payload);
            console.log(payload);
        }
      })
    );
  }
  return true;
}

export { initWaku, SendMessage };
