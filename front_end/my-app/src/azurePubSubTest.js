import React, { useState, useEffect } from 'react';
import { WebPubSubClient } from "@azure/web-pubsub-client";
// Reference given by Azure support team
// https://github.com/Azure/azure-webpubsub/tree/main/samples/javascript/chatapp/react

function AzurePubSubTest() {

    const [user, setUser] = useState("");
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]);
    const [connected, setConnected] = useState(false);
    const [client, setClient] = useState(null);

    async function connect() {
        console.log("Trying to connect...")
        // let req_promise = (await fetch("http://localhost:3010/api3")).json();
        // req_promise.then(val => {
        //     let req_url = val.token_url;
        //     console.log(req_url);
        // });
        // return;

        let client = new WebPubSubClient({
            getClientAccessUrl: async () => {
                let api_resp_txt = (await fetch("http://localhost:3010/negotiate")).text();
                // let api_resp = JSON.parse(api_resp_txt);
                // let req_url = api_resp.token_url;
                // console.log(req_url);
                let req_url = api_resp_txt;
                return req_url;
            },
        });

        client.on("group-message", (e) => {
            let data;
            data = e.message.data;
            console.log("gm-message received...", data, e)
            // data = {};
            appendMessage(data);
        });

        client.on("connected", (e) => {
            console.log(`Connected: ${e.connectionId}.`);
        });

        // client.on("server-message", (e) => {
        //     let data;
        //     data = e.message.data;
        //     console.log(data);
        //     appendMessage(data);
        // });

        function appendMessage(data) {
            setChats((prev) => [...prev, data]);
        }

        await client.start();
        await client.joinGroup("testgroup");
        setConnected(true);
        setClient(client);
    }

    return (
        <>
            <div>Hello World</div>

            <div className="input-group-append">
                <button
                    className="btn btn-primary"
                    type="button"
                    disabled={false}
                    onClick={connect}
                >
                    Connect
                </button>
                <br/>
                <br/>
                <div>Messages: </div>
                <br/>
                {chats.map(curr_val=>{
                    return (<div key={JSON.stringify(curr_val)}>
                                <div>{JSON.stringify(curr_val)}</div>
                                <br></br>
                            </div>
                            )
                })}
            </div>
        </>

    )
}

export default AzurePubSubTest;