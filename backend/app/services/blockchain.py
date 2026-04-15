"""BSC blockchain interaction service."""
from web3 import Web3
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

# ERC-20 ABI (minimal)
ERC20_ABI = [
    {"constant": True, "inputs": [], "name": "name", "outputs": [{"name": "", "type": "string"}], "type": "function"},
    {"constant": True, "inputs": [], "name": "symbol", "outputs": [{"name": "", "type": "string"}], "type": "function"},
    {"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"},
    {"constant": True, "inputs": [], "name": "totalSupply", "outputs": [{"name": "", "type": "uint256"}], "type": "function"},
    {"constant": True, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"},
    {"constant": False, "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "", "type": "bool"}], "type": "function"},
    {"constant": False, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "type": "function"},
    {"constant": True, "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}], "name": "allowance", "outputs": [{"name": "", "type": "uint256"}], "type": "function"},
]


def get_web3() -> Web3:
    """Get a connected Web3 instance."""
    w3 = Web3(Web3.HTTPProvider(settings.bsc_rpc_url))
    if not w3.is_connected():
        raise ConnectionError("Cannot connect to BSC RPC")
    return w3


def get_bnb_balance(address: str) -> float:
    """Get BNB balance for an address."""
    try:
        w3 = get_web3()
        checksum_addr = w3.to_checksum_address(address)
        balance_wei = w3.eth.get_balance(checksum_addr)
        return float(w3.from_wei(balance_wei, "ether"))
    except Exception as e:
        logger.error(f"Error getting BNB balance for {address}: {e}")
        return 0.0


def get_token_balance(token_address: str, wallet_address: str) -> dict:
    """Get ERC-20 token balance."""
    try:
        w3 = get_web3()
        token_contract = w3.eth.contract(
            address=w3.to_checksum_address(token_address),
            abi=ERC20_ABI,
        )
        decimals = token_contract.functions.decimals().call()
        symbol = token_contract.functions.symbol().call()
        raw_balance = token_contract.functions.balanceOf(
            w3.to_checksum_address(wallet_address)
        ).call()
        balance = raw_balance / (10 ** decimals)
        return {
            "symbol": symbol,
            "balance": balance,
            "raw_balance": raw_balance,
            "decimals": decimals,
        }
    except Exception as e:
        logger.error(f"Error getting token balance: {e}")
        return {"symbol": "UNKNOWN", "balance": 0.0, "raw_balance": 0, "decimals": 18}


def get_sophia_portfolio() -> dict:
    """Get Sophia's current portfolio."""
    try:
        bnb_balance = get_bnb_balance(settings.sophia_bsc_address)
        tabby_balance = get_token_balance(
            settings.tabby_contract_address,
            settings.sophia_bsc_address
        )
        return {
            "address": settings.sophia_bsc_address,
            "bnb_balance": bnb_balance,
            "tabby_balance": tabby_balance["balance"],
            "tokens": [tabby_balance],
        }
    except Exception as e:
        logger.error(f"Error getting Sophia portfolio: {e}")
        return {
            "address": settings.sophia_bsc_address,
            "bnb_balance": 0.0,
            "tabby_balance": 0.0,
            "tokens": [],
        }


def verify_transaction(tx_hash: str) -> dict:
    """Verify a BSC transaction."""
    try:
        w3 = get_web3()
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        if receipt:
            return {
                "confirmed": receipt["status"] == 1,
                "block_number": receipt["blockNumber"],
                "gas_used": receipt["gasUsed"],
                "from": receipt["from"],
                "to": receipt["to"],
            }
    except Exception as e:
        logger.error(f"Error verifying transaction {tx_hash}: {e}")
    return {"confirmed": False}


def get_tabby_token_info() -> dict:
    """Get TABBY token information."""
    try:
        w3 = get_web3()
        contract = w3.eth.contract(
            address=w3.to_checksum_address(settings.tabby_contract_address),
            abi=ERC20_ABI,
        )
        return {
            "address": settings.tabby_contract_address,
            "name": contract.functions.name().call(),
            "symbol": contract.functions.symbol().call(),
            "decimals": contract.functions.decimals().call(),
            "total_supply": contract.functions.totalSupply().call() / (10 ** 18),
        }
    except Exception as e:
        logger.error(f"Error getting TABBY token info: {e}")
        return {
            "address": settings.tabby_contract_address,
            "name": "TABBY",
            "symbol": "TABBY",
            "decimals": 18,
            "total_supply": 0,
        }
