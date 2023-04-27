import React, { useState, useEffect } from 'react';
import { WebPubSubClient } from "@azure/web-pubsub-client";
// Reference given by Azure support team
// https://github.com/Azure/azure-webpubsub/tree/main/samples/javascript/chatapp/react

function AzurePubSubTest() {

    const [isConnectionStarted, setConnectionStarted] = useState(false);
    const [groupName, setGroupName] = useState("");

    const [chats, setChats] = useState([]);
    const [connected, setConnected] = useState(false);
    const [client, setClient] = useState(null);

    const [userID, setUserID] = useState(2);

    const handleUserIDChange = event => {
        setUserID(event.target.value);
    };

    // If we want to call connect function automatically.
    // Uncomment the following useEffect function

    // useEffect(() => {
    //     // async function. only runs once
    //     console.log('useEffect ran');
    //     connect();
    //   }, []); 

    async function connect() {
        console.log("Trying to connect...")

        let reqUrlGroupName = "http://localhost:3010/group_name?user_id=" + userID;
        // Call the api to get token result
        let api_resp_txt = (await fetch(reqUrlGroupName)).json();

        // Need to await to get json result from promise
        let result = await api_resp_txt;
        let reqGroupName = result.group_name;
        setGroupName(reqGroupName);
        console.log("Group name is ::", groupName, "::", reqGroupName);
        console.log(isConnectionStarted)
        
        if (isConnectionStarted) {
            // Avoid duplicate connection
            return;
        }

        let reqUrl = "http://localhost:3010/negotiate?user_id=" + userID;

        let client = new WebPubSubClient({
            getClientAccessUrl: async () => {
                setConnectionStarted(true);

                // Call the api to get token result
                let api_resp_txt = (await fetch(reqUrl)).json();
                
                // Need to await to get json result from promise
                let result = await api_resp_txt;

                let req_url;
                req_url = result.token_url;
                // console.log(req_url);
                return req_url;
            },
        });
         
        client.on("server-message", (e) => {
            let data;
            data = e.message.data;
            console.log("server-message received...", data, e)
            // data = {};
            appendMessage(data);
        });

        client.on("group-message", (e) => {
            // Will be called, if we are sending group message in backend
            // To receive group message, uncomment client.joinGroup 
            // line in this file
            // Also give correct roles while negotiating api
            let data;
            data = e.message.data;
            console.log("gm-message received...", data, e)
            // data = {};
            appendMessage(data);
        });

        client.on("connected", (e) => {
            console.log(`Connected: ${e.connectionId}.`);
        });

        function appendMessage(data) {
            setChats((prev) => [...prev, data]);
        }

        await client.start();
        console.log("groupName", reqGroupName);
        if (reqGroupName === undefined || reqGroupName === null || reqGroupName === "") {
            throw "Group name is invalid. Please check again";
        }

        // await client.joinGroup(reqGroupName);
        setConnected(true);
        setClient(client);
    }

    return (
        <>
            <div>Hello World</div>
            <div>
                <input
                    type="text"
                    id="userID"
                    name="userID"
                    onChange={handleUserIDChange}
                    value={userID}
                />

                <h2>User id is: {userID}</h2>
            </div>

            <div className="input-group-append">
                <button
                    className="btn btn-primary"
                    type="button"
                    disabled={false}
                    onClick={connect}
                >
                    Connect
                </button>
                <br />
                <br />
                <div>Messages: </div>
                <br />
                {chats.map(curr_val => {
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