import midtransclient
import os
from dotenv import load_dotenv

load_dotenv()

snap = midtransclient.Snap(
    is_production=os.getenv("MIDTRANS_IS_PRODUCTION", "False") == "True",
    server_key=os.getenv("MIDTRANS_SERVER_KEY"),
    client_key=os.getenv("MIDTRANS_CLIENT_KEY"),
)


def create_snap_token(order_id, gross_amount, customer_details, item_details):
    param = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": gross_amount,
        },
        "item_details": item_details,
        "customer_details": customer_details,
        "credit_card": {"secure": True},
    }
    tx = snap.create_transaction(param)
    return tx["token"], tx["redirect_url"]
