function SendMessage(to: string, msg: string) {
    console.log("You're in Waku.");
    console.log(to + "\n" + msg);

    return true;
}

export default SendMessage;