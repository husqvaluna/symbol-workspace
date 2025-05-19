import WebSocket from "ws";

const host = "sym-test-01.opening-line.jp:3001";
const socket = new WebSocket("wss://" + host + "/ws");

socket.on("open", () => {
  console.info("Connection opened");
});

socket.on("close", () => {
  console.info("Connection closed");
});

socket.on("error", (error: any) => {
  console.info(error);
});

socket.on("message", (msg: string) => {
  try {
    const response = JSON.parse(msg);
    if ("uid" in response) {
      console.info(response);
      const subscribeTo = {
        uid: response.uid,
        subscribe: "status/TDK2E5VGKH4YSPVBYL2IPI2QFKXLDCSNHDOURRI",
      };
      socket.send(JSON.stringify(subscribeTo));
    } else {
      console.log(response);
    }
  } catch (error) {
    console.error(error);
  }
});
