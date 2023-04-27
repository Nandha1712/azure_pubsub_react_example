from flask import Flask, Blueprint, request
from flask import jsonify
from flask_cors import CORS
from azure.messaging.webpubsubservice import WebPubSubServiceClient
from datetime import datetime
from custom_logger import create_logger

# Reference given by Azure support team
# https://github.com/Azure/azure-webpubsub/tree/main/samples/javascript/chatapp/react
# In reference, they have given w.r.t nodejs as backend server.
# We have converted to python flask as backend.
# Refer following link for python reference.
# https://github.com/Azure/azure-webpubsub/tree/main/samples/python

CORS_ALLOWED_DOMAINS = {r"/*": {"origins": ["http://localhost:3000/*"]}}
HUB_NAME = "Hub"

ACCESS_KEY_VALUE = ""
PUBSUB_NAME = ""

CXN_STR = f"Endpoint=https://{PUBSUB_NAME}.webpubsub.azure.com;AccessKey={ACCESS_KEY_VALUE};Version=1.0;"


app_name = "Check2"
app = Flask(app_name)

blueprint_name = "blueprint" + app_name
app_api = Blueprint(blueprint_name, __name__)
logger = create_logger(app_name)


def get_req_group_name():
    return "testgroup"


@app_api.route('/', methods=['GET'])
def api0():
    logger.info("API call received: /")
    data = {"code": 200, "source": "api1", "message": "This service 2"}
    return jsonify(data)


@app_api.route('/negotiate', methods=['GET'])
def api1():
    logger.info("API call received: /api3")
    user_id = request.args.get('user_id')
    service = WebPubSubServiceClient.from_connection_string(CXN_STR, hub=HUB_NAME)


    group_name = get_req_group_name()
    required_roles = [f"webpubsub.sendToGroup.{group_name}", 
                      f"webpubsub.joinLeaveGroup.{group_name}"
                      ]

    # token = service.get_client_access_token(user_id=user_id, roles=required_roles);
    token = service.get_client_access_token(user_id=user_id)

    req_url = token['url']
    data = {"code": 200, "source": "api3", "message": "This service 2",
            "group_name": group_name,
            "token_url": req_url}

    logger.error(req_url)
    return jsonify(data)

@app_api.route('/group_name', methods=['GET'])
def get_group_name():
    logger.info("API call received: fetch group name")

    user_id = request.args.get('user_id')

    # group_name = user_id
    group_name = get_req_group_name()

    data = {"code": 200, "group_name": group_name, 
            "user_id": user_id, "message": "group_name is fetched successfully"}
    return jsonify(data)


@app_api.route('/send_data', methods=['GET'])
def api2():
    logger.info("API call received: send_data")
    service = WebPubSubServiceClient.from_connection_string(CXN_STR, hub=HUB_NAME)
    logger.info(service)
    logger.info(type(service))
    
    req_client = service
    data_to_send = {
        'from': 'user1',
        'data': 'Test3',
        'time': str(datetime.utcnow())
    }

    user_id = request.args.get('user_id')
    if user_id is None or str(user_id).strip() == "":
        return jsonify({"code": 403, "message": "Given User id is not valid"})

    # group_name = get_req_group_name()
    # res = req_client.send_to_group(group_name, data_to_send);

    res = req_client.send_to_user(user_id=user_id, message=data_to_send)

    logger.info(res)
    data = {"code": 200, "source": "send_data", "message": "This service 2"}
    return jsonify(data)


app.register_blueprint(app_api)

CORS(app, resources=CORS_ALLOWED_DOMAINS)

if __name__ == "__main__":
    app.run(port=3010, debug=True)
