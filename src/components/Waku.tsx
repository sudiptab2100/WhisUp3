import protobuf from "protobufjs";
import {
  createLightNode,
  waitForRemotePeer,
  createEncoder,
  createDecoder,
  LightNode,
  Protocols,
} from "@waku/sdk";

const ContentTopic = "test-whis-up-3/user/";
const SimpleMessage = new protobuf.Type("SimpleMessage")
  .add(new protobuf.Field("timestamp", 1, "uint32"))
  .add(new protobuf.Field("text", 2, "string"));

const initWaku = async (user: string) => {
	const currentUser = await initMetamask();
	console.log(currentUser);
  const waku = await createLightNode({ defaultBootstrap: true });
  await waku.start();
  await waitForRemotePeer(waku, [
    Protocols.Filter,
    Protocols.LightPush,
    Protocols.Store,
  ]);
	await subscribeToContent(waku, user);
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
	await getStoredMessage(waku, to);
  return true;
}

async function subscribeToContent(waku: LightNode, user: string) {
	const printMsg = (msg: any) => {
		console.log(decodeSimpleMessage(msg));
	}
	const decoder = createDecoder(ContentTopic + user);
	waku.filter.subscribe(
		decoder,
		printMsg
	)
}

async function getStoredMessage(waku: LightNode, user: string) {
	const decoder = createDecoder(ContentTopic + user);
  // Create the store query
  const storeQuery = waku.store.queryGenerator([decoder]);

  // Process the messages
  for await (const messagesPromises of storeQuery) {
    // Fulfil the messages promises
    const messages = await Promise.all(
      messagesPromises.map(async (p) => {
        const msg = await p;
        // Render the message/payload in your application
				console.log(msg?.timestamp)
        console.log(decodeSimpleMessage(msg))
      })
    );
  }
}

function decodeSimpleMessage(msg: any) {
	if (msg && msg.payload) {
		return SimpleMessage.decode(msg.payload);
	}
	return null;
}

async function initMetamask() {
	const ethereum = (window as any).ethereum;
	if (ethereum) {
		const users = await ethereum.request({ method: "eth_requestAccounts" });
		return users[0];
	}
	return null;
}

export { initWaku, SendMessage };
